import PlaceFinder from './PlaceFinder.jsx';
import { Notice } from '../components/UI.jsx';
import { Phone } from 'lucide-react';

const NUMBERS = [
  ['India', 'All emergencies 112 | Police 100 | Fire 101 | Ambulance 102 or 108 | Women helpline 1091 | Child helpline 1098'],
  ['European Union', 'All emergencies 112'],
  ['United States / Canada', 'All emergencies 911'],
  ['United Kingdom', '999 or 112'],
  ['Australia', '000'],
  ['Japan', 'Police 110 | Fire and ambulance 119'],
];
const TIPS = ['Share your live location and itinerary with someone you trust.', 'Keep photos or copies of your ID, tickets and insurance separate from the originals.', 'Save the address and phone number of your stay offline.', 'Use licensed taxis or ride apps and check the vehicle number before boarding.', 'Carry a basic first-aid kit, any regular medicines and some cash.', 'Check local travel advisories and weather before you leave.'];

function Emergency() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card"><h2 className="mb-2 flex items-center gap-2 text-lg font-bold"><Phone className="h-4 w-4 text-coral" /> Emergency numbers</h2>
        <dl className="space-y-2 text-sm">{NUMBERS.map(([c, n]) => <div key={c}><dt className="font-semibold text-ink">{c}</dt><dd className="text-slate-700">{n}</dd></div>)}</dl>
        <p className="mt-3 text-xs text-slate-500">Numbers can change. Confirm them for your destination before you travel.</p></div>
      <div className="card"><h2 className="mb-2 text-lg font-bold">Safety guidance</h2><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{TIPS.map((t) => <li key={t}>{t}</li>)}</ul></div>
    </div>
  );
}

export default function Safety() {
  return <PlaceFinder title="Travel Safety Assistant" subtitle="Emergency numbers, safety tips, and the nearest hospitals, police stations and pharmacies." types={[['hospitals', 'Hospitals and clinics'], ['police', 'Police stations'], ['pharmacy', 'Pharmacies']]} radius={10000} locate extra={<><Notice tone="demo">In an emergency, call the local emergency number first. This map shows places recorded in OpenStreetMap and may be incomplete.</Notice><Emergency /></>} />;
}
