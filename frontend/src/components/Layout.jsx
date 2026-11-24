import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Compass, Plus, Users } from 'lucide-react';
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
  const nav=useNavigate();
  const link=({isActive})=>`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${isActive?'bg-gradient-to-r from-brand-wine to-brand-clay text-white shadow-md':'text-white/75 hover:bg-white/10 hover:text-white'}`;
  return <div className="flex min-h-screen bg-sand">
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-white/10 bg-ink p-4 transition-transform lg:static lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="mb-5 flex items-center justify-between"><Link to="/dashboard"><Logo light/></Link><button className="text-white lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <nav className="space-y-1" onClick={()=>setOpen(false)}><NavLink to="/dashboard" className={link}><LayoutDashboard className="h-4 w-4"/> Home</NavLink>
        {FEATURES.map(f=><NavLink key={f.to} to={f.to} className={link}><f.icon className="h-4 w-4"/>{f.title}</NavLink>)}
        <NavLink to="/profile" className={link}><User className="h-4 w-4"/> Profile and reminders</NavLink>
      </nav>
    </aside>
    {open&&<div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={()=>setOpen(false)}/>}
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between border-b border-brand-wine/10 bg-brand-ivory/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-3"><button className="lg:hidden" onClick={()=>setOpen(true)} aria-label="Open all features"><Menu/></button><span className="text-sm font-bold tracking-widest text-brand-wine lg:hidden">MYRAVO</span><span className="hidden text-sm text-slate-600 lg:block">Hello, <b className="text-ink">{user?.name}</b></span></div>
        <button className="btn-ghost" onClick={()=>{signOut();nav('/');}}><LogOut className="h-4 w-4"/> Log out</button>
      </header>
      <main className="flex-1 pb-24 lg:pb-5"><Outlet/></main>
    </div>
    <nav aria-label="Main mobile navigation" className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-wine/10 bg-white/95 px-2 pt-2 shadow-[0_-8px_28px_rgba(50,23,25,0.08)] backdrop-blur lg:hidden" style={{paddingBottom:'max(env(safe-area-inset-bottom), 0.5rem)'}}>
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end">
        {MOBILE_TABS.map(({to,label,icon:Icon,create})=><NavLink key={to} to={to} aria-label={label} className={({isActive})=>create?'flex min-h-14 -translate-y-2 flex-col items-center justify-center gap-1 text-[10px] font-bold text-brand-wine':`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition ${isActive?'text-brand-wine':'text-slate-500'}`}>
          {({isActive})=><><span className={create?'grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-wine to-brand-clay text-white shadow-lg shadow-brand-wine/25':`grid h-7 w-9 place-items-center rounded-xl ${isActive?'bg-brand-gold/20':'bg-transparent'}`}><Icon className={create?'h-6 w-6':'h-5 w-5'} strokeWidth={isActive||create?2.5:2}/></span><span>{label}</span></>}
        </NavLink>)}
      </div>
    </nav>
  </div>;
}
