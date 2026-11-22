import { getGeoapifyKey } from './api.js';

export async function findGeoapifyPlaces(loc, type, radius) {
  const key = getGeoapifyKey();
  if (!key) throw new Error('Add your Geoapify API key in Profile.');

  const categories = {
  hospitals: 'healthcare.hospital,healthcare.clinic_or_praxis',
  police: 'service.police',
  pharmacy: 'healthcare.pharmacy',
  restaurants: 'catering.restaurant,catering.cafe,catering.fast_food',
  hotels: 'accommodation',
  attractions: 'tourism',
  gems: 'natural,national_park,beach,tourism.sights'
};

  const url = new URL('https://api.geoapify.com/v2/places');
  url.searchParams.set('categories', categories[type]);
  url.searchParams.set('filter', `circle:${loc.lon},${loc.lat},${radius}`);
  url.searchParams.set('limit', '40');
  url.searchParams.set('apiKey', key);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Geoapify search failed.');
  }

  return (data.features || []).map((feature) => {
    const p = feature.properties || {};
    const [lon, lat] = feature.geometry.coordinates;

    return {
      id: p.place_id || `${lat}-${lon}`,
      name: p.name || p.address_line1 || p.formatted || 'Unnamed place',
      kind: type,
      lat,
      lon,
      distanceKm: p.distance ? +(p.distance / 1000).toFixed(1) : 0,
      address: p.formatted || ''
    };
  });
}