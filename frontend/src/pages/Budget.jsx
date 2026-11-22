import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, Spinner, inr } from '../components/UI.jsx';

const CATS = ['Stay', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'];

export default function Budget() {
  const [items, setItems] = useState(null); const [err, setErr] = useState('');
  const [f, setF] = useState({ title: '', amount: '', category: 'Food' }); const [cap, setCap] = useState(() => Number(localStorage.getItem('tm_cap')) || 0);
  const load = () => api('/expenses').then((d) => setItems(d.expenses)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  async function add(e) { e.preventDefault(); setErr(''); try { await api('/expenses', { method: 'POST', body: { ...f, amount: Number(f.amount) } }); setF({ ...f, title: '', amount: '' }); load(); } catch (e2) { setErr(e2.message); } }
  async function del(id) { await api(`/expenses/${id}`, { method: 'DELETE' }).catch((e) => setErr(e.message)); load(); }
  if (!items) return <Page title="Budget and Expense Manager"><ErrorBox error={err} /><Spinner /></Page>;
  const total = items.reduce((s, x) => s + x.amount, 0);
  const by = CATS.map((c) => [c, items.filter((x) => x.category === c).reduce((s, x) => s + x.amount, 0)]).filter(([, v]) => v > 0);
  const pct = cap ? Math.min(100, (total / cap) * 100) : 0;
  return (
    <Page title="Budget and Expense Manager" subtitle="Log what you spend and see where the money goes.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <form onSubmit={add} className="card space-y-3"><h2 className="font-bold">Add an expense</h2>
            <input className="input" placeholder="What was it for?" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required maxLength={100} aria-label="Title" />
            <input className="input" type="number" min="1" step="any" placeholder="Amount in ₹" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} required aria-label="Amount" />
            <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} aria-label="Category">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <button className="btn-primary w-full"><Plus className="h-4 w-4" /> Add expense</button><ErrorBox error={err} /></form>
          <div className="card"><label className="text-sm font-semibold">Trip budget (₹)</label>
            <input className="input mt-1" type="number" min="0" value={cap || ''} placeholder="Set a limit" onChange={(e) => { setCap(Number(e.target.value)); localStorage.setItem('tm_cap', e.target.value || 0); }} />
            {cap > 0 && <><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className={`h-full ${total > cap ? 'bg-red-500' : 'bg-aqua'}`} style={{ width: pct + '%' }} /></div>
              <p className={`mt-1 text-sm ${total > cap ? 'font-semibold text-red-600' : 'text-slate-600'}`}>{total > cap ? `Over budget by ${inr(total - cap)}` : `${inr(cap - total)} left`}</p></>}</div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="card"><p className="text-sm text-slate-600">Total spent</p><p className="font-display text-4xl font-extrabold text-ink">{inr(total)}</p>
            <div className="mt-3 space-y-2">{by.map(([c, v]) => <div key={c}><div className="flex justify-between text-sm"><span>{c}</span><span>{inr(v)}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet" style={{ width: (v / total) * 100 + '%' }} /></div></div>)}</div></div>
          <div className="card"><h2 className="mb-2 font-bold">Expenses</h2>{items.length === 0 ? <p className="text-sm text-slate-500">No expenses yet. Add your first one on the left.</p> :
            <ul className="divide-y divide-slate-100">{items.map((x) => <li key={x.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span><b>{x.title}</b> <span className="chip">{x.category}</span> <span className="text-xs text-slate-500">{x.date}</span></span>
              <span className="flex items-center gap-2 font-semibold">{inr(x.amount)}<button className="btn-danger" onClick={() => del(x.id)} aria-label={`Delete ${x.title}`}><Trash2 className="h-4 w-4" /></button></span></li>)}</ul>}</div>
        </div>
      </div>
    </Page>
  );
}
