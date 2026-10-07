"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/content-schema";
import { useMotionPreference } from "@/lib/use-motion-preference";

type Poster = Extract<Project["gallery"][number], { kind: "image" }>;

export function PosterWall({ posters, href }: { posters: Poster[]; href: string }) {
  const reduced = useMotionPreference();
  const [paused, setPaused] = useState(false);
  const moving = !reduced;
  const rows = posters.length ? [posters] : [];
  return (
    <div className={`poster-wall ${moving ? "is-moving" : ""} ${paused ? "is-paused" : ""}`} role="region" aria-label="Campaign poster wall">
      {rows.map((row, rowIndex) => <div className="poster-wall-row" key={rowIndex}>
        <div className="poster-wall-track">
          {/* The second copy makes the horizontal loop seamless; it is skipped by assistive technology and the keyboard. */}
          {(moving ? [false, true] : [false]).map((duplicate) => <div className="poster-wall-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
            {row.map((poster) => <Link href={href} key={poster.url} className="poster-preview-image" tabIndex={duplicate ? -1 : undefined}>
              <Image src={poster.url} alt={duplicate ? "" : poster.alt} width={poster.width || 1000} height={poster.height || 1280} sizes="(max-width: 760px) 180px, 300px" />
            </Link>)}
          </div>)}
        </div>
      </div>)}
      {moving && <button type="button" className="poster-wall-control" aria-label={paused ? "Resume poster wall" : "Pause poster wall"} onClick={() => setPaused(!paused)}>{paused ? "▷" : "Ⅱ"}</button>}
    </div>
  );
}
