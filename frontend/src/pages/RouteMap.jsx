import { useEffect, useState } from 'react';
import { Navigation, Camera, Loader2, ArrowDownUp, Plus, X, ExternalLink } from 'lucide-react';
import { api } from '../api.js';
import MapView from '../components/MapView.jsx';
import { Page, ErrorBox, Notice } from '../components/UI.jsx';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RouteMap() {
  const [from, setFrom] = useState('Bengaluru');
  const [to, setTo] = useState('Mysuru');
  const [stops, setStops] = useState([]);
  const [stopInput, setStopInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState(null);
  const [cam, setCam] = useState('');

  useEffect(() => { api('/geo/live-camera').then((d) => setCam(d.message)).catch(() => {}); }, []);

  function addStop(e) {
    e.preventDefault();
    const value = stopInput.trim();
    if (!value) return;
    if (stops.length >= 6) return setErr('You can add up to 6 extra stops.');
    setStops((old) => [...old, value]);
    setStopInput('');
    setErr('');
  }

  async function go(e) {
    e.preventDefault();
    const names = [from.trim(), ...stops.map((s) => s.trim()), to.trim()];
    if (!from.trim() || !to.trim()) return setErr('Please enter both a starting point and a destination.');
    if (names.some((name) => !name)) return setErr('Please check each location.');
    setBusy(true); setErr(''); setRes(null);
    try {
      const pts = [];
      for (let i = 0; i < names.length; i += 1) {
        const d = await api('/geo/search?q=' + encodeURIComponent(names[i]));
        if (!d.results?.[0]) throw new Error('Could not find "' + names[i] + '". Try adding the city or state.');
        pts.push({ ...d.results[0], label: names[i] });
        if (i < names.length - 1) await sleep(1100);
      }
      const route = await api('/geo/route', { method: 'POST', body: { points: pts.map(({ lat, lon }) => ({ lat, lon })) } });
      setRes({ pts, route });
    } catch (error) {
      setErr(error.message || 'We could not build this route. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function swapLocations() {
    setFrom(to);
    setTo(from);
    setRes(null);
  }

  const markers = res?.pts.map((point, index) => ({
    lat: point.lat, lon: point.lon, label: point.label,
    sub: index === 0 ? 'Starting point' : index === res.pts.length - 1 ? 'Destination' : 'Stop ' + index,
    color: index === 0 ? '#A7A18C' : index === res.pts.length - 1 ? '#A94D3D' : '#67252A',
    text: index === 0 ? 'A' : index === res.pts.length - 1 ? 'B' : String(index + 1),
  }));

  const googleUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(from) +
    '&destination=' + encodeURIComponent(to) +
    (stops.length ? '&waypoints=' + encodeURIComponent(stops.join('|')) : '') +
    '&travelmode=driving';

  return (
    <Page title="Maps and route planner" subtitle="Plan a journey with a clear start, destination and optional stops.">
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={go} className="card space-y-4 lg:col-span-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-wine">Your journey</p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">Where would you like to go?</h2>
          </div>
          <div className="route-fields">
            <label className="block text-sm font-semibold text-ink">
              <span className="mb-1.5 flex items-center gap-2"><span className="route-dot route-dot-start" /> From</span>
              <input className="input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Enter starting location" autoComplete="off" />
            </label>
            <div className="flex justify-end">
              <button type="button" className="btn-ghost !min-h-9 !px-3" onClick={swapLocations} aria-label="Swap starting point and destination" title="Swap From and To">
                <ArrowDownUp className="h-4 w-4" /> Swap
              </button>
            </div>
            <label className="block text-sm font-semibold text-ink">
              <span className="mb-1.5 flex items-center gap-2"><span className="route-dot route-dot-end" /> To</span>
              <input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Enter destination" autoComplete="off" />
            </label>
          </div>
          <div className="border-t border-brand-wine/10 pt-3">
            <p className="mb-2 text-sm font-semibold text-ink">Add stops <span className="font-normal text-slate-500">(optional)</span></p>
            <div className="flex gap-2">
              <input className="input min-w-0" value={stopInput} onChange={(e) => setStopInput(e.target.value)} placeholder="Add a place along the way" />
              <button type="button" className="btn-ghost" onClick={addStop} aria-label="Add stop"><Plus className="h-4 w-4" /></button>
            </div>
            {stops.length > 0 && <ol className="mt-2 space-y-2">{stops.map((stop, index) => (
              <li key={index} className="flex items-center justify-between rounded-xl bg-brand-ivory px-3 py-2 text-sm">
                <span>{index + 1}. {stop}</span>
                <button type="button" onClick={() => setStops((old) => old.filter((_, i) => i !== index))} aria-label={'Remove ' + stop}><X className="h-4 w-4" /></button>
              </li>
            ))}</ol>}
          </div>
          <a className="btn-accent w-full" href={googleUrl} target="_blank" rel="noreferrer noopener"><ExternalLink className="h-4 w-4" /> Open in Google Maps</a>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {busy ? 'Building your route...' : 'Find my route'}
          </button>
          <ErrorBox error={err} />
          {busy && <p className="text-xs text-slate-500">Searching locations one at a time to respect the free map services.</p>}
        </form>
        <div className="space-y-4 lg:col-span-2">
          <div className="card overflow-hidden p-2 sm:p-3">
            <MapView markers={markers || []} route={res?.route.geometry} className="h-[24rem] sm:h-[30rem]" />
          </div>
          {res && (
            <div className="card space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-brand-ivory p-3"><p className="text-xs text-slate-600">Distance</p><p className="font-display text-2xl font-bold text-ink">{res.route.distanceKm} km</p></div>
                <div className="rounded-2xl bg-brand-ivory p-3"><p className="text-xs text-slate-600">Estimated time</p><p className="font-display text-2xl font-bold text-ink">{Math.floor(res.route.durationMin / 60)}h {res.route.durationMin % 60}m</p></div>
              </div>
              <p className="text-sm text-slate-600">Route: {res.pts.map((point) => point.label).join(' → ')}</p>
              <a className="btn-primary w-full sm:w-auto" href={googleUrl} target="_blank" rel="noreferrer noopener"><ExternalLink className="h-4 w-4" /> Start navigation in Google Maps</a>
              <details className="text-sm" open>
                <summary className="cursor-pointer font-semibold text-brand-wine">Turn-by-turn directions</summary>
                <ol className="mt-2 max-h-72 list-decimal space-y-2 overflow-y-auto pl-5">{res.route.steps.map((step, index) => <li key={index}>{step.text} ({step.distanceM} m)</li>)}</ol>
              </details>
              <p className="text-xs text-slate-500">Route estimates use OpenStreetMap-based routing and do not include live traffic. Google Maps opens separately for navigation.</p>
            </div>
          )}
          <Notice><span className="mb-1 flex items-center gap-2 font-semibold"><Camera className="h-4 w-4" /> Live camera footage</span>{cam || 'No authorised live camera source is connected. MYRAVO never shows fake footage.'}</Notice>
        </div>
      </div>
    </Page>
  );
}
