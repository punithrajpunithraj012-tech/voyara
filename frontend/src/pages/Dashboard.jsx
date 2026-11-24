import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowUpRight, Sparkles, Map, CalendarDays, Wallet, Users, Compass } from 'lucide-react';
import { FEATURES } from '../features.js';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../api.js';
import { Page } from '../components/UI.jsx';

const QUICK = [
  {to:'/create',label:'Create a plan',sub:'Start something new',icon:Sparkles,tone:'violet'},
  {to:'/map',label:'Explore the map',sub:'Find your way',icon:Map,tone:'teal'},
  {to:'/timetable',label:'My timetable',sub:'See what is ahead',icon:CalendarDays,tone:'amber'},
  {to:'/budget',label:'Manage budget',sub:'Keep it on track',icon:Wallet,tone:'pink'}
];
export default function Dashboard() {
  const {user}=useAuth(); const [due,setDue]=useState([]);
  useEffect(()=>{api('/reminders').then(d=>{const limit=new Date(Date.now()+3*864e5).toISOString().slice(0,10);setDue(d.reminders.filter(r=>!r.done&&r.date<=limit));}).catch(()=>{});},[]);
  const firstName=user?.name?.split(' ')[0] || 'there';
  return <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-9">
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-violet-300/15 bg-[#211b3a] p-6 shadow-glow sm:p-9">
      <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"/><div className="absolute bottom-0 right-1/4 -z-10 h-32 w-32 rounded-full bg-teal-400/10 blur-3xl"/>
      <span className="chip"><Sparkles className="h-3.5 w-3.5"/> YOUR MYRAVO SPACE</span>
      <p className="mt-5 text-sm font-semibold text-violet-100/55">WELCOME BACK</p>
      <h1 className="mt-1 max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-5xl">Good to see you, {firstName}.<br/><span className="text-violet-300">What will you make happen?</span></h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-violet-100/60 sm:text-base">Your plans, people and possibilities belong here. Start with an idea, or pick up where you left off.</p>
      <div className="mt-7 flex flex-wrap gap-3"><Link to="/create" className="btn-primary">Create something <ArrowUpRight className="h-4 w-4"/></Link><Link to="/assistant" className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"><Sparkles className="h-4 w-4"/> Ask AI</Link></div>
    </section>
    {due.length>0&&<div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4"><Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"/><div><p className="font-bold text-amber-100">Reminders coming up</p><ul className="mt-1 text-sm text-amber-100/70">{due.map(r=><li key={r.id}>{r.date}: {r.title}</li>)}</ul></div></div>}
    <section className="mt-9"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-extrabold tracking-[.2em] text-violet-300">JUMP RIGHT IN</p><h2 className="mt-1 font-display text-2xl font-bold" style={{color:'var(--mf-text)'}}>Your shortcuts</h2></div><span className="text-xs" style={{color:'var(--mf-muted)'}}>Made for momentum</span></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{QUICK.map(({to,label,sub,icon:Icon,tone})=><Link key={to} to={to} className="group rounded-3xl border p-4 transition hover:-translate-y-1 hover:shadow-glow" style={{background:'var(--mf-surface)',borderColor:'var(--mf-line)'}}><span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone==='violet'?'bg-violet-400/15 text-violet-300':tone==='teal'?'bg-teal-400/15 text-teal-300':tone==='amber'?'bg-amber-400/15 text-amber-300':'bg-pink-400/15 text-pink-300'}`}><Icon className="h-5 w-5"/></span><p className="mt-4 text-sm font-extrabold" style={{color:'var(--mf-text)'}}>{label}</p><p className="mt-1 text-xs" style={{color:'var(--mf-muted)'}}>{sub}</p></Link>)}</div>
    </section>
    <section className="mt-10"><div className="mb-4"><p className="text-xs font-extrabold tracking-[.2em] text-violet-300">YOUR TOOLKIT</p><h2 className="mt-1 font-display text-2xl font-bold" style={{color:'var(--mf-text)'}}>Everything in one place</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{FEATURES.map((f)=><Link key={f.to} to={f.to} className="group flex items-center gap-4 rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:border-violet-300/30" style={{background:'var(--mf-surface)',borderColor:'var(--mf-line)'}}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow" style={{background:'linear-gradient(135deg,#7657f6,#9b7bff)'}}><f.icon className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block font-display font-bold" style={{color:'var(--mf-text)'}}>{f.title}</span><span className="mt-0.5 block text-xs leading-5" style={{color:'var(--mf-muted)'}}>{f.desc}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-violet-300 transition group-hover:-translate-y-1 group-hover:translate-x-1"/></Link>)}</div>
    </section>
    <p className="mt-10 flex items-center gap-2 text-xs" style={{color:'var(--mf-muted)'}}><Compass className="h-4 w-4"/> AI suggests. You decide. Your plans stay yours.</p>
  </div>;
}