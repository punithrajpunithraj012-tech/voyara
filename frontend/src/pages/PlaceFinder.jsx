import { useState } from 'react';
import { Search, LocateFixed, ExternalLink, Phone, Globe, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import { findGeoapifyPlaces } from '../geoapify.js';
import MapView from '../components/MapView.jsx';
import { Page, ErrorBox, Notice } from '../components/UI.jsx';

export function PlaceList({ places }) {
  if (!places?.length) return <p className="text-sm text-slate-500">No named places found here in OpenStreetMap. Try a bigger radius or a larger town.</p>;
  return (
    <ul className="space-y-2">
      {places.map((p) => (
        <li key={p.id} className="rounded-xl bg-sand p-3">
          <p className="font-semibold text-ink">{p.name}</p>
          <p className="text-xs text-slate-600">{[p.kind, p.cuisine && `cuisine: ${p.cuisine}`, `${p.distanceKm} km away`].filter(Boolean).join(' | ')}</p>
          {p.address && <p className="text-xs text-slate-600">{p.address}</p>}
          {p.openingHours && <p className="text-xs text-slate-600">Hours (OpenStreetMap): {p.openingHours}</p>}
          <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-violet">
            <a href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Open map</a>
            {p.phone && <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {p.phone}</a>}
            {p.website && /^https?:\/\//.test(p.website) && <a href={p.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> Website</a>}
          </div>
        </li>))}
    </ul>
  );
}

const COLORS = { attractions: '#5B3FF0', restaurants: '#FF6B4A', hotels: '#2F7BFF', hospitals: '#E11D48', police: '#0B1437', pharmacy: '#00C2B8', gems: '#00C2B8' };
const GEOAPIFY_CATEGORIES = { hospitals: 'healthcare.hospital,healthcare.clinic', police: 'service.police', pharmacy: 'healthcare.pharmacy' };

export default function PlaceFinder({ title, subtitle, types, radius: defaultRadius = 5000, note, locate, extra }) {
  const [q, setQ] = useState(''); const [type, setType] = useState(types[0][0]); const [radius, setRadius] = useState(defaultRadius);
  const [where, setWhere] = useState(null); const [places, setPlaces] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');

  async function load(loc, t = type, r = radius) {
    setBusy(true);
    setErr('');
    try {
      setPlaces(await findGeoapifyPlaces(loc, t, r));
    } catch (e) {
      setErr(e.message);
      setPlaces(null);
    } finally {
      setBusy(false);
    }
  }
  async function search(e) {
    e.preventDefault(); if (q.trim().length < 2) return;
    setBusy(true); setErr('');
    try {
      const d = await api('/geo/search?q=' + encodeURIComponent(q.trim()));
      if (!d.results.length) { setBusy(false); return setErr(`No place called "${q}" was found. Try adding the state or country.`); }
      setWhere(d.results[0]); await load(d.results[0]);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }
  function locateMe() {
    if (!navigator.geolocation) return setErr('This browser does not support location.');
    navigator.geolocation.getCurrentPosition((pos) => { const loc = { name: 'Your location', lat: pos.coords.latitude, lon: pos.coords.longitude }; setWhere(loc); load(loc); },
      () => setErr('Location access was blocked. Allow it in your browser, or search for a place instead.'));
  }
  const markers = [...(where ? [{ lat: where.lat, lon: where.lon, label: where.name.split(',')[0], sub: 'Search centre', color: '#FF6B4A', text: '★' }] : []),
    ...(places || []).map((p) => ({ lat: p.lat, lon: p.lon, label: p.name, sub: p.kind, color: COLORS[type] || '#5B3FF0' }))];

  return (
    <Page title={title} subtitle={subtitle}>
      <div className="space-y-4">
        {extra}
        <form onSubmit={search} className="card flex flex-wrap gap-2">
          <input className="input min-w-[12rem] flex-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a city, town or area" aria-label="Location" />
          {types.length > 1 && <select className="input !w-auto" value={type} onChange={(e) => { setType(e.target.value); where && load(where, e.target.value); }} aria-label="Category">{types.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}
          <select className="input !w-auto" value={radius} onChange={(e) => { setRadius(+e.target.value); where && load(where, type, +e.target.value); }} aria-label="Radius">{[2000, 5000, 10000, 15000, 25000].map((r) => <option key={r} value={r}>{r / 1000} km</option>)}</select>
          <button className="btn-primary"><Search className="h-4 w-4" /> Search</button>
          {locate && <button type="button" className="btn-ghost" onClick={locateMe}><LocateFixed className="h-4 w-4" /> Use my location</button>}
        </form>
        <ErrorBox error={err} />
        {note && <Notice>{note}</Notice>}
        {busy && <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Searching OpenStreetMap...</div>}
        {where && (
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="card lg:col-span-3"><MapView markers={markers} className="h-[28rem]" /></div>
            <div className="card max-h-[32rem] overflow-y-auto lg:col-span-2">
              <p className="mb-2 text-sm text-slate-600">Near <b className="text-ink">{where.name.split(',').slice(0, 2).join(',')}</b></p>
              {places && <PlaceList places={places} />}
              <p className="mt-3 text-xs text-slate-500">Source: OpenStreetMap via Overpass API. Community data: no ratings, reviews or live information.</p>
            </div>
          </div>)}
        {!where && !busy && <p className="text-center text-sm text-slate-500">Search for a place to see results on the map.</p>}
      </div>
    </Page>
  );
}
