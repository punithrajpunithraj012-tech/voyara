import { useEffect, useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, Spinner } from '../components/UI.jsx';

const SUGGESTED = ['ID and tickets', 'Phone and charger', 'Power bank', 'Wallet and some cash', 'Medicines and first-aid kit', 'Comfortable shoes', 'Light jacket or rain jacket', 'Water bottle', 'Toiletries', 'Sunscreen and sunglasses', 'Travel adapter', 'Copies of documents'];

export default function Packing() {
  const [items, setItems] = useState(null); const [text, setText] = useState(''); const [err, setErr] = useState('');
  const load = () => api('/packing').then((d) => setItems(d.items)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const run = async (fn) => { setErr(''); try { await fn(); await load(); } catch (e) { setErr(e.message); } };
  if (!items) return <Page title="Packing Checklist"><ErrorBox error={err} /><Spinner /></Page>;
  const done = items.filter((i) => i.checked).length;
  return (
    <Page title="Packing Checklist" subtitle="Tick things off as you pack."
      actions={<button className="btn-ghost" onClick={() => run(() => api('/packing', { method: 'POST', body: { items: SUGGESTED.filter((s) => !items.some((i) => i.item === s)) } }))} disabled={SUGGESTED.every((s) => items.some((i) => i.item === s))}><Wand2 className="h-4 w-4" /> Add suggested items</button>}>
      <div className="mx-auto max-w-2xl space-y-4">
        <form className="card flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) run(async () => { await api('/packing', { method: 'POST', body: { items: [text.trim()] } }); setText(''); }); }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add an item" maxLength={80} aria-label="New item" /><button className="btn-primary"><Plus className="h-4 w-4" /> Add</button></form>
        <ErrorBox error={err} />
        <div className="card">
          {items.length > 0 && <><div className="mb-1 flex justify-between text-sm"><span>{done} of {items.length} packed</span><span>{Math.round((done / items.length) * 100)}%</span></div><div className="mb-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-aqua" style={{ width: (done / items.length) * 100 + '%' }} /></div></>}
          {items.length === 0 ? <p className="text-sm text-slate-500">Your list is empty. Add an item, or use "Add suggested items".</p> :
            <ul className="divide-y divide-slate-100">{items.map((i) => <li key={i.id} className="flex items-center justify-between py-2">
              <label className="flex flex-1 items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-violet" checked={i.checked} onChange={(e) => run(() => api(`/packing/${i.id}`, { method: 'PATCH', body: { checked: e.target.checked } }))} /><span className={i.checked ? 'text-slate-400 line-through' : ''}>{i.item}</span></label>
              <button className="btn-danger" onClick={() => run(() => api(`/packing/${i.id}`, { method: 'DELETE' }))} aria-label={`Delete ${i.item}`}><Trash2 className="h-4 w-4" /></button></li>)}</ul>}
        </div>
      </div>
    </Page>
  );
}
