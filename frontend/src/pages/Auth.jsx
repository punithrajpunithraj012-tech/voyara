import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import { ErrorBox, Notice } from '../components/UI.jsx';
import { Loader2 } from 'lucide-react';

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src="/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/30" />
        <div className="relative p-10"><Link to="/"><Logo light /></Link></div>
        <p className="absolute bottom-10 left-10 right-10 font-display text-3xl font-bold text-white">Plan less. Wander more..</p>
      </div>
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-block lg:hidden"><Logo /></Link>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mb-6 mt-1 text-slate-600">{subtitle}</p>
          {children}
          <div className="mt-6 text-sm text-slate-600">{footer}</div>
        </div>
      </div>
    </div>
  );
}
const Field = ({ label, ...p }) => (
  <label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span><input className="input" {...p} /></label>
);
const Submit = ({ busy, children }) => (
  <button className="btn-primary w-full py-3" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{children}</button>
);

function useForm(action) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (e) => { e.preventDefault(); setError(''); setBusy(true); try { await action(new FormData(e.target)); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return { error, busy, run };
}

export function Login() {
  const { signIn } = useAuth(); const nav = useNavigate();
  const f = useForm(async (d) => { signIn(await api('/auth/login', { method: 'POST', body: { email: d.get('email'), password: d.get('password') } })); nav('/dashboard'); });
  return (
    <Shell title="Welcome back" subtitle="Log in to continue planning." footer={<>New here? <Link className="font-semibold text-violet" to="/register">Create an account</Link></>}>
      <form onSubmit={f.run} className="space-y-4">
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Password" name="password" type="password" required autoComplete="current-password" />
        <ErrorBox error={f.error} />
        <Submit busy={f.busy}>Log in</Submit>
        <Link to="/forgot" className="block text-center text-sm font-semibold text-violet">Forgot password?</Link>
      </form>
    </Shell>
  );
}

export function Register() {
  const { signIn } = useAuth(); const nav = useNavigate();
  const f = useForm(async (d) => {
    if (d.get('password') !== d.get('confirm')) throw new Error('The two passwords do not match.');
    signIn(await api('/auth/register', { method: 'POST', body: { name: d.get('name'), email: d.get('email'), password: d.get('password') } })); nav('/dashboard');
  });
  return (
    <Shell title="Create your account" subtitle="Save trips, track spending and plan with friends." footer={<>Already registered? <Link className="font-semibold text-violet" to="/login">Log in</Link></>}>
      <form onSubmit={f.run} className="space-y-4">
        <Field label="Full name" name="name" required minLength={2} autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Password (8+ characters, with a letter and a number)" name="password" type="password" required minLength={8} autoComplete="new-password" />
        <Field label="Confirm password" name="confirm" type="password" required autoComplete="new-password" />
        <ErrorBox error={f.error} />
        <Submit busy={f.busy}>Create account</Submit>
      </form>
    </Shell>
  );
}

export function Forgot() {
  const [stage, setStage] = useState('ask'); const [email, setEmail] = useState(''); const [info, setInfo] = useState(null); const [done, setDone] = useState('');
  const ask = useForm(async (d) => { const em = d.get('email'); setEmail(em); setInfo(await api('/auth/forgot', { method: 'POST', body: { email: em } })); setStage('reset'); });
  const reset = useForm(async (d) => { const r = await api('/auth/reset', { method: 'POST', body: { email, code: d.get('code'), password: d.get('password') } }); setDone(r.message); });
  return (
    <Shell title="Reset your password" subtitle="Enter your email to get a reset code." footer={<Link className="font-semibold text-violet" to="/login">Back to log in</Link>}>
      {done ? <Notice>{done} <Link className="font-semibold text-violet" to="/login">Log in</Link></Notice> : stage === 'ask' ? (
        <form onSubmit={ask.run} className="space-y-4"><Field label="Email" name="email" type="email" required /><ErrorBox error={ask.error} /><Submit busy={ask.busy}>Get reset code</Submit></form>
      ) : (
        <form onSubmit={reset.run} className="space-y-4">
          <Notice tone="demo"><b>Demo mode:</b> Voyara has no email server yet. {info?.demoCode ? <>Your code is <b className="font-mono">{info.demoCode}</b> (also printed in the backend terminal).</> : 'If the account exists, the code is printed in the backend terminal.'}</Notice>
          <Field label="Reset code" name="code" required /><Field label="New password" name="password" type="password" required minLength={8} />
          <ErrorBox error={reset.error} /><Submit busy={reset.busy}>Set new password</Submit>
        </form>
      )}
    </Shell>
  );
}
