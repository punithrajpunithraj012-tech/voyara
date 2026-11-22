import { Loader2, AlertTriangle, Info, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, CloudSun } from 'lucide-react';

export const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex items-center gap-2 py-6 text-sm text-slate-500" role="status"><Loader2 className="h-4 w-4 animate-spin" /> {label}</div>
);
export const ErrorBox = ({ error }) => error ? (
  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</div>) : null;
export const Notice = ({ children, tone = 'info' }) => (
  <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${tone === 'demo' ? 'border-sun/50 bg-sun/15 text-amber-900' : 'border-sky/25 bg-sky/5 text-slate-700'}`}>
    <Info className="mt-0.5 h-4 w-4 shrink-0" /> <div>{children}</div></div>
);
export const DemoBadge = ({ children = 'DEMO' }) => <span className="rounded-md bg-sun px-2 py-0.5 text-xs font-bold text-ink">{children}</span>;
export const Page = ({ title, subtitle, actions, children }) => (
  <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 max-w-2xl text-slate-600">{subtitle}</p>}</div>
      {actions}
    </div>
    {children}
  </div>
);

// Open-Meteo uses WMO weather codes.
export function wmo(code) {
  if (code === 0) return ['Clear', Sun];
  if (code <= 3) return ['Partly cloudy', CloudSun];
  if (code === 45 || code === 48) return ['Fog', CloudFog];
  if (code >= 51 && code <= 67) return ['Rain', CloudRain];
  if (code >= 71 && code <= 77) return ['Snow', CloudSnow];
  if (code >= 80 && code <= 82) return ['Showers', CloudRain];
  if (code >= 95) return ['Thunderstorm', CloudLightning];
  return ['Cloudy', Cloud];
}
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
