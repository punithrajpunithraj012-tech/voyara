import { useState, useRef, useEffect } from 'react';
import { Send, Save, Download, Printer, RotateCcw, Loader2, Check } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, Notice } from '../components/UI.jsx';
import ItineraryView, { itineraryToText } from '../components/ItineraryView.jsx';

const Q = [
  { key: 'destination', q: 'Where do you want to travel?', type: 'text', ph: 'e.g. Jaipur, Goa, Paris' },
  { key: 'start', q: 'What is your starting location?', type: 'text', ph: 'e.g. Bengaluru', optional: true },
  { key: 'days', q: 'How many days is the trip? (1 to 10)', type: 'number', ph: 'e.g. 4', min: 1, max: 10 },
  { key: 'budget', q: 'What is your approximate total budget in ₹? Enter 0 if you are not sure.', type: 'number', ph: 'e.g. 40000', min: 0 },
  { key: 'people', q: 'How many people are travelling?', type: 'number', ph: 'e.g. 3', min: 1, max: 30 },
  { key: 'style', q: 'What type of experience do you prefer?', type: 'choice', options: [['cultural', 'Culture and history'], ['adventure', 'Adventure'], ['relaxation', 'Relaxation'], ['food', 'Food'], ['nature', 'Nature']] },
  { key: 'companions', q: 'Who are you travelling with?', type: 'choice', options: [['family', 'Family'], ['friends', 'Friends'], ['solo', 'Alone'], ['partner', 'Partner']] },
  { key: 'notes', q: 'Any special requirements? (for example wheelchair access, vegetarian food, travelling with kids)', type: 'text', ph: 'Type here or skip', optional: true },
];

export default function Planner() {
  const [step, setStep] = useState(0); const [ans, setAns] = useState({}); const [val, setVal] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [it, setIt] = useState(null); const [saved, setSaved] = useState(null);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [step, busy]);

  const cur = Q[step];
  async function answer(raw, label) {
    setErr('');
    let v = typeof raw === 'string' ? raw.trim() : raw;
    if (!v && !cur.optional && cur.type !== 'number') return setErr('Please answer this question to continue.');
    if (cur.type === 'number') {
      v = Number(v);
      if (Number.isNaN(v) || (cur.min != null && v < cur.min) || (cur.max != null && v > cur.max)) return setErr(`Enter a number${cur.min != null ? ` from ${cur.min}` : ''}${cur.max ? ` to ${cur.max}` : ''}.`);
    }
    const next = { ...ans, [cur.key]: v, [`${cur.key}_label`]: label || String(v || 'Skipped') };
    setAns(next); setVal('');
    if (step + 1 < Q.length) return setStep(step + 1);
    setStep(Q.length); setBusy(true);
    try {
      const { itinerary } = await api('/ai/plan', { method: 'POST', body: { destination: next.destination, start: next.start || '', days: next.days, budget: next.budget, people: next.people, style: next.style, companions: next.companions, notes: next.notes || '' } });
      setIt(itinerary); setSaved(null);
      localStorage.setItem('tm_trip', JSON.stringify({ destination: itinerary.destination, days: itinerary.days.length, style: itinerary.style, people: itinerary.people }));
    } catch (e) { setErr(e.message); setStep(Q.length - 1); } finally { setBusy(false); }
  }
  const reset = () => { setStep(0); setAns({}); setIt(null); setSaved(null); setErr(''); };
  async function save() {
    try { const t = await api('/trips', { method: 'POST', body: { title: `${it.destination.split(',')[0]} - ${it.days.length} days`, destination: it.destination, itinerary: it } }); setSaved(t.trip.id); } catch (e) { setErr(e.message); }
  }
  function download() {
    const blob = new Blob([itineraryToText(it)], { type: 'text/plain' }); const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `Voyara-${it.destination.split(',')[0].replace(/\W+/g, '-')}.txt`; a.click(); URL.revokeObjectURL(a.href);
  }

  return (
    <Page title="Plan My Entire Trip" subtitle="Answer a few questions and Voyara builds a day-wise plan from real map data." actions={it && <button className="btn-ghost" onClick={reset}><RotateCcw className="h-4 w-4" /> Plan another trip</button>}>
      {!it ? (
        <div className="card mx-auto max-w-2xl">
          <div className="space-y-3" aria-live="polite">
            {Q.slice(0, Math.min(step + 1, Q.length)).map((q, i) => (
              <div key={q.key} className="space-y-2">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-violet/10 px-4 py-2.5 text-sm font-medium text-ink">{q.q}</div>
                {i < step && <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-violet px-4 py-2.5 text-sm text-white">{ans[`${q.key}_label`]}</div>}
              </div>))}
            {busy && <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Finding places, ordering stops and checking the forecast. This can take up to a minute...</div>}
            <div ref={end} />
          </div>
          <div className="mt-4"><ErrorBox error={err} /></div>
          {!busy && cur && (
            <div className="mt-4">
              {cur.type === 'choice' ? (
                <div className="flex flex-wrap gap-2">{cur.options.map(([k, l]) => <button key={k} className="btn-ghost" onClick={() => answer(k, l)}>{l}</button>)}</div>
              ) : (
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); answer(val); }}>
                  <input className="input" type={cur.type} min={cur.min} max={cur.max} placeholder={cur.ph} value={val} onChange={(e) => setVal(e.target.value)} aria-label={cur.q} autoFocus />
                  <button className="btn-primary" aria-label="Send answer"><Send className="h-4 w-4" /></button>
                  {cur.optional && <button type="button" className="btn-ghost" onClick={() => answer('')}>Skip</button>}
                </form>)}
            </div>)}
          <div className="mt-4 flex justify-center">{step < Q.length && <span className="text-xs text-slate-500">Question {step + 1} of {Q.length}</span>}</div>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={save} disabled={!!saved}>{saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save trip</>}</button>
            <button className="btn-ghost" onClick={download}><Download className="h-4 w-4" /> Download (.txt)</button>
            <button className="btn-ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print or save as PDF</button>
          </div>
          <ErrorBox error={err} />
          {saved && <div className="mb-4"><Notice>Trip saved. You can reopen and edit it later from My Saved Trips.</Notice></div>}
          <ItineraryView it={it} onChange={setIt} />
        </>
      )}
    </Page>
  );
}
