import { useEffect, useState } from 'react';
import { Users, Copy, Plus, ThumbsUp, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { Page, ErrorBox, Spinner, Notice, inr } from '../components/UI.jsx';

function settle(members, expenses) {
  const total = expenses.reduce((s, e) => s + e.amount, 0), share = members.length ? total / members.length : 0;
  const bal = Object.fromEntries(members.map((m) => [m, -share]));
  expenses.forEach((e) => { if (e.paidBy in bal) bal[e.paidBy] += e.amount; });
  const cred = [], debt = [];
  Object.entries(bal).forEach(([m, v]) => (v > 0.5 ? cred.push([m, v]) : v < -0.5 ? debt.push([m, -v]) : 0));
  const out = []; let i = 0, j = 0;
  while (i < debt.length && j < cred.length) { const x = Math.min(debt[i][1], cred[j][1]); out.push(`${debt[i][0]} pays ${cred[j][0]} ${inr(x)}`); debt[i][1] -= x; cred[j][1] -= x; if (debt[i][1] < 0.5) i++; if (cred[j][1] < 0.5) j++; }
  return { total, share, out };
}

export default function Group() {
  const { user } = useAuth();
  const [groups, setGroups] = useState(null); const [sel, setSel] = useState(null); const [trips, setTrips] = useState([]); const [err, setErr] = useState('');
  const [name, setName] = useState(''); const [code, setCode] = useState(''); const [member, setMember] = useState(''); const [opt, setOpt] = useState('');
  const [ex, setEx] = useState({ desc: '', amount: '', paidBy: '' });

  const load = () => api('/groups').then((d) => { setGroups(d.groups); setSel((s) => s ?? d.groups[0]?.id ?? null); }).catch((e) => setErr(e.message));
  useEffect(() => { load(); api('/trips').then((d) => setTrips(d.trips)).catch(() => {}); }, []);
  const g = groups?.find((x) => x.id === sel);

  async function run(fn) { setErr(''); try { await fn(); } catch (e) { setErr(e.message); } }
  const create = (e) => { e.preventDefault(); run(async () => { const r = await api('/groups', { method: 'POST', body: { name } }); setName(''); setSel(r.group.id); await load(); }); };
  const join = (e) => { e.preventDefault(); run(async () => { const r = await api('/groups/join', { method: 'POST', body: { code } }); setCode(''); setSel(r.group.id); await load(); }); };
  const update = (mut) => run(async () => { const d = structuredClone(g.data); mut(d); await api(`/groups/${g.id}`, { method: 'PUT', body: d }); await load(); });

  if (!groups) return <Page title="Smart Group Travel"><ErrorBox error={err} /><Spinner /></Page>;
  const s = g ? settle(g.data.members, g.data.expenses) : null;
  const myVote = g?.data.options.findIndex((o) => o.votes.includes(user.name));

  return (
    <Page title="Smart Group Travel" subtitle="Share a trip with friends, vote on where to go and split the costs.">
      <ErrorBox error={err} />
      <div className="mt-2 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <form onSubmit={create} className="card space-y-2"><h2 className="font-bold">Create a group</h2><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goa gang" required minLength={2} aria-label="Group name" /><button className="btn-primary w-full"><Plus className="h-4 w-4" /> Create</button></form>
          <form onSubmit={join} className="card space-y-2"><h2 className="font-bold">Join with a code</h2><input className="input uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code from a friend" required aria-label="Group code" /><button className="btn-ghost w-full">Join group</button></form>
          <div className="card"><h2 className="mb-2 font-bold">Your groups</h2>{groups.length === 0 ? <p className="text-sm text-slate-500">No groups yet.</p> :
            <ul className="space-y-1">{groups.map((x) => <li key={x.id}><button className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${x.id === sel ? 'bg-violet text-white' : 'hover:bg-violet/10'}`} onClick={() => setSel(x.id)}>{x.name}</button></li>)}</ul>}</div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {!g ? <Notice>Create a group or join one with a code to get started.</Notice> : (<>
            <div className="card flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-xl font-bold"><Users className="h-5 w-5 text-violet" /> {g.name}</h2>
              <button className="btn-ghost" onClick={() => navigator.clipboard?.writeText(g.code)}><Copy className="h-4 w-4" /> Share code: <b className="font-mono">{g.code}</b></button></div>

            <div className="card"><h3 className="mb-2 font-bold">Members</h3><div className="flex flex-wrap gap-2">{g.data.members.map((m) => <span key={m} className="chip">{m}</span>)}</div>
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (member.trim()) { update((d) => { if (!d.members.includes(member.trim())) d.members.push(member.trim()); }); setMember(''); } }}>
                <input className="input" value={member} onChange={(e) => setMember(e.target.value)} placeholder="Add a member without an account" aria-label="Member name" /><button className="btn-ghost">Add</button></form></div>

            <div className="card"><h3 className="mb-2 font-bold">Vote on a destination</h3>
              <ul className="space-y-2">{g.data.options.map((o, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-sand p-2.5 text-sm"><span><b>{o.name}</b> <span className="text-slate-500">{o.votes.length} vote{o.votes.length !== 1 ? 's' : ''}{o.votes.length ? `: ${o.votes.join(', ')}` : ''}</span></span>
                  <button className={i === myVote ? 'btn-primary' : 'btn-ghost'} onClick={() => update((d) => { d.options.forEach((x) => { x.votes = x.votes.filter((v) => v !== user.name); }); if (i !== myVote) d.options[i].votes.push(user.name); })}><ThumbsUp className="h-4 w-4" /> {i === myVote ? 'Your vote' : 'Vote'}</button></li>))}</ul>
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (opt.trim()) { update((d) => d.options.push({ name: opt.trim(), votes: [] })); setOpt(''); } }}>
                <input className="input" value={opt} onChange={(e) => setOpt(e.target.value)} placeholder="Suggest a destination" aria-label="Destination option" /><button className="btn-ghost">Add option</button></form></div>

            <div className="card"><h3 className="mb-2 font-bold">Shared itinerary</h3>
              {g.data.itinerary ? <div className="text-sm"><p className="font-semibold">{g.data.itinerary.title}</p>{g.data.itinerary.days.map((d, i) => <p key={i}><b>{d.title}:</b> {d.stops.join(', ') || 'No stops'}</p>)}</div> : <p className="text-sm text-slate-500">Nothing shared yet.</p>}
              <select className="input mt-3" value="" onChange={(e) => { const t = trips.find((x) => x.id === +e.target.value); if (t) update((d) => { d.itinerary = { title: t.title, days: t.itinerary.days.map((x) => ({ title: x.title, stops: x.stops.map((st) => st.name) })) }; }); }} aria-label="Share a saved trip">
                <option value="">{trips.length ? 'Share one of your saved trips...' : 'Save a trip first to share it here'}</option>{trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>

            <div className="card"><h3 className="mb-2 font-bold">Split expenses</h3>
              <form className="grid gap-2 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); const amt = Number(ex.amount); if (!ex.desc.trim() || !(amt > 0)) return; update((d) => d.expenses.push({ desc: ex.desc.trim(), amount: amt, paidBy: ex.paidBy || d.members[0] })); setEx({ desc: '', amount: '', paidBy: ex.paidBy }); }}>
                <input className="input" placeholder="What for?" value={ex.desc} onChange={(e) => setEx({ ...ex, desc: e.target.value })} aria-label="Expense description" />
                <input className="input" type="number" min="1" placeholder="₹" value={ex.amount} onChange={(e) => setEx({ ...ex, amount: e.target.value })} aria-label="Amount" />
                <select className="input" value={ex.paidBy} onChange={(e) => setEx({ ...ex, paidBy: e.target.value })} aria-label="Paid by"><option value="">Paid by...</option>{g.data.members.map((m) => <option key={m}>{m}</option>)}</select>
                <button className="btn-primary">Add</button></form>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">{g.data.expenses.map((e, i) => <li key={i} className="flex items-center justify-between py-1.5"><span>{e.desc} <span className="text-slate-500">paid by {e.paidBy}</span></span><span className="flex items-center gap-1 font-semibold">{inr(e.amount)}<button className="btn-danger" aria-label="Remove expense" onClick={() => update((d) => d.expenses.splice(i, 1))}><Trash2 className="h-4 w-4" /></button></span></li>)}</ul>
              {s.total > 0 && <div className="mt-3 rounded-xl bg-aqua/10 p-3 text-sm"><p>Total {inr(s.total)}, equal share {inr(s.share)} each.</p>{s.out.length ? <ul className="mt-1 list-disc pl-5 font-semibold text-ink">{s.out.map((o) => <li key={o}>{o}</li>)}</ul> : <p>Everyone is settled up.</p>}</div>}</div>
          </>)}
        </div>
      </div>
    </Page>
  );
}
