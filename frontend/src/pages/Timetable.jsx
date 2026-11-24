import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Download, Sparkles, Trash2, Clock, Users, UserRound } from 'lucide-react';
import { api } from '../api.js';
import { Page, ErrorBox, Notice, Spinner } from '../components/UI.jsx';

const blank = () => ({ title:'', details:'', category:'task', date:new Date().toISOString().slice(0,10), start:'09:00', end:'10:00', groupId:'' });
const iso = (date,time) => { const d = new Date(`${date}T${time}:00`); return d.toISOString(); };
const localDate = (value) => { const d=new Date(value); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
const localTime = (value) => new Date(value).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
function downloadCalendar(events) {
  const esc = (s) => String(s||'').replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');
  const stamp = (v) => new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MYRAVO//Timetable//EN',...events.flatMap(e=>[
    'BEGIN:VEVENT',`UID:myravo-${e.id}@myravo.app`, `DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(e.startsAt)}`,`DTEND:${stamp(e.endsAt)}`,`SUMMARY:${esc(e.title)}`,`DESCRIPTION:${esc(e.details)}`,'END:VEVENT'
  ]),'END:VCALENDAR'];
  const a=document.createElement('a'); const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'})); a.href=url; a.download='MYRAVO-timetable.ics'; a.click(); URL.revokeObjectURL(url);
}
export default function Timetable() {
  const [events,setEvents]=useState(null); const [groups,setGroups]=useState([]); const [form,setForm]=useState(blank); const [editing,setEditing]=useState(null);
  const [err,setErr]=useState(''); const [busy,setBusy]=useState(false); const [ai,setAi]=useState(''); const [aiBusy,setAiBusy]=useState(false);
  const [scope,setScope]=useState('all'); const [week,setWeek]=useState(0);
  async function load(){
    // The personal timetable must remain usable even if group data is temporarily unavailable.
    const t = await api('/timetable');
    setEvents(Array.isArray(t.events) ? t.events : []);
    try {
      const g = await api('/groups');
      setGroups(Array.isArray(g.groups) ? g.groups : []);
    } catch {
      setGroups([]);
    }
  }
  useEffect(()=>{load().catch(e=>setErr(e.message));},[]);
  const shown=useMemo(()=>{if(!events)return[];const start=new Date();start.setDate(start.getDate()+week*7);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+7);return events.filter(e=>(scope==='all'||(scope==='personal'?!e.groupId:String(e.groupId)===scope))&&new Date(e.startsAt)>=start&&new Date(e.startsAt)<end).sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt));},[events,scope,week]);
  function beginEdit(e){setEditing(e.id);setForm({title:e.title,details:e.details,category:e.category,date:localDate(e.startsAt),start:localTime(e.startsAt),end:localTime(e.endsAt),groupId:e.groupId?String(e.groupId):''});}
  async function save(e){e.preventDefault();setErr('');setBusy(true);try{const body={title:form.title,details:form.details,category:form.category,startsAt:iso(form.date,form.start),endsAt:iso(form.date,form.end),groupId:form.groupId?Number(form.groupId):null};if(editing)await api('/timetable/'+editing,{method:'PUT',body});else await api('/timetable',{method:'POST',body});setForm(blank());setEditing(null);await load();}catch(x){setErr(x.message);}finally{setBusy(false);}}
  async function remove(id){if(!confirm('Delete this timetable item?'))return;try{await api('/timetable/'+id,{method:'DELETE'});await load();}catch(e){setErr(e.message);}}
  async function askAI(){setAiBusy(true);setErr('');try{const r=await api('/ai/chat',{method:'POST',body:{messages:[{role:'user',content:'Suggest a practical weekly timetable for me with study/work blocks, breaks, exercise and personal time. Return a simple day-wise schedule with times. Do not assume fixed commitments. Clearly say this is a suggestion that I can edit.'}]}});setAi(r.reply);}catch(e){setErr(e.message);}finally{setAiBusy(false);}}
  if(!events && err) return <Page title="Timetable" subtitle="Your schedule, in one simple place."><ErrorBox error={err}/><p className="mt-3 text-sm text-slate-500">The timetable service could not be reached. Refresh after the server finishes updating.</p><button className="btn-primary mt-3" onClick={()=>{setErr('');load().catch(e=>setErr(e.message));}}>Try again</button></Page>;
  if(!events)return <Page title="Timetable" subtitle="Your schedule, in one simple place."><Spinner label="Loading your schedule…"/></Page>;
  return <Page title="Timetable" subtitle="Your personal and shared plans, organised by time." actions={<button className="btn-ghost" onClick={()=>downloadCalendar(events)}><Download className="h-4 w-4"/> Export calendar</button>}>
    <ErrorBox error={err}/>
    <div className="mb-4 grid gap-3 sm:grid-cols-2">
      <div className="card flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gold/20 text-brand-wine"><UserRound/></span><div><b>Personal timetable</b><p className="text-xs text-slate-500">Your private classes, work and reminders</p></div></div>
      <div className="card flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-clay/15 text-brand-clay"><Users/></span><div><b>Team and group timetable</b><p className="text-xs text-slate-500">Shared with members of the selected group</p></div></div>
    </div>
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
      <div className="space-y-4">
        <section className="card space-y-3">
          <div className="flex items-center justify-between gap-2"><h2 className="font-display text-lg font-bold">{editing?'Edit schedule item':'Add to timetable'}</h2><span className="chip">Manual control</span></div>
          <form onSubmit={save} className="space-y-3">
            <label className="block text-sm font-semibold">Title<input className="input mt-1" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Project meeting" required maxLength={120}/></label>
            <label className="block text-sm font-semibold">Notes<textarea className="input mt-1" rows="2" value={form.details} onChange={e=>setForm({...form,details:e.target.value})} placeholder="Location, agenda or details"/></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm font-semibold">Type<select className="input mt-1" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="task">Task</option><option value="class">Class</option><option value="meeting">Meeting</option><option value="event">Event</option><option value="personal">Personal</option></select></label>
              <label className="text-sm font-semibold">Visibility<select className="input mt-1" value={form.groupId} onChange={e=>setForm({...form,groupId:e.target.value})}><option value="">Personal only</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="col-span-3 text-sm font-semibold sm:col-span-1">Date<input type="date" className="input mt-1" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required/></label>
              <label className="text-sm font-semibold">Start<input type="time" className="input mt-1" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} required/></label>
              <label className="text-sm font-semibold">End<input type="time" className="input mt-1" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} required/></label>
            </div>
            <div className="flex gap-2"><button disabled={busy} className="btn-primary flex-1"><Plus className="h-4 w-4"/>{busy?'Saving...':editing?'Save changes':'Add schedule item'}</button>{editing&&<button type="button" className="btn-ghost" onClick={()=>{setEditing(null);setForm(blank());}}>Cancel</button>}</div>
          </form>
        </section>
        <section className="card space-y-3">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-clay"/><h2 className="font-display text-lg font-bold">AI timetable ideas</h2></div>
          <p className="text-sm text-slate-600">Get a suggested routine, then choose what to add. Nothing is saved without your approval.</p>
          <button className="btn-accent w-full" onClick={askAI} disabled={aiBusy}>{aiBusy?'Thinking...':'Suggest a weekly routine'}</button>
          {ai&&<div className="rounded-xl border border-violet/15 p-3 text-sm leading-6 whitespace-pre-wrap"><b className="mb-2 block">Suggested routine · not saved</b>{ai}</div>}
        </section>
      </div>
      <section className="card min-w-0 space-y-3">
        <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-brand-wine"/><h2 className="font-display text-lg font-bold">Your schedule</h2></div>
        <select className="input" value={scope} onChange={e=>setScope(e.target.value)}><option value="all">Personal + all groups</option><option value="personal">Personal only</option>{groups.map(g=><option key={g.id} value={String(g.id)}>{g.name}</option>)}</select>
        <div className="flex items-center justify-between"><button className="btn-ghost" onClick={()=>setWeek(w=>w-1)}>Previous</button><span className="text-xs font-semibold text-slate-500">{week===0?'This week':week>0?`In ${week} week(s)`:`${Math.abs(week)} week(s) ago`}</span><button className="btn-ghost" onClick={()=>setWeek(w=>w+1)}>Next</button></div>
        {shown.length===0?<Notice>No schedule items in this week. Add one manually or ask AI for ideas.</Notice>:<ul className="space-y-2">{shown.map(e=><li key={e.id} className="rounded-2xl border border-brand-wine/10 p-3">
          <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-bold">{e.title}</span><span className="chip">{e.category}</span></div><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3"/>{new Date(e.startsAt).toLocaleDateString()} · {localTime(e.startsAt)}–{localTime(e.endsAt)}</p>{e.details&&<p className="mt-1 text-sm text-slate-600">{e.details}</p>}<p className="mt-1 text-xs text-brand-clay">{e.groupId?'Shared group schedule':'Private schedule'}</p></div>
            <div className="flex shrink-0 gap-1"><button className="btn-ghost !px-2" onClick={()=>beginEdit(e)}>Edit</button><button className="btn-danger" onClick={()=>remove(e.id)} aria-label="Delete item"><Trash2 className="h-4 w-4"/></button></div>
          </div>
        </li>)}</ul>}
      </section>
    </div>
  </Page>;
}
