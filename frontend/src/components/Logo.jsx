export default function Logo({ size = 40, text = true, light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/logo.svg" width={size} height={size} alt="" />
      {text && <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Voyara</span>}
    </span>
  );
}
