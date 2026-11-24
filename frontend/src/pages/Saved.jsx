import { useEffect, useState } from 'react';
import { Trash2, Save, Download, Printer, ArrowLeft, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Page, ErrorBox, Spinner, Notice } from '../components/UI.jsx';
import ItineraryView, { itineraryToText } from '../components/ItineraryView.jsx';

export default function Saved() {
  const [trips, setTrips] = useState(null); const [open, setOpen] = useState(null); const [cur, setCur] = useState(null); const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const load = () => api('/trips').then((d) => setTrips(d.trips)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  async function del(id) { if (!confirm('Delete this trip?')) return; await api(`/trips/${id}`, { method: 'DELETE' }).catch((e) => setErr(e.message)); setOpen(null); load(); }
  async function update() { try { await api(`/trips/${open.id}`, { method: 'PUT', body: { title: open.title, destination: open.destination, itinerary: cur } }); setMsg('Changes saved.'); load(); } catch (e) { setErr(e.message); } }
  function download() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([itineraryToText(cur, open.title)], { type: 'text/plain' })); a.download = `MYRAVO-${open.id}.txt`; a.click(); URL.revokeObjectURL(a.href); }

  if (open) return (
    <Page title={open.title} subtitle="Edit stops and notes, then save your changes."
      actions={<button className="btn-ghost" onClick={() => { setOpen(null); setMsg(''); }}><ArrowLeft className="h-4 w-4" /> All trips</button>}>
      <div className="mb-4 flex flex-wrap gap-2"><button className="btn-primary" onClick={update}><Save className="h-4 w-4" /> Save changes</button>
        <button className="btn-ghost" onClick={download}><Download className="h-4 w-4" /> Download (.txt)</button><button className="btn-ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print or save as PDF</button>
        <button className="btn-danger" onClick={() => del(open.id)}><Trash2 className="h-4 w-4" /> Delete</button></div>
      <ErrorBox error={err} />{msg && <div className="mb-3"><Notice>{msg}</Notice></div>}
      <ItineraryView it={cur} onChange={(c) => { setCur(c); setMsg(''); }} />
    </Page>);

  return (
    <Page title="My Saved Trips" subtitle="Trips you saved from the planner.">
      <ErrorBox error={err} />{!trips && <Spinner />}
      {trips?.length === 0 && <div className="card text-center"><Bookmark className="mx-auto mb-2 h-8 w-8 text-violet" /><p className="font-semibold">No saved trips yet.</p><Link to="/plan" className="btn-primary mt-3">Plan a trip</Link></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{trips?.map((t) => (
        <button key={t.id} className="card text-left transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => { setOpen(t); setCur(t.itinerary); }}>
          <p className="font-display text-lg font-bold text-ink">{t.title}</p><p className="text-sm text-slate-600">{t.itinerary.days.length} days, {t.itinerary.people} traveller(s)</p>
          <p className="mt-2 text-xs text-slate-500">Saved {new Date(t.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN')}</p></button>))}</div>
    </Page>
  );
}
