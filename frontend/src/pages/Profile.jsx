import { useEffect, useState } from 'react';
import { Plus, Trash2, Bell } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Page, ErrorBox, Notice } from '../components/UI.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({ name: user.name, homeCity: user.homeCity || '', diet: user.preferences.diet || '', pace: user.preferences.pace || 'balanced' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [rem, setRem] = useState([]); const [r, setR] = useState({ title: '', date: '' });
  const loadRem = () => api('/reminders').then((d) => setRem(d.reminders)).catch((e) => setErr(e.message));
  useEffect(() => { loadRem(); }, []);

  async function save(e) {
    e.preventDefault(); setErr(''); setMsg('');
    try { const d = await api('/auth/profile', { method: 'PUT', body: { name: f.name, homeCity: f.homeCity, preferences: { diet: f.diet, pace: f.pace } } }); setUser(d.user); setMsg('Profile saved.'); } catch (e2) { setErr(e2.message); }
  }
  const act = async (fn) => { setErr(''); try { await fn(); await loadRem(); } catch (e) { setErr(e.message); } };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Page title="Profile and Reminders" subtitle={user.email}>
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={save} className="card space-y-3"><h2 className="font-bold">Your profile</h2>
          <label className="block text-sm font-semibold">Name<input className="input mt-1 font-normal" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} /></label>
          <label className="block text-sm font-semibold">Home city<input className="input mt-1 font-normal" value={f.homeCity} onChange={(e) => setF({ ...f, homeCity: e.target.value })} /></label>
          <label className="block text-sm font-semibold">Food preference<input className="input mt-1 font-normal" value={f.diet} onChange={(e) => setF({ ...f, diet: e.target.value })} placeholder="e.g. vegetarian" /></label>
          <label className="block text-sm font-semibold">Travel pace<select className="input mt-1 font-normal" value={f.pace} onChange={(e) => setF({ ...f, pace: e.target.value })}><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="packed">Packed</option></select></label>
          <button className="btn-primary">Save profile</button>{msg && <Notice>{msg}</Notice>}
        </form>
        <div className="card space-y-3"><h2 className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4 text-coral" /> Reminders</h2>
          <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); act(async () => { await api('/reminders', { method: 'POST', body: r }); setR({ title: '', date: '' }); }); }}>
            <input className="input min-w-[10rem] flex-1" placeholder="e.g. Book train tickets" value={r.title} onChange={(e) => setR({ ...r, title: e.target.value })} required aria-label="Reminder" />
            <input className="input !w-auto" type="date" value={r.date} min={today} onChange={(e) => setR({ ...r, date: e.target.value })} required aria-label="Date" />
            <button className="btn-primary" aria-label="Add reminder"><Plus className="h-4 w-4" /></button></form>
          <p className="text-xs text-slate-500">Reminders due within 3 days appear on your dashboard. They show inside MYRAVO only; there are no push or email notifications yet.</p>
          <ErrorBox error={err} />
          {rem.length === 0 ? <p className="text-sm text-slate-500">No reminders yet.</p> : <ul className="divide-y divide-slate-100">{rem.map((x) => <li key={x.id} className="flex items-center justify-between py-2 text-sm">
            <label className="flex flex-1 items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-violet" checked={x.done} onChange={(e) => act(() => api(`/reminders/${x.id}`, { method: 'PATCH', body: { done: e.target.checked } }))} /><span className={x.done ? 'text-slate-400 line-through' : ''}>{x.title} <span className={`text-xs ${!x.done && x.date < today ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{x.date}</span></span></label>
            <button className="btn-danger" onClick={() => act(() => api(`/reminders/${x.id}`, { method: 'DELETE' }))} aria-label={`Delete ${x.title}`}><Trash2 className="h-4 w-4" /></button></li>)}</ul>}
        </div>
      </div>
    </Page>
  );
}
