import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Umbrella } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, Spinner, Notice, wmo } from '../components/UI.jsx';
import { PlaceList } from './PlaceFinder.jsx';

export default function Weather() {
  const [sp, setSp] = useSearchParams(); const lat = sp.get('lat'), lon = sp.get('lon'), name = sp.get('name');
  const [q, setQ] = useState(''); const [wx, setWx] = useState(null); const [indoor, setIndoor] = useState(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');

  useEffect(() => {
    if (!lat || !lon) return;
    setBusy(true); setErr(''); setIndoor(null);
    api(`/geo/weather?lat=${lat}&lon=${lon}`).then(setWx).catch((e) => setErr(e.message)).finally(() => setBusy(false));
  }, [lat, lon]);
  const rainyDays = wx ? wx.days.filter((d) => d.rainChance >= 60) : [];
  useEffect(() => {
    if (rainyDays.length && !indoor) api(`/geo/places?lat=${lat}&lon=${lon}&type=indoor&radius=10000`).then((d) => setIndoor(d.places)).catch(() => setIndoor([]));
  }, [wx]); // eslint-disable-line

  async function search(e) {
    e.preventDefault(); setErr('');
    try { const d = await api('/geo/search?q=' + encodeURIComponent(q)); if (!d.results[0]) return setErr('Place not found. Try adding the state or country.'); const r = d.results[0]; setSp({ lat: r.lat, lon: r.lon, name: r.name.split(',')[0] }); }
    catch (e2) { setErr(e2.message); }
  }
  return (
    <Page title="Weather Forecast" subtitle="7-day forecast for any place, with indoor ideas when rain is likely.">
      <form onSubmit={search} className="card mb-4 flex gap-2"><input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a city or town" aria-label="Location" /><button className="btn-primary"><Search className="h-4 w-4" /> Check</button></form>
      <ErrorBox error={err} />{busy && <Spinner label="Fetching forecast..." />}
      {wx && (
        <div className="space-y-4">
          <div className="card"><p className="text-sm text-slate-600">Now in {name}</p><p className="font-display text-4xl font-extrabold text-ink">{Math.round(wx.current.tempC)}°C <span className="text-base font-medium text-slate-600">{wmo(wx.current.code)[0]}, wind {Math.round(wx.current.windKmh)} km/h</span></p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {wx.days.map((d) => { const [label, Icon] = wmo(d.code); return (
              <div key={d.date} className={`card !p-3 text-center ${d.rainChance >= 60 ? '!border-sky/50 !bg-sky/5' : ''}`}>
                <p className="text-xs font-semibold text-slate-500">{new Date(d.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                <Icon className="mx-auto my-2 h-7 w-7 text-violet" /><p className="text-xs">{label}</p>
                <p className="font-bold text-ink">{Math.round(d.maxC)}° <span className="font-normal text-slate-500">{Math.round(d.minC)}°</span></p><p className="text-xs text-sky">Rain {d.rainChance}%</p></div>); })}
          </div>
          <p className="text-xs text-slate-500">Source: {wx.source}. Forecasts change; check again before you travel.</p>
          {rainyDays.length > 0 ? (
            <div className="card"><h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><Umbrella className="h-5 w-5 text-sky" /> Rainy-day alternatives</h2>
              <p className="mb-3 text-sm text-slate-600">Rain is likely on {rainyDays.map((d) => d.date).join(', ')}. Indoor places near {name} (museums, galleries, cinemas, malls):</p>
              {indoor ? <PlaceList places={indoor} /> : <Spinner label="Finding indoor places..." />}</div>
          ) : <Notice>No day has a high rain chance, so no rainy-day alternatives are needed.</Notice>}
        </div>)}
      {!wx && !busy && !err && <p className="text-center text-sm text-slate-500">Search a place to see its forecast.</p>}
    </Page>
  );
}
