import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Compass, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, DemoBadge, Notice } from '../components/UI.jsx';

const IDEAS = ['Build a 3-day itinerary for Goa', 'Find a scenic route from Bengaluru', 'Help me plan a realistic trip budget', 'What should I pack for a hill-station trip?'];

function InlineText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

function AnswerContent({ content }) {
  const lines = String(content || '').split('\n');
  const blocks = []; let list = [];
  const flush = () => { if (list.length) { blocks.push({ type: 'list', items: list }); list = []; } };
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line || /^\|?[-: ]+\|[-|: ]*$/.test(line)) { flush(); return; }
    if (line.startsWith('|')) { flush(); const cells = line.split('|').slice(1, -1).map(x => x.trim()).filter(Boolean); if (cells.length) blocks.push({ type: 'tableRow', cells, key: index }); return; }
    const numbered = line.match(/^\d+[.)]\s+(.+)/); const bullet = line.match(/^[-*•]\s+(.+)/);
    if (numbered || bullet) { list.push((numbered || bullet)[1]); return; }
    flush(); const heading = line.match(/^#{1,3}\s+(.+)/);
    blocks.push({ type: heading ? 'heading' : 'paragraph', text: heading ? heading[1] : line, key: index });
  });
  flush();
  return <div className="space-y-3 leading-7">{blocks.map((b, i) => b.type === 'list'
    ? <ul key={i} className="list-disc space-y-2 pl-5">{b.items.map((item, j) => <li key={j}><InlineText text={item}/></li>)}</ul>
    : b.type === 'tableRow' ? <div key={b.key} className="rounded-lg bg-brand-ivory px-3 py-2 text-sm text-ink">{b.cells.map((cell, j) => <span key={j} className={j ? 'ml-2 text-slate-600' : 'font-semibold'}>{cell}</span>)}</div>
    : b.type === 'heading' ? <h3 key={b.key} className="pt-1 text-base font-bold"><InlineText text={b.text}/></h3>
    : <p key={b.key}><InlineText text={b.text}/></p>)}</div>;
}

export default function Assistant() {
  const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(''); const [ai, setAi] = useState(null); const end = useRef(null);
  const ctx = (() => { try { return JSON.parse(localStorage.getItem('tm_trip') || 'null'); } catch { return null; } })();
  useEffect(() => { api('/ai/status').then((d) => setAi(d.aiConfigured)).catch(() => {}); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [msgs, busy]);

  async function send(t) {
    const content = (t ?? text).trim(); if (!content || busy) return;
    const next = [...msgs, { role: 'user', content }]; setMsgs(next); setText(''); setErr(''); setBusy(true);
    try {
      const result = await api('/ai/chat', { method: 'POST', body: { messages: next.slice(-20), context: ctx } });
      setMsgs([...next, { role: 'assistant', content: result.reply, demo: result.demo }]);
    } catch (error) { setErr(error.message); } finally { setBusy(false); }
  }
  return <Page title="MYRAVO Travel AI" subtitle="A practical travel companion for destination ideas, itineraries, routes, budgets and the details in between.">
    <div className="mx-auto max-w-3xl space-y-3">
      {ai === false && <Notice tone="demo"><b>Limited mode.</b> The AI service is not configured yet. Connect the backend AI provider to enable full travel answers.</Notice>}
      {ctx && <p className="text-xs text-slate-500">Using your latest trip context: {ctx.destination}, {ctx.days} days.</p>}
      <div className="card min-h-[22rem] space-y-4" aria-live="polite">
        {!msgs.length && <div className="py-3"><span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-brand-gold/15 text-brand-wine"><Compass className="h-5 w-5"/></span><p className="mb-1 font-display text-xl font-bold text-ink">Where would you like to go?</p><p className="mb-4 text-sm text-slate-500">Start with a destination or a travel question. I’ll help you shape the next step.</p><div className="grid gap-2 sm:grid-cols-2">{IDEAS.map((idea) => <button key={idea} className="btn-ghost justify-start text-left" onClick={() => send(idea)}><Sparkles className="h-4 w-4 shrink-0 text-brand-gold"/>{idea}</button>)}</div></div>}
        {msgs.map((message, index) => <div key={index} className={message.role === 'user' ? 'ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-brand-wine px-4 py-3 text-sm text-white' : 'max-w-full rounded-2xl bg-brand-ivory px-4 py-4 text-sm text-ink'}>
          {message.demo && <div className="mb-2"><DemoBadge>LIMITED MODE</DemoBadge></div>}
          {message.role === 'user' ? message.content : <AnswerContent content={message.content}/>}
        </div>)}
        {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/> Thinking…</div>}
        <div ref={end}/>
      </div>
      <ErrorBox error={err}/>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about a destination, route or trip…" aria-label="Message MYRAVO Travel AI" maxLength={1000}/>
        <button className="btn-primary" disabled={busy || !text.trim()} aria-label="Send message"><Send className="h-4 w-4"/></button>
      </form>
    </div>
  </Page>;
}
