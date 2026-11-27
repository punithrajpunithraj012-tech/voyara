import { useState } from 'react';
import { Navigation, Loader2, ArrowDownUp, Plus, X, ExternalLink, Route, Clock3, MapPin, RotateCcw } from 'lucide-react';
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

  function addStop(e) {
    e.preventDefault();
    const value = stopInput.trim();
    if (!value) return;
    if (stops.length >= 6) return setErr('You can add up to six stops.');
    setStops((old) => [...old, value]);
    setStopInput('');
    setErr('');
    setRes(null);
  }

  async function go(e) {
    e.preventDefault();
    const names = [from.trim(), ...stops.map((s) => s.trim()), to.trim()];
    if (!from.trim() || !to.trim()) return setErr('Add both a starting point and a destination to continue.');
    if (names.some((name) => !name)) return setErr('Check each stop and try again.');
    setBusy(true); setErr(''); setRes(null);
    try {
      const pts = [];
      for (let i = 0; i < names.length; i += 1) {
        const data = await api('/geo/search?q=' + encodeURIComponent(names[i]));
        if (!data.results?.[0]) throw new Error('We could not find "' + names[i] + '". Try adding its city or region.');
        pts.push({ ...data.results[0], label: names[i] });
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
    setFrom(to); setTo(from); setRes(null);
  }

  function clearRoute() {
    setStops([]); setStopInput(''); setRes(null); setErr('');
  }

  const markers = res?.pts.map((point, index) => ({
    lat: point.lat, lon: point.lon, label: point.label,
    sub: index === 0 ? 'Start' : index === res.pts.length - 1 ? 'Destination' : `Stop ${index}`,
    color: index === 0 ? '#66877b' : index === res.pts.length - 1 ? '#c66a50' : '#a9854d',
    text: index === 0 ? 'A' : index === res.pts.length - 1 ? 'B' : String(index),
  })) || [];

  const activePoints = res?.pts || [];
  const googleUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(activePoints[0]?.name || from) +
    '&destination=' + encodeURIComponent(activePoints[activePoints.length - 1]?.name || to) +
    (activePoints.length > 2 ? '&waypoints=' + encodeURIComponent(activePoints.slice(1, -1).map((point) => point.name).join('|')) : '') +
    '&travelmode=driving';

  return <Page title="Route planner" subtitle="Connect the places you want to visit. Preview your route here, then continue with Google Maps for navigation.">
    <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form onSubmit={go} className="card space-y-5">
        <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a9854d]">Build your journey</p><h2 className="mt-2 font-display text-2xl font-bold text-ink">Where to next?</h2><p className="mt-1 text-sm text-slate-500">Add a start, a destination and any stops along the way.</p></div>
        <div className="route-fields space-y-4">
          <label className="block text-sm font-bold text-ink"><span className="mb-2 flex items-center gap-2"><span className="route-dot route-dot-start"/> Starting point</span><input className="input" value={from} onChange={(e) => { setFrom(e.target.value); setRes(null); }} placeholder="Your starting location" autoComplete="off"/></label>
          <div className="flex justify-end pr-1"><button type="button" className="btn-ghost !min-h-9 !px-3" onClick={swapLocations}><ArrowDownUp className="h-4 w-4"/> Switch places</button></div>
          <label className="block text-sm font-bold text-ink"><span className="mb-2 flex items-center gap-2"><span className="route-dot route-dot-end"/> Final destination</span><input className="input" value={to} onChange={(e) => { setTo(e.target.value); setRes(null); }} placeholder="Where are you heading?" autoComplete="off"/></label>
        </div>
        <div className="border-t border-brand-wine/10 pt-4">
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold text-ink">Stops along the way</p><span className="text-xs text-slate-500">{stops.length}/6</span></div>
          <div className="flex gap-2"><input className="input min-w-0" value={stopInput} onChange={(e) => setStopInput(e.target.value)} placeholder="Add a town or attraction"/><button type="button" className="btn-ghost !px-3" onClick={addStop} aria-label="Add stop"><Plus className="h-4 w-4"/></button></div>
          {stops.length > 0 && <ol className="mt-3 space-y-2">{stops.map((stop, index) => <li key={`${stop}-${index}`} className="flex items-center justify-between rounded-xl bg-brand-ivory px-3 py-2 text-sm text-ink"><span>{index + 1}. {stop}</span><button type="button" onClick={() => { setStops((old) => old.filter((_, i) => i !== index)); setRes(null); }} aria-label={`Remove ${stop}`}><X className="h-4 w-4"/></button></li>)}</ol>}
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Route className="h-4 w-4"/>}{busy ? 'Finding your route…' : 'Preview route'}</button>
        <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" className="text-xs font-semibold text-slate-500 hover:text-ink" onClick={clearRoute}><RotateCcw className="mr-1 inline h-3 w-3"/> Clear added stops</button><span className="text-[11px] text-slate-500">Free map and route data</span></div>
        <ErrorBox error={err}/>
        {busy && <p className="text-xs leading-5 text-slate-500">Searching locations one at a time to respect the free public map services.</p>}
      </form>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#d6ad68]/20 bg-[#211719] p-2 shadow-xl">
          <div className="flex items-center justify-between px-3 py-2"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#d6ad68]">Your route, at a glance</p><p className="text-sm text-white/55">{res ? `${res.pts.length} places connected` : 'Your map preview will appear here'}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-white/55">OPENSTREETMAP</span></div>
          <MapView markers={markers} route={res?.route.geometry} className="h-[26rem] sm:h-[34rem]"/>
          {!res && <div className="px-4 py-3 text-xs text-white/45">Enter your locations and select <b className="text-white/75">Preview route</b> to draw your journey on the map.</div>}
        </div>
        {res ? <div className="card space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-ivory p-4"><Route className="h-4 w-4 text-brand-wine"/><p className="mt-2 text-xs text-slate-500">Road distance</p><p className="font-display text-2xl font-bold text-ink">{res.route.distanceKm} km</p></div>
            <div className="rounded-2xl bg-brand-ivory p-4"><Clock3 className="h-4 w-4 text-brand-wine"/><p className="mt-2 text-xs text-slate-500">Estimated drive</p><p className="font-display text-2xl font-bold text-ink">{Math.floor(res.route.durationMin / 60)}h {res.route.durationMin % 60}m</p></div>
            <div className="rounded-2xl bg-brand-ivory p-4"><MapPin className="h-4 w-4 text-brand-wine"/><p className="mt-2 text-xs text-slate-500">Stops on route</p><p className="font-display text-2xl font-bold text-ink">{res.pts.length}</p></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">{res.pts.map((point) => point.label).join(' → ')}</p><a className="btn-primary" href={googleUrl} target="_blank" rel="noreferrer noopener"><ExternalLink className="h-4 w-4"/> Continue in Google Maps</a></div>
          <details className="text-sm"><summary className="cursor-pointer font-bold text-brand-wine">View turn-by-turn route steps</summary><ol className="mt-3 max-h-72 list-decimal space-y-2 overflow-y-auto pl-5 text-slate-600">{res.route.steps.map((step, index) => <li key={index}>{step.text} <span className="text-slate-400">({step.distanceM} m)</span></li>)}</ol></details>
          <Notice>Route distance and duration are estimates from the OpenStreetMap-based routing service. They do not include live traffic. Google Maps opens separately for navigation.</Notice>
        </div> : <div className="card flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold"/><div><p className="font-bold text-ink">A route that makes sense to you</p><p className="mt-1 text-sm leading-6 text-slate-500">Preview the road journey, see every stop on the map and open the complete route in Google Maps when you are ready.</p></div></div>}
      </div>
    </div>
  </Page>;
}
