// Deterministic hue per proxy type so unknown protocols get a color too —
// types are dynamic and never enumerated.
function hueFor(type: string): number {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) % 360;
  return hash;
}

export default function TypeBadge({ type }: { type: string }) {
  const hue = hueFor(type);
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color: `hsl(${hue} 60% 70%)`,
        backgroundColor: `hsl(${hue} 60% 70% / 0.12)`,
      }}
    >
      {type}
    </span>
  );
}
