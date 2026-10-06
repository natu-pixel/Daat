export function SectionTransition({ direction }: { direction: "into-dark" | "into-light" }) {
  const dark = direction === "into-dark";
  const id = `section-wave-${direction}`;
  return <div className={`section-transition ${direction}`} aria-hidden="true">
    {/* The wave is oversized and blurred with CSS so its edges fall outside the clipped area. */}
    <svg viewBox="0 0 1440 252" preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="172">
          <stop offset="0%" stopColor={dark ? "#f2f3f4" : "#050926"} />
          <stop offset="35%" stopColor={dark ? "#a9bfeb" : "#2c3a73"} />
          <stop offset="70%" stopColor={dark ? "#33467f" : "#a9bfeb"} />
          <stop offset="100%" stopColor={dark ? "#050926" : "#f2f3f4"} />
        </linearGradient>
      </defs>
      <path d={dark ? "M0 56C330 164 860 -44 1440 60V252H0Z" : "M0 62C420 -46 1000 162 1440 48V252H0Z"} fill={`url(#${id})`} />
    </svg>
  </div>;
}
