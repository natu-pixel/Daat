import geometry from "@/public/brand/geometry.json";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox={geometry.mark.viewBox} fill="currentColor" aria-hidden="true" focusable="false">
      {geometry.mark.paths.map((d) => <path d={d} key={d} />)}
      {geometry.mark.rects.map((rect, index) => <rect {...rect} key={index} />)}
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label="DAAT">
      <svg className="wordmark-logo" viewBox={geometry.wordmark.viewBox} fill="currentColor" aria-hidden="true" focusable="false">
        {geometry.wordmark.paths.map((d) => <path d={d} key={d} />)}
        {geometry.wordmark.rects.map((rect, index) => <rect {...rect} key={index} />)}
      </svg>
    </span>
  );
}
