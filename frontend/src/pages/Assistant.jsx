import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Sparkles, Compass, Wallet, CloudSun, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, DemoBadge, Notice } from '../components/UI.jsx';

const IDEAS = [
  { icon: Compass, label: 'Plan my perfect day', prompt: 'Create a memorable one-day itinerary with a relaxed pace and local experiences.' },
  { icon: Wallet, label: 'Make my budget smarter', prompt: 'Help me create a realistic trip budget and show where I can save money.' },
  { icon: CloudSun, label: 'Rain-proof my trip', prompt: 'Suggest a flexible rainy-day backup plan for my trip.' },
  { icon: ShieldCheck, label: 'Travel safer', prompt: 'Give me practical destination-specific travel safety tips.' },
];

function inlineMarkdown(value) {
  const parts = value.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function MarkdownReply({ content }) {
  const lines = content.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i += 1; continue; }
    if (line.startsWith('```')) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i += 1;
      blocks.push(<pre key={blocks.length} className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100"><code>{code.join('\n')}</code></pre>);
      continue;
    }
    if (line.startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const rows = [];
      rows.push(line.split('|').slice(1, -1).map((cell) => cell.trim()));
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim().split('|').slice(1, -1).map((cell) => cell.trim()));
        i += 1;
      }
      blocks.push(<div key={blocks.length} className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[18rem] text-left text-xs"><thead className="bg-slate-50"><tr>{rows[0].map((cell, j) => <th key={j} className="px-3 py-2 font-semibold text-slate-700">{inlineMarkdown(cell)}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, ri) => <tr key={ri} className="border-t border-slate-100">{row.map((cell, j) => <td key={j} className="px-3 py-2 align-top text-slate-600">{inlineMarkdown(cell)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)/);
    if (heading) {
      const Tag = heading[1].length === 1 ? 'h2' : heading[1].length === 2 ? 'h3' : 'h4';
      blocks.push(<Tag key={blocks.length} className={heading[1].length === 1 ? 'text-lg font-bold text-ink' : 'text-sm font-bold text-ink'}>{inlineMarkdown(heading[2])}</Tag>);
      i += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const ordered = /^\d+[.)]\s+/.test(line);
      const items = [];
      while (i < lines.length && (ordered ? /^\s*\d+[.)]\s+/.test(lines[i]) : /^\s*[-*]\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+[.)])\s+/, ''));
        i += 1;
      }
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(<Tag key={blocks.length} className={ordered ? 'list-decimal space-y-1 pl-5' : 'list-disc space-y-1 pl-5'}>{items.map((item, j) => <li key={j}>{inlineMarkdown(item)}</li>)}</Tag>);
      continue;
    }
    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s|^[-*]\s+|^\d+[.)]\s+|^\`\`\`|^\|/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    blocks.push(<p key={blocks.length} className="leading-7 text-slate-700">{inlineMarkdown(paragraph.join(' '))}</p>);
  }
  return <div className="space-y-3 text-sm">{blocks}</div>;
}

export default function Assistant() {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ai, setAi] = useState(null);
  const end = useRef(null);
  const ctx = (() => { try { return JSON.parse(localStorage.getItem('tm_trip') || 'null'); } catch { return null; } })();

  useEffect(() => { api('/ai/status').then((d) => setAi(d.aiConfigured)).catch(() => setAi(false)); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [msgs, busy]);

  async function send(t) {
    const content = (t ?? text).trim();
    if (!content || busy) return;
    const next = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setText('');
    setErr('');
    setBusy(true);
    try {
      const r = await api('/ai/chat', { method: 'POST', body: { messages: next.slice(-20), context: ctx } });
      setMsgs([...next, { role: 'assistant', content: r.reply, demo: r.demo }]);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <Page title="Voyara AI" subtitle="Your thoughtful travel companion, from the first idea to the last mile.">
      <div className="mx-auto max-w-3xl space-y-4">
        {ai === false && <Notice tone="demo"><b>AI connection unavailable.</b> Voyara is using its backup tips right now. Check that GROQ_API_KEY is configured in your backend's Render environment.</Notice>}
        {ctx && <Notice>Using your trip context: <b>{ctx.destination}</b> · {ctx.days} days · {ctx.style} · {ctx.people} traveller(s).</Notice>}
        <div className="overflow-hidden rounded-3xl border border-violet/10 bg-white shadow-sm">
          {!msgs.length && (
            <div className="bg-gradient-to-br from-violet/10 via-white to-sky/10 px-5 py-7 sm:px-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet shadow-sm"><Sparkles className="h-6 w-6" /></div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet">Meet your travel co-pilot</p>
              <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight text-ink sm:text-3xl">Less planning stress.<br />More stories worth telling.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Ask for a route, a smarter budget, hidden local experiences or a backup plan. Voyara will shape the details around your trip.</p>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {IDEAS.map(({ icon: Icon, label, prompt }) => <button key={label} type="button" onClick={() => send(prompt)} className="flex items-center gap-3 rounded-2xl border border-white bg-white/90 p-3 text-left text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-md"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet"><Icon className="h-4 w-4" /></span>{label}</button>)}
              </div>
            </div>
          )}
          {msgs.length > 0 && <div className="max-h-[65vh] min-h-[22rem] space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {msgs.map((m, i) => m.role === 'user' ? (
              <div key={i} className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-violet px-4 py-3 text-sm leading-6 text-white shadow-sm">{m.content}</div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-sky text-white"><Sparkles className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1 space-y-2 rounded-2xl rounded-tl-sm bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink">Voyara {m.demo && <DemoBadge>BACKUP REPLY</DemoBadge>}</div>
                  <MarkdownReply content={m.content} />
                </div>
              </div>
            ))}
            {busy && <div className="flex items-center gap-3 text-sm text-slate-500"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/10 text-violet"><Loader2 className="h-4 w-4 animate-spin" /></span>Voyara is thinking through your trip…</div>}
            <div ref={end} />
          </div>}
        </div>
        <ErrorBox error={err} />
        <form className="flex items-center gap-2 rounded-2xl border border-violet/15 bg-white p-2 shadow-sm focus-within:border-violet/40 focus-within:ring-2 focus-within:ring-violet/10" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-0" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell Voyara what kind of trip you imagine…" aria-label="Message Voyara" maxLength={1000} />
          <button className="btn-primary !rounded-xl !px-3" disabled={busy || !text.trim()} aria-label="Send message"><Send className="h-4 w-4" /></button>
        </form>
        <p className="text-center text-xs text-slate-400">Voyara can make mistakes. Verify important prices, opening hours and travel details before booking.</p>
      </div>
    </Page>
  );
}
