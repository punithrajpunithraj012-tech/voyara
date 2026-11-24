export default function Logo({ size = 40, text = true, light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="MYRAVO, UVCE">
      <img src="/logo.svg" width={size} height={size} alt="" className="shrink-0 rounded-xl" />
      {text && <span className="flex flex-col leading-none">
        <span className={`font-display text-xl font-extrabold tracking-[0.08em] ${light ? 'text-white' : 'text-brand-ink'}`}>MYRAVO</span>
        <span className={`mt-1 text-[9px] font-bold tracking-[0.34em] ${light ? 'text-brand-gold' : 'text-brand-clay'}`}>UVCE</span>
      </span>}
    </span>
  );
}
