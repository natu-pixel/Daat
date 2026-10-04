"use client";

import Image from "next/image";
import { useState } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { projectLogos } from "@/lib/project-logos";

export function LogoTicker({ projectSlugs }: { projectSlugs: string[] }) {
  const reduced = useMotionPreference();
  const [paused, setPaused] = useState(false);
  const logos = projectLogos.filter((logo) => projectSlugs.includes(logo.slug));
  if (!logos.length) return null;
  return <section className={`logo-ticker ${!reduced ? "is-moving" : ""} ${paused ? "is-paused" : ""}`} aria-label="Selected project logos">
    <div className="logo-ticker-window">
      <div className="logo-ticker-track">
        {[false, true].map((duplicate) => <ul className="logo-ticker-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
          {logos.map((logo) => <li key={logo.slug}><Image src={logo.src} alt={duplicate ? "" : logo.name} width={logo.width} height={logo.height} unoptimized /></li>)}
        </ul>)}
      </div>
    </div>
    {!reduced && <button type="button" className="logo-ticker-control" aria-label={paused ? "Resume logo ticker" : "Pause logo ticker"} onClick={() => setPaused(!paused)}>{paused ? "▷" : "Ⅱ"}</button>}
  </section>;
}
