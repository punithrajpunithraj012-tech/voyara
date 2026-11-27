import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { ErrorBox, Notice } from '../components/UI.jsx';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';

function Shell({ title, subtitle, children, footer }) {
  return <div className="grid min-h-screen lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-[#241719] lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(214,173,104,.25),transparent_35%),linear-gradient(145deg,#241719,#67252a_65%,#392324)]"/>
      <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full border border-[#d6ad68]/15"/>
      <div className="absolute -right-4 bottom-36 h-64 w-64 rounded-full border border-[#d6ad68]/10"/>
      <div className="relative p-10"><Link to="/"><Logo light/></Link></div>
      <div className="absolute bottom-12 left-10 right-12"><p className="mb-4 text-xs font-extrabold tracking-[.25em] text-[#d6ad68]">TRAVEL STARTS HERE</p><p className="max-w-lg font-display text-4xl font-bold leading-tight text-white">The places you dream of. The journeys you make.</p><p className="mt-4 max-w-md text-sm leading-7 text-white/60">Keep your destinations, routes and travel details together with MYRAVO.</p></div>
    </div>
    <div className="flex items-center justify-center px-5 py-10"><div className="w-full max-w-md"><Link to="/" className="mb-8 inline-block lg:hidden"><Logo/></Link><h1 className="text-3xl font-extrabold">{title}</h1><p className="mb-6 mt-1 text-slate-600">{subtitle}</p>{children}<div className="mt-6 text-sm text-slate-600">{footer}</div></div></div>
  </div>;
}
const Field = ({ label, ...props }) => <label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span><input className="input" {...props}/></label>;
const Submit = ({ busy, children }) => <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin"/>}{children}</button>;
function useForm(action) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (event) => { event.preventDefault(); setError(''); setBusy(true); try { await action(new FormData(event.target)); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return { error, busy, run };
}

export function Login() {
  const { signIn } = useAuth(); const nav = useNavigate();
  const form = useForm(async (data) => { signIn(await api('/auth/login', { method: 'POST', body: { email: data.get('email'), password: data.get('password') } })); nav('/dashboard'); });
  return <Shell title="Welcome back" subtitle="Sign in to pick up where your next journey begins." footer={<>New to MYRAVO? <Link className="font-semibold text-brand-wine" to="/register">Create an account</Link></>}>
    <form onSubmit={form.run} className="space-y-4"><Field label="Email address" name="email" type="email" required autoComplete="email"/><Field label="Password" name="password" type="password" required autoComplete="current-password"/><ErrorBox error={form.error}/><Submit busy={form.busy}>Sign in</Submit><Link to="/forgot" className="block text-center text-sm font-semibold text-brand-wine">Forgot password?</Link></form>
  </Shell>;
}

export function Register() {
  const { signIn } = useAuth(); const nav = useNavigate();
  const form = useForm(async (data) => { if (data.get('password') !== data.get('confirm')) throw new Error('The passwords do not match.'); signIn(await api('/auth/register', { method: 'POST', body: { name: data.get('name'), email: data.get('email'), password: data.get('password') } })); nav('/dashboard'); });
  return <Shell title="Create your MYRAVO account" subtitle="A better way to discover, plan and enjoy your trips." footer={<>Already have an account? <Link className="font-semibold text-brand-wine" to="/login">Sign in</Link></>}>
    <form onSubmit={form.run} className="space-y-4"><Field label="Your name" name="name" required minLength={2} autoComplete="name"/><Field label="Email address" name="email" type="email" required autoComplete="email"/><Field label="Password (at least 8 characters, including a letter and a number)" name="password" type="password" required minLength={8} autoComplete="new-password"/><Field label="Confirm password" name="confirm" type="password" required minLength={8} autoComplete="new-password"/><ErrorBox error={form.error}/><Submit busy={form.busy}>Create account</Submit></form>
  </Shell>;
}

export function Forgot() {
  const [stage, setStage] = useState('ask'); const [email, setEmail] = useState(''); const [info, setInfo] = useState(null); const [done, setDone] = useState('');
  const ask = useForm(async (data) => { const address = data.get('email'); setEmail(address); const result = await api('/auth/forgot', { method: 'POST', body: { email: address } }); setInfo(result); setStage('reset'); });
  const reset = useForm(async (data) => { const result = await api('/auth/reset', { method: 'POST', body: { email, code: data.get('code'), password: data.get('password') } }); setDone(result.message); });
  return <Shell title="Reset your password" subtitle="We’ll help you get back to your trips." footer={<Link className="font-semibold text-brand-wine" to="/login">Back to sign in</Link>}>
    {done ? <Notice>{done} <Link className="font-semibold text-brand-wine" to="/login">Sign in</Link></Notice> : stage === 'ask' ?
      <form onSubmit={ask.run} className="space-y-4"><Field label="Account email" name="email" type="email" required autoComplete="email"/><ErrorBox error={ask.error}/><Submit busy={ask.busy}>Send reset instructions</Submit></form> :
      <form onSubmit={reset.run} className="space-y-4">
        {info?.demo ? <Notice tone="demo"><b>Development mode:</b> email delivery is not configured. Use this local test code: <span className="font-mono font-bold">{info.demoCode}</span></Notice> :
          <Notice><span className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4"/> Check your inbox</span>If the address belongs to an account, a one-time reset code has been sent. It expires in 15 minutes.</Notice>}
        <Field label="One-time reset code" name="code" required autoComplete="one-time-code"/>
        <Field label="New password" name="password" type="password" required minLength={8} autoComplete="new-password"/>
        <ErrorBox error={reset.error}/><Submit busy={reset.busy}>Update password</Submit>
      </form>}
  </Shell>;
}
