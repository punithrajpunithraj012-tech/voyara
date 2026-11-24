// Real data only: OpenStreetMap Nominatim (search), Overpass (places), OSRM (routes), Open-Meteo (weather).
// None of these need an API key. Results are cached briefly to be polite to the free public servers.
import { Router } from 'express';
import { z } from 'zod';
import { parse, wrap } from '../auth.js';

const r = Router();
const cache = new Map();
const UA = () => `MYRAVO/1.0 (https://voyara-iota.vercel.app; ${process.env.GEO_CONTACT || 'map-search'})`;

async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttlMs });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return val;
}
async function getJson(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { 'User-Agent': UA(), ...(opts.headers || {}) }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) { console.error(`GEO UPSTREAM ERROR: ${res.status} ${url}`); const e = new Error(`External service responded ${res.status}`); e.status = 502; throw e; }
  return res.json();
}

export const haversineKm = (a, b) => {
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export async function geocode(q) {
  const data = await cached(`g:${q.toLowerCase()}`, 3600e3, () =>
    getJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`));
  return data.map((d) => ({ name: d.display_name, lat: +d.lat, lon: +d.lon }));
}

const FILTERS = {
  attractions: ['["tourism"~"^(attraction|museum|viewpoint|gallery|zoo|theme_park)$"]', '["historic"~"^(monument|castle|fort|memorial|archaeological_site)$"]'],
  hotels: ['["tourism"~"^(hotel|guest_house|hostel|motel|apartment)$"]'],
  restaurants: ['["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]'],
  hospitals: ['["amenity"~"^(hospital|clinic)$"]'],
  police: ['["amenity"="police"]'],
  pharmacy: ['["amenity"="pharmacy"]'],
  gems: ['["natural"~"^(waterfall|peak|beach|cave_entrance|hot_spring)$"]', '["tourism"="viewpoint"]', '["historic"~"^(ruins|wayside_shrine|archaeological_site)$"]'],
  indoor: ['["tourism"~"^(museum|gallery|aquarium)$"]', '["amenity"~"^(cinema|library|theatre|arts_centre)$"]', '["shop"="mall"]'],
};

export async function findPlaces({ lat, lon, type, radius = 5000, limit = 40 }) {
  const filters = FILTERS[type];
  if (!filters) { const e = new Error('Unknown place type.'); e.status = 400; throw e; }
  const around = `(around:${radius},${lat},${lon})`;
  const body = `[out:json][timeout:20];(${filters.map((f) => `nwr${f}["name"]${around};`).join('')});out center ${limit * 2};`;
  const key = `p:${type}:${lat.toFixed(3)}:${lon.toFixed(3)}:${radius}`;
  const data = await cached(key, 600e3, async () => {
    const payload = { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(body) };
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.private.coffee/api/interpreter'
    ];
    let lastError;
    for (const endpoint of endpoints) {
      try { return await getJson(endpoint, payload); }
      catch (error) { lastError = error; }
    }
    const error = new Error('Nearby place search is temporarily busy. Try again in a moment, or use Search Google Maps for broader results.');
    error.status = 503;
    error.cause = lastError;
    throw error;
  });
  const seen = new Set();
  return data.elements.map((e) => {
    const t = e.tags || {};
    return { id: `${e.type}/${e.id}`, name: t.name, kind: t.tourism || t.amenity || t.historic || t.natural || t.shop,
      lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon,
      cuisine: t.cuisine, address: [t['addr:street'], t['addr:city']].filter(Boolean).join(', ') || undefined,
      phone: t.phone || t['contact:phone'], website: t.website || t['contact:website'], openingHours: t.opening_hours };
  }).filter((p) => p.name && p.lat && p.lon && !seen.has(p.name) && seen.add(p.name))
    .map((p) => ({ ...p, distanceKm: +haversineKm({ lat, lon }, p).toFixed(1) }))
    .sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

export async function forecast(lat, lon) {
  const d = await cached(`w:${lat.toFixed(2)}:${lon.toFixed(2)}`, 900e3, () => getJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=7`));
  return {
    current: { tempC: d.current.temperature_2m, windKmh: d.current.wind_speed_10m, code: d.current.weather_code },
    days: d.daily.time.map((date, i) => ({ date, code: d.daily.weather_code[i], maxC: d.daily.temperature_2m_max[i], minC: d.daily.temperature_2m_min[i],
      rainChance: d.daily.precipitation_probability_max[i], rainMm: d.daily.precipitation_sum[i] })),
    source: 'Open-Meteo',
  };
}

export async function route(points, profile = 'driving') {
  const coords = points.map((p) => `${p.lon},${p.lat}`).join(';');
  const d = await getJson(`https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`);
  if (d.code !== 'Ok' || !d.routes?.[0]) { const e = new Error('No drivable route was found between these points.'); e.status = 404; throw e; }
  const rt = d.routes[0];
  return {
    distanceKm: +(rt.distance / 1000).toFixed(1), durationMin: Math.round(rt.duration / 60),
    geometry: rt.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    steps: rt.legs.flatMap((l) => l.steps).map((s) => ({
      text: [s.maneuver.type, s.maneuver.modifier, s.name && `on ${s.name}`].filter(Boolean).join(' '),
      distanceM: Math.round(s.distance) })),
    source: 'OSRM public demo server (OpenStreetMap data)',
  };
}

r.get('/search', wrap(async (req, res) => {
  const { q } = parse(z.object({ q: z.string().trim().min(1).max(120) }), req.query);
  res.json({ results: await geocode(q), source: 'OpenStreetMap Nominatim' });
}));
r.get('/places', wrap(async (req, res) => {
  const q = parse(z.object({ lat: z.coerce.number().min(-90).max(90), lon: z.coerce.number().min(-180).max(180),
    type: z.string(), radius: z.coerce.number().min(500).max(30000).default(5000) }), req.query);
  res.json({ places: await findPlaces(q), source: 'OpenStreetMap via Overpass API (community data: no ratings, reviews or live hours)' });
}));
r.get('/weather', wrap(async (req, res) => {
  const q = parse(z.object({ lat: z.coerce.number().min(-90).max(90), lon: z.coerce.number().min(-180).max(180) }), req.query);
  res.json(await forecast(q.lat, q.lon));
}));
r.post('/route', wrap(async (req, res) => {
  const { points } = parse(z.object({ points: z.array(z.object({ lat: z.number(), lon: z.number() })).min(2).max(25) }), req.body);
  res.json(await route(points));
}));
// Live cameras: no authorised public feed source is integrated. We say so instead of faking one.
r.get('/live-camera', (_req, res) => res.json({ available: false,
  message: 'No authorised live camera source is connected for this location. Voyara never shows fake footage.' }));

export default r;
