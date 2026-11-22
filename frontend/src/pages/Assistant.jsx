import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, DemoBadge, Notice } from '../components/UI.jsx';

const IDEAS = ['What should I pack?', 'How should I split my budget?', 'What if it rains during my trip?', 'Give me safety tips'];

export default function Assistant() {
  const [msgs, setMsgs] = useState([]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(''); const [ai, setAi] = useState(null); const end = useRef(null);
  const ctx = (() => { try { return JSON.parse(localStorage.getItem('tm_trip') || 'null'); } catch { return null; } })();
  useEffect(() => { api('/ai/status').then((d) => setAi(d.aiConfigured)).catch(() => {}); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [msgs, busy]);

  async function send(t) {
    const content = (t ?? text).trim(); if (!content || busy) return;
    const next = [...msgs, { role: 'user', content }]; setMsgs(next); setText(''); setErr(''); setBusy(true);
    try { const r = await api('/ai/chat', { method: 'POST', body: { messages: next.slice(-20), context: ctx } }); setMsgs([...next, { role: 'assistant', content: r.reply, demo: r.demo }]); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <Page title="AI Travel Assistant" subtitle="Ask about destinations, packing, budgets, weather plans and safety.">
      <div className="mx-auto max-w-3xl space-y-3">
        {ai === false && <Notice tone="demo"><b>Demo mode.</b> No AI key is connected, so replies are simple keyword tips, not real AI. Add ANTHROPIC_API_KEY to backend/.env to switch on the real assistant.</Notice>}
        {ctx && <Notice>Trip in memory: <b>{ctx.destination}</b>, {ctx.days} days, {ctx.style} style, {ctx.people} traveller(s). The assistant uses this in its answers.</Notice>}
        <div className="card min-h-[22rem] space-y-3" aria-live="polite">
          {!msgs.length && <div><p className="mb-3 text-slate-600">Try one of these:</p><div className="flex flex-wrap gap-2">{IDEAS.map((i) => <button key={i} className="btn-ghost" onClick={() => send(i)}>{i}</button>)}</div></div>}
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'ml-auto rounded-br-sm bg-violet text-white' : 'rounded-bl-sm bg-violet/10 text-ink'}`}>
              {m.demo && <div className="mb-1"><DemoBadge>DEMO REPLY</DemoBadge></div>}{m.content}</div>))}
          {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Thinking...</div>}
          <div ref={end} />
        </div>
        <ErrorBox error={err} />
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Voyara anything about your trip" aria-label="Message" maxLength={1000} />
          <button className="btn-primary" disabled={busy} aria-label="Send"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </Page>
  );
}
