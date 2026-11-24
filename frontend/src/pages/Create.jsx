import { useState } from 'react';
import { Sparkles, Plus, X, Save, Loader2, CalendarDays, Users, Wallet, MapPin } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, Notice } from '../components/UI.jsx';

const TYPES = [
  ['trip', 'Trip'], ['college', 'College event'], ['wedding', 'Wedding'],
  ['party', 'Party or get-together'], ['festival', 'Festival'], ['team', 'Team activity'], ['other', 'Something else'],
];

export default function Create() {
  const [form, setForm] = useState({ title: '', type: 'trip', location: '', startDate: '', endDate: '', people: '2', budget: '', notes: '' });
  const [agenda, setAgenda] = useState([]);
  const [item, setItem] = useState('');
  const [ideas, setIdeas] = useState('');
  const [busyAI, setBusyAI] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [demo, setDemo] = useState(false);
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  function addAgenda(e) {
    e.preventDefault();
    const value = item.trim();
    if (!value) return;
    setAgenda((old) => [...old, value]);
    setItem('');
  }

  async function getIdeas() {
    if (!form.title.trim()) return setError('Add a plan name first so MYRAVO can make useful suggestions.');
    setError(''); setBusyAI(true); setMessage('');
    try {
      const prompt = `Help me plan this ${form.type} called "${form.title}". Location: ${form.location || 'not decided'}. Dates: ${form.startDate || 'not decided'} to ${form.endDate || 'not decided'}. People: ${form.people || 'not decided'}. Budget: ${form.budget ? '₹' + form.budget : 'not decided'}. Notes: ${form.notes || 'none'}. Give a concise, practical plan with a suggested timeline, checklist and budget tips. Clearly label estimates and assumptions. The user will choose what to keep.`;
      const result = await api('/ai/chat', { method: 'POST', body: { messages: [{ role: 'user', content: prompt }], context: { product: 'MYRAVO universal planner', type: form.type, location: form.location } } });
      setIdeas(result.reply || 'No suggestions were returned.');
      setDemo(!!result.demo);
    } catch (e) { setError(e.message); }
    finally { setBusyAI(false); }
  }

  async function savePlan() {
    if (!form.title.trim()) return setError('Please enter a name for your plan.');
    if (!form.location.trim()) return setError('Please enter a location, or type “To be decided”.');
    if (form.startDate && form.endDate && form.endDate < form.startDate) return setError('End date must be on or after the start date.');
    setError(''); setBusySave(true); setMessage('');
    const itinerary = {
      kind: 'universal', planType: form.type, title: form.title.trim(), location: form.location.trim(),
      startDate: form.startDate, endDate: form.endDate, people: Math.max(1, Number(form.people) || 1),
      budget: form.budget ? Number(form.budget) : null, notes: form.notes, agenda, aiSuggestions: ideas,
    };
    try {
      await api('/trips', { method: 'POST', body: { title: form.title.trim(), destination: form.location.trim(), itinerary } });
      setMessage('Your plan is saved to My Saved Trips. You can reopen it there.');
    } catch (e) { setError(e.message); }
    finally { setBusySave(false); }
  }

  return <Page title="Create & Plan" subtitle="Trips, college events, weddings, parties and more. Start with your own ideas, ask MYRAVO for suggestions, and stay in control.">
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <section className="card space-y-4">
        <div><p className="text-sm font-bold text-brand-wine">01 · YOUR PLAN</p><h2 className="mt-1 font-display text-xl font-bold text-ink">What are we planning?</h2></div>
        <label className="block text-sm font-semibold text-ink">Plan name<input className="input mt-1" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. UVCE cultural fest 2027" /></label>
        <label className="block text-sm font-semibold text-ink">Plan type<select className="input mt-1" value={form.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
        <label className="block text-sm font-semibold text-ink"><span className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Location</span><input className="input mt-1" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, venue or To be decided" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4"/> Start date</span><input className="input mt-1" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></label>
          <label className="block text-sm font-semibold text-ink">End date<input className="input mt-1" type="date" min={form.startDate || undefined} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink"><span className="flex items-center gap-2"><Users className="h-4 w-4"/> People</span><input className="input mt-1" type="number" min="1" max="10000" value={form.people} onChange={(e) => set('people', e.target.value)} /></label>
          <label className="block text-sm font-semibold text-ink"><span className="flex items-center gap-2"><Wallet className="h-4 w-4"/> Budget (₹)</span><input className="input mt-1" type="number" min="0" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Optional" /></label>
        </div>
        <label className="block text-sm font-semibold text-ink">Your notes<textarea className="input mt-1 min-h-24" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Theme, preferences, requirements, important details..." /></label>
        <div><p className="mb-2 text-sm font-semibold text-ink">Agenda and checklist</p><form className="flex gap-2" onSubmit={addAgenda}><input className="input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add a task, activity or stop" /><button className="btn-ghost" aria-label="Add item"><Plus className="h-4 w-4"/></button></form>
          {agenda.length > 0 && <ul className="mt-3 space-y-2">{agenda.map((a, i) => <li key={i} className="flex items-center justify-between rounded-xl bg-brand-ivory px-3 py-2 text-sm"><span>{a}</span><button onClick={() => setAgenda((old) => old.filter((_, j) => j !== i))} aria-label={`Remove ${a}`}><X className="h-4 w-4"/></button></li>)}</ul>}
        </div>
        <button className="btn-primary w-full" onClick={savePlan} disabled={busySave}><Save className="h-4 w-4"/>{busySave ? 'Saving...' : 'Save my plan'}</button>
        {message && <Notice>{message}</Notice>}
        <ErrorBox error={error}/>
      </section>
      <section className="space-y-4">
        <div className="card border-brand-gold/40 bg-gradient-to-br from-brand-ivory to-white">
          <p className="text-sm font-bold text-brand-wine">02 · AI CO-PILOT</p><h2 className="mt-1 font-display text-xl font-bold text-ink">Get a head start</h2>
          <p className="mt-2 text-sm text-slate-600">MYRAVO can suggest a timeline, checklist and budget ideas. Nothing is added automatically—you decide what to use.</p>
          <button className="btn-primary mt-4 w-full" onClick={getIdeas} disabled={busyAI}>{busyAI ? <><Loader2 className="h-4 w-4 animate-spin"/> Thinking...</> : <><Sparkles className="h-4 w-4"/> Suggest a plan with AI</>}</button>
        </div>
        {ideas && <div className="card"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="font-bold text-ink">MYRAVO suggestions</h3><span className="rounded-full bg-brand-gold/20 px-2 py-1 text-xs text-brand-wine">{demo ? 'Basic mode' : 'AI suggestions'}</span></div><div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ideas}</div><p className="mt-3 text-xs text-slate-500">Review these ideas and add the ones you want to your plan manually.</p></div>}
        <div className="rounded-2xl border border-brand-wine/10 bg-white/70 p-4 text-sm text-slate-600"><b className="text-ink">Your plan, your choice.</b><p className="mt-1">You can create everything manually. AI is optional and suggestions never replace your decisions.</p></div>
      </section>
    </div>
  </Page>;
}
