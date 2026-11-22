import { useEffect, useState } from 'react';
import { Navigation, Camera, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import MapView from '../components/MapView.jsx';
import { Page, ErrorBox, Notice } from '../components/UI.jsx';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const km = (a, b) => { const R = 6371, r = (x) => x * Math.PI / 180, dl = r(b.lat - a.lat), dn = r(b.lon - a.lon); const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
function nearest(pts) { const left = pts.slice(1), out = [pts[0]]; while (left.length) { const c = out.at(-1); let bi = 0; left.forEach((p, i) => { if (km(c, p) < km(c, left[bi])) bi = i; }); out.push(left.splice(bi, 1)[0]); } return out; }

export default function RouteMap() {
  const [text, setText] = useState('Bengaluru\nMysuru'); const [opt, setOpt] = useState(true);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [res, setRes] = useState(null); const [cam, setCam] = useState('');
  useEffect(() => { api('/geo/live-camera').then((d) => setCam(d.message)).catch(() => {}); }, []);

  async function go(e) {
    e.preventDefault(); const names = text.split('\n').map((s) => s.trim()).filter(Boolean);
    if (names.length < 2) return setErr('Enter at least two places, one per line. The first is your start.');
    if (names.length > 8) return setErr('Please use 8 places or fewer.');
    setBusy(true); setErr(''); setRes(null);
    try {
      let pts = [];
      for (const n of names) { const d = await api('/geo/search?q=' + encodeURIComponent(n)); if (!d.results[0]) throw new Error(`Could not find "${n}" on the map.`); pts.push({ ...d.results[0], label: n }); if (n !== names.at(-1)) await sleep(1100); }
      if (opt && pts.length > 3) pts = nearest(pts);
      const route = await api('/geo/route', { method: 'POST', body: { points: pts.map((p) => ({ lat: p.lat, lon: p.lon })) } });
      setRes({ pts, route });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  }
  const markers = res?.pts.map((p, i) => ({ lat: p.lat, lon: p.lon, label: p.label, sub: i === 0 ? 'Start' : i === res.pts.length - 1 ? 'End' : `Stop ${i + 1}`, color: i === 0 ? '#00C2B8' : i === res.pts.length - 1 ? '#FF6B4A' : '#5B3FF0', text: String.fromCharCode(65 + i) }));

  return (
    <Page title="Interactive Maps and Navigation" subtitle="Enter your start, stops and destination to see the road route, distance, time and directions.">
      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={go} className="card space-y-3 lg:col-span-1">
          <label className="block"><span className="mb-1 block text-sm font-semibold">Places, one per line (first is the start)</span>
            <textarea className="input h-36" value={text} onChange={(e) => setText(e.target.value)} /></label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={opt} onChange={(e) => setOpt(e.target.checked)} /> Reorder the stops after the first to shorten the trip (works with 4 or more places)</label>
          <button className="btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />} Get route</button>
          <ErrorBox error={err} />
          {busy && <p className="text-xs text-slate-500">Looking up places one at a time to respect the free map service...</p>}
        </form>
        <div className="space-y-4 lg:col-span-2">
          <div className="card"><MapView markers={markers || []} route={res?.route.geometry} className="h-[26rem]" /></div>
          {res && (
            <div className="card">
              <p className="font-display text-xl font-bold text-ink">{res.route.distanceKm} km, about {Math.floor(res.route.durationMin / 60)}h {res.route.durationMin % 60}m</p>
              <p className="text-sm text-slate-600">Order: {res.pts.map((p) => p.label).join(' → ')}</p>
              <details className="mt-3 text-sm" open><summary className="cursor-pointer font-semibold text-violet">Turn-by-turn directions</summary>
                <ol className="mt-2 max-h-72 list-decimal space-y-1 overflow-y-auto pl-5">{res.route.steps.map((s, i) => <li key={i}>{s.text} ({s.distanceM} m)</li>)}</ol></details>
              <p className="mt-2 text-xs text-slate-500">Source: {res.route.source}. Times ignore live traffic.</p>
            </div>)}
          <Notice><span className="mb-1 flex items-center gap-2 font-semibold"><Camera className="h-4 w-4" /> Live camera footage</span>{cam || 'No authorised live camera source is connected. Voyara never shows fake footage.'}</Notice>
        </div>
      </div>
    </Page>
  );
}
