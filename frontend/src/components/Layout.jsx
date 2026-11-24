import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Compass, Plus, Users, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext.jsx';
import Logo from './Logo.jsx';
import { FEATURES } from '../features.js';
import { useAuth } from '../AuthContext.jsx';

const MOBILE_TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/create', label: 'Create', icon: Plus, create: true },
  { to: '/group', label: 'Groups', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const [open,setOpen]=useState(false);
  const {user,signOut}=useAuth();
  const {theme,toggleTheme}=useTheme();
  const nav=useNavigate();
  const link=({isActive})=>`flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${isActive?'bg-white/15 text-white shadow-inner':'text-white/70 hover:bg-white/10 hover:text-white'}`;
  return <div className="flex min-h-screen" style={{background:'var(--mf-bg)',color:'var(--mf-text)'}}>
    <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] overflow-y-auto border-r border-white/10 bg-[#171426] p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="mb-8 flex items-center justify-between"><Link to="/dashboard"><Logo light/></Link><button className="text-white lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <div className="mb-3 flex items-center gap-2 px-3 text-[10px] font-extrabold uppercase tracking-[.22em] text-violet-200/60"><Sparkles className="h-3.5 w-3.5"/> Workspace</div>
      <nav className="space-y-1" onClick={()=>setOpen(false)}><NavLink to="/dashboard" className={link}><LayoutDashboard className="h-[18px] w-[18px]"/> Home</NavLink>
        {FEATURES.map(f=><NavLink key={f.to} to={f.to} className={link}><f.icon className="h-[18px] w-[18px]"/>{f.title}</NavLink>)}
        <NavLink to="/profile" className={link}><User className="h-[18px] w-[18px]"/> Profile and reminders</NavLink>
      </nav>
      <div className="mt-8 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/5 p-4">
        <span className="chip"><Sparkles className="h-3 w-3"/> MYRAVO FUTURE</span>
        <p className="mt-3 text-sm font-bold text-white">Make room for what matters.</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">Your plans, people and possibilities in one place.</p>
      </div>
    </aside>
    {open&&<div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={()=>setOpen(false)}/>}
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex min-h-[68px] items-center justify-between border-b px-4 py-2 backdrop-blur-xl sm:px-6" style={{background:'color-mix(in srgb, var(--mf-bg) 88%, transparent)',borderColor:'var(--mf-line)'}}>
        <div className="flex items-center gap-3"><button className="btn-ghost !min-h-10 !px-3 lg:hidden" onClick={()=>setOpen(true)} aria-label="Open all features"><Menu/></button><span className="text-sm font-extrabold tracking-[.2em] text-violet-300 lg:hidden">MYRAVO</span><span className="hidden text-sm lg:block" style={{color:'var(--mf-muted)'}}>Welcome back, <b style={{color:'var(--mf-text)'}}>{user?.name}</b></span></div>
        <div className="flex items-center gap-2"><button className="btn-ghost !min-h-10 !px-3" onClick={toggleTheme} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} title={theme==='dark'?'Light mode':'Dark mode'}>{theme==='dark'?<Sun className="h-4 w-4"/>:<Moon className="h-4 w-4"/>}<span className="hidden sm:inline">{theme==='dark'?'Light':'Dark'}</span></button><button className="btn-ghost !min-h-10 !px-3" onClick={()=>{signOut();nav('/');}}><LogOut className="h-4 w-4"/><span className="hidden sm:inline">Log out</span></button></div>
      </header>
      <main className="flex-1 pb-24 lg:pb-8"><Outlet/></main>
    </div>
    <nav aria-label="Main mobile navigation" className="fixed inset-x-0 bottom-0 z-20 border-t px-2 pt-2 shadow-[0_-8px_32px_rgba(10,8,25,.2)] backdrop-blur-xl lg:hidden" style={{background:'color-mix(in srgb, var(--mf-surface) 94%, transparent)',borderColor:'var(--mf-line)',paddingBottom:'max(env(safe-area-inset-bottom), 0.5rem)'}}>
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end">
        {MOBILE_TABS.map(({to,label,icon:Icon,create})=><NavLink key={to} to={to} aria-label={label} className={({isActive})=>create?'flex min-h-14 -translate-y-2 flex-col items-center justify-center gap-1 text-[10px] font-extrabold text-violet-300':`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${isActive?'text-violet-300':'text-slate-400'}`}>
          {({isActive})=><><span className={create?'grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-glow':'grid h-8 w-9 place-items-center rounded-xl'}><Icon className={create?'h-6 w-6':'h-5 w-5'} strokeWidth={isActive||create?2.5:2}/></span><span>{label}</span></>}
        </NavLink>)}
      </div>
    </nav>
  </div>;
}