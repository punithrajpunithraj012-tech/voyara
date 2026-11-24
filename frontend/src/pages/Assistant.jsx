import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, DemoBadge, Notice } from '../components/UI.jsx';

const IDEAS = ['Help me organise my week', 'Create a practical trip plan', 'How can I manage a group event?', 'Help me plan a realistic budget'];

function InlineText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function AnswerContent({ content }) {
  const lines = String(content || '').split('\n');
  const blocks = [];
  let list = [];
  const flush = () => {
    if (list.length) { blocks.push({ type: 'list', items: list }); list = []; }
  };
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line || /^\|?[-: ]+\|[-|: ]*$/.test(line)) { flush(); return; }
    if (line.startsWith('|')) {
      flush();
      const cells = line.split('|').slice(1, -1).map(x => x.trim()).filter(Boolean);
      if (cells.length) blocks.push({ type: 'tableRow', cells, key: index });
      return;
    }
    const numbered = line.match(/^\d+[.)]\s+(.+)/);
    const bullet = line.match(/^[-*•]\s+(.+)/);
    if (numbered || bullet) { list.push((numbered || bullet)[1]); return; }
    flush();
    const heading = line.match(/^#{1,3}\s+(.+)/);
    blocks.push({ type: heading ? 'heading' : 'paragraph', text: heading ? heading[1] : line, key: index });
  });
  flush();
  return <div className="space-y-3 leading-7">
    {blocks.map((b, i) => b.type === 'list'
      ? <ul key={i} className="space-y-2 pl-5 list-disc">{b.items.map((item, j) => <li key={j}><InlineText text={item}/></li>)}</ul>
      : b.type === 'tableRow'
        ? <div key={b.key} className="rounded-lg bg-violet/5 px-3 py-2 text-sm">{b.cells.map((cell, j) => <span key={j} className={j ? 'ml-2 text-slate-600' : 'font-semibold'}>{cell}</span>)}</div>
        : b.type === 'heading'
          ? <h3 key={b.key} className="pt-1 font-bold text-base"><InlineText text={b.text}/></h3>
          : <p key={b.key}><InlineText text={b.text}/></p>)}
  </div>;
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
      const r = await api('/ai/chat', { method: 'POST', body: { messages: next.slice(-20), context: ctx } });
      setMsgs([...next, { role: 'assistant', content: r.reply, demo: r.demo }]);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <Page title="MYRAVO AI" subtitle="A practical partner for planning, organising and making decisions.">
      <div className="mx-auto max-w-3xl space-y-3">
        {ai === false && <Notice tone="demo"><b>Limited mode.</b> The AI service is not configured. Connect the Groq API key on the backend to enable full answers.</Notice>}
        {ctx && <p className="text-xs text-slate-500">Using your saved trip context: {ctx.destination}, {ctx.days} days.</p>}
        <div className="card min-h-[22rem] space-y-4" aria-live="polite">
          {!msgs.length && <div><p className="mb-3 font-semibold">What would you like to work on?</p><div className="grid gap-2 sm:grid-cols-2">{IDEAS.map((i) => <button key={i} className="btn-ghost justify-start text-left" onClick={() => send(i)}>{i}</button>)}</div></div>}
          {msgs.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[90%] rounded-2xl rounded-br-sm bg-violet px-4 py-3 text-sm text-white' : 'max-w-full rounded-2xl bg-violet/5 px-4 py-4 text-sm text-ink'}>
              {m.demo && <div className="mb-2"><DemoBadge>LIMITED MODE</DemoBadge></div>}
              {m.role === 'user' ? m.content : <AnswerContent content={m.content}/>}
            </div>))}
          {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div>}
          <div ref={end} />
        </div>
        <ErrorBox error={err} />
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask MYRAVO anything about your plans…" aria-label="Message" maxLength={1000} />
          <button className="btn-primary" disabled={busy || !text.trim()} aria-label="Send"><Send className="h-4 w-4" /></button>
        </form>
      </div>
    </Page>
  );
}
