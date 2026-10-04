export function SectionTransition({ direction }: { direction: "into-dark" | "into-light" }) {
  const dark = direction === "into-dark";
  const id = `section-wave-${direction}`;
  return <div className={`section-transition ${direction}`} aria-hidden="true">
    <svg viewBox="0 0 1440 180" preserveAspectRatio="none" focusable="false">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={dark ? "#99bcff" : "#596c9e"} />
        <stop offset="55%" stopColor={dark ? "#273c6b" : "#d4e8f4"} />
        <stop offset="100%" stopColor={dark ? "#050926" : "#f2f3f4"} />
      </linearGradient></defs>
      <path d={dark ? "M0 56C330 164 860 -44 1440 60V180H0Z" : "M0 62C420 -46 1000 162 1440 48V180H0Z"} fill={`url(#${id})`} />
    </svg>
  </div>;
}
