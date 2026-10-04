import { BrandMark, Wordmark } from "./brand";

export function ProjectArt({ variant = "identity" }: { variant?: "identity" | "system" }) {
  if (variant === "system") {
    return (
      <div className="system-art" aria-label="DAAT blue color and typography system" role="img">
        <div className="system-top"><span>DAAT® / VISUAL LANGUAGE</span><span>01—06</span></div>
        <div className="type-art">Aa<span>Aspekta<br />Clear by character.</span></div>
        <div className="swatch-row"><span /><span /><span /><span /></div>
      </div>
    );
  }
  return (
    <div className="identity-art" aria-label="DAAT directional mark in blue with a cyan identity card" role="img">
      <div className="art-label"><span>DAAT®</span><span>IDENTITY IN MOTION</span></div>
      <BrandMark className="art-mark" />
      <div className="identity-card"><Wordmark /><span>Clarity in thought.<br />Impact by design.</span><span className="card-corner">↗</span></div>
      <div className="art-bottom"><span>A CONNECTED BRAND SYSTEM</span><span>→</span></div>
    </div>
  );
}
