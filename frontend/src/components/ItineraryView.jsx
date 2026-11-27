import { useState, useMemo } from 'react';
import { Trash2, Route as RouteIcon, CloudRain, Utensils, BedDouble } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapView from './MapView.jsx';
import { Notice, DemoBadge, ErrorBox, Spinner, inr, wmo } from './UI.jsx';
import { api } from '../api.js';

const DAY_COLORS = ['#5B3FF0', '#2F7BFF', '#00C2B8', '#FF6B4A', '#FFB020', '#E040A0', '#3A8F5C', '#8A5A2B', '#5B6B7C', '#B23B3B'];

export function itineraryToText(it, title) {
  const L = [`${title || 'MYRAVO itinerary'} - ${it.destination}`, `Travellers: ${it.people}`, ''];
  it.days.forEach((d) => {
    L.push(`${d.title}${d.weather ? ` (forecast ${d.weather.minC}-${d.weather.maxC} C, rain chance ${d.weather.rainChance}%)` : ''}`);
    d.stops.forEach((s, i) => L.push(`  ${i + 1}. ${s.name}${s.kind ? ` [${s.kind}]` : ''}${s.note ? ' - ' + s.note : ''}`));
    if (d.eat?.length) L.push(`  Food ideas: ${d.eat.join(', ')}`);
    L.push(`  Approx. travel: ${d.approxTravelKm} km straight-line`, '');
  });
  if (it.stays?.length) L.push('Places to stay (from OpenStreetMap, not ratings): ' + it.stays.map((s) => s.name).join(', '), '');
  L.push(`Rough budget estimate: ${inr(it.estimate.perPersonInr)} per person (${inr(it.estimate.totalInr)} total). ${it.estimate.disclaimer}`);
  return L.join('\n');
}

export default function ItineraryView({ it, onChange }) {
  const [road, setRoad] = useState(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const markers = useMemo(() => it.days.flatMap((d, di) => d.stops.map((s, i) => ({ lat: s.lat, lon: s.lon, label: s.name, sub: d.title, color: DAY_COLORS[di % 10], text: String(i + 1) }))), [it]);
  const edit = (fn) => { const c = structuredClone(it); fn(c); onChange(c); setRoad(null); };

  async function getRoute() {
    setBusy(true); setErr('');
    try {
      const pts = [it.center, ...it.days.flatMap((d) => d.stops)].map((p) => ({ lat: p.lat, lon: p.lon }));
      setRoad(await api('/geo/route', { method: 'POST', body: { points: pts.slice(0, 25) } }));
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  const rainy = it.days.find((d) => d.weather && d.weather.rainChance >= 60);

  return (
    <div className="space-y-5">
      <div className="card"><div className="mb-2 flex items-center gap-2"><h2 className="text-xl font-bold">{it.destination}</h2>{!it.aiGenerated && <DemoBadge>DEMO SUMMARY</DemoBadge>}</div>
        <p className="whitespace-pre-line text-slate-700">{it.summary}</p></div>
      {it.warning && <ErrorBox error={it.warning} />}
      {rainy && <Notice tone="demo">Rain is likely on {rainy.title}. <Link className="font-semibold text-brand-wine underline" to={`/weather?lat=${it.center.lat}&lon=${it.center.lon}&name=${encodeURIComponent(it.destination.split(',')[0])}`}>See rainy-day alternatives</Link>.</Notice>}

      <div className="card space-y-3">
        <MapView markers={markers} route={road?.geometry} className="h-96" />
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-ghost" onClick={getRoute} disabled={busy || !markers.length}><RouteIcon className="h-4 w-4" /> Show road route</button>
          {busy && <Spinner label="Fetching route..." />}
          {road && <span className="text-sm font-semibold text-ink">{road.distanceKm} km, about {Math.floor(road.durationMin / 60)}h {road.durationMin % 60}m driving</span>}
        </div>
        <ErrorBox error={err} />
        {road && <details className="text-sm"><summary className="cursor-pointer font-semibold text-brand-wine">Turn-by-turn directions ({road.steps.length} steps)</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">{road.steps.map((s, i) => <li key={i}>{s.text} ({s.distanceM} m)</li>)}</ol><p className="mt-2 text-xs text-slate-500">Source: {road.source}</p></details>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {it.days.map((d, di) => {
          const w = d.weather; const [label, Icon] = w ? wmo(w.code) : [];
          return (
            <div key={di} className="card">
              <div className="mb-3 flex items-center justify-between gap-2">
                <input className="input !w-auto flex-1 font-display font-bold" value={d.title} aria-label="Day title" onChange={(e) => edit((c) => { c.days[di].title = e.target.value; })} />
                {w && <span className="chip whitespace-nowrap"><Icon className="h-3.5 w-3.5" /> {label} {Math.round(w.maxC)}°/{Math.round(w.minC)}°, rain {w.rainChance}%</span>}
              </div>
              {d.stops.length === 0 && <p className="text-sm text-slate-500">No stops found for this day.</p>}
              <ol className="space-y-2">
                {d.stops.map((s, si) => (
                  <li key={s.id || si} className="flex items-start gap-2 rounded-xl bg-sand p-2.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: DAY_COLORS[di % 10] }}>{si + 1}</span>
                    <div className="min-w-0 flex-1"><p className="font-semibold">{s.name} <span className="text-xs font-normal text-slate-500">{s.kind}</span></p>
                      <input className="input mt-1 !py-1.5" placeholder="Add a note (e.g. go before 10am)" value={s.note || ''} onChange={(e) => edit((c) => { c.days[di].stops[si].note = e.target.value; })} /></div>
                    <button className="btn-danger" aria-label={`Remove ${s.name}`} onClick={() => edit((c) => { c.days[di].stops.splice(si, 1); })}><Trash2 className="h-4 w-4" /></button>
                  </li>))}
              </ol>
              <p className="mt-3 text-xs text-slate-500">About {d.approxTravelKm} km between stops (straight-line, roughly {d.approxTravelMin} min by road). Use "Show road route" for real roads.</p>
              {d.eat?.length > 0 && <p className="mt-2 flex gap-2 text-sm"><Utensils className="mt-0.5 h-4 w-4 shrink-0 text-coral" /> <span><b>Food nearby:</b> {d.eat.join(', ')}</span></p>}
            </div>);
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card"><h3 className="mb-2 flex items-center gap-2 font-bold"><BedDouble className="h-4 w-4 text-brand-wine" /> Where to stay</h3>
          {it.stays?.length ? <ul className="list-disc pl-5 text-sm">{it.stays.map((s) => <li key={s.id}>{s.name} <span className="text-slate-500">({s.kind}{s.distanceKm != null ? `, ${s.distanceKm} km from center` : ''})</span></li>)}</ul> : <p className="text-sm text-slate-500">No stays found nearby in OpenStreetMap.</p>}
          <p className="mt-2 text-xs text-slate-500">Names only. No ratings or prices are available from this data source.</p></div>
        <div className="card"><h3 className="mb-2 font-bold">Rough budget estimate <DemoBadge>ESTIMATE</DemoBadge></h3>
          <p className="text-2xl font-extrabold text-ink">{inr(it.estimate.perPersonInr)} <span className="text-sm font-medium text-slate-500">per person</span></p>
          <p className="text-sm text-slate-600">{inr(it.estimate.totalInr)} for {it.people} traveller{it.people > 1 ? 's' : ''} ({it.estimate.level} level)</p>
          <p className="mt-2 text-xs text-slate-500">{it.estimate.disclaimer}</p></div>
      </div>
    </div>
  );
}
