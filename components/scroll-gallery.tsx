"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { BrandMark, Wordmark } from "./brand";
import { ProjectArt } from "./project-art";
import type { Project } from "@/lib/content-schema";
import { Reveal } from "./reveal";

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia("(min-width: 761px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function desktopSnapshot() {
  return window.matchMedia("(min-width: 761px)").matches;
}

const scenes = ["Identity, with direction.", "A clear visual language.", "A spectrum of possibility.", "Built for the digital world.", "An identity that moves."];
const palette = [
  ["Palatinate Blue", "#2a41f1", "#f2f3f4"],
  ["Deep Cove", "#050926", "#f2f3f4"],
  ["Azure", "#3c7eff", "#050926"],
  ["Daat Blue", "#a2e8f9", "#050926"],
  ["Jordy Blue", "#99bcff", "#050926"],
  ["Ghost White", "#f2f3f4", "#050926"],
];

function Scene({ index }: { index: number }) {
  if (index === 0) return <ProjectArt />;
  if (index === 1) return <ProjectArt variant="system" />;
  if (index === 2) return <div className="palette-art" role="img" aria-label="The six DAAT brand colors">{palette.map(([name, hex, text]) => <div key={name} style={{ background: hex, color: text }}><span>{name}</span><small>{hex.toUpperCase()}</small></div>)}</div>;
  if (index === 3) return <div className="digital-art" role="img" aria-label="DAAT responsive website design"><div className="digital-window"><div className="digital-window-top"><Wordmark /><span>WORK / STUDIO / SERVICES</span></div><h3>Clarity in thought.<br /><span>Impact by design.</span></h3><div className="digital-window-banner"><BrandMark /></div></div></div>;
  return <div className="motion-art" role="img" aria-label="DAAT motion identity"><div className="motion-art-circle" /><BrandMark /><span>THINK CLEAR. MOVE FORWARD.</span></div>;
}

export function ScrollGallery({ media, studioStudy = false, heading, credit }: { media?: Project["gallery"]; studioStudy?: boolean; heading?: string; credit?: string }) {
  const target = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const desktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, () => false);
  const reducedMotion = useMotionPreference();
  const pinned = desktop && reducedMotion === false;
  const count = studioStudy ? scenes.length : (media?.length || 0);
  const width = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const x = useTransform(() => pinned ? -scrollYProgress.get() * width.get() * (count - 1) : 0);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => width.set(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  if (count === 0) return null;
  return (
    <article className={`scroll-gallery ${pinned ? "is-pinned" : ""}`} aria-labelledby="gallery-title">
      <header className="gallery-header">
        <Reveal><span className="eyebrow">DAAT® / IN DETAIL</span><h2 id="gallery-title">{heading || (studioStudy ? "One identity.\nMany expressions." : "A closer look.")}</h2><a href="#gallery-end" className="gallery-skip">Skip gallery ↓</a></Reveal>
        <span className="gallery-hint">{pinned ? "SCROLL TO EXPLORE →" : "EXPLORE THE COLLECTION ↓"}</span>
      </header>
      <div ref={target} className="gallery-track" style={{ height: pinned && count > 1 ? `${count * 100}svh` : "auto" }}>
        <div ref={viewport} className="gallery-sticky">
          <motion.ul className="gallery-panels" style={{ x }}>
            {Array.from({ length: count }, (_, index) => {
              const asset = media?.[index];
              return (
                <li className="gallery-panel" key={studioStudy ? scenes[index] : `${asset?.url}-${index}`} onFocusCapture={() => {
                  if (!pinned || count < 2 || !target.current || !viewport.current) return;
                  viewport.current.scrollLeft = 0;
                  const top = target.current.getBoundingClientRect().top + window.scrollY;
                  const distance = target.current.offsetHeight - viewport.current.offsetHeight;
                  window.scrollTo({ top: top + distance * index / (count - 1), behavior: "instant" });
                }}>
                  <div className={`gallery-panel-art${!studioStudy && asset?.kind === "image" ? " is-image" : ""}`}>
                    {studioStudy ? <Scene index={index} /> : asset?.kind === "image" ? <Image src={asset.url} alt={asset.alt} width={asset.width || 1600} height={asset.height || 900} sizes="90vw" /> : asset?.kind === "video" ? <video controls preload="none" poster={asset.poster} aria-label={asset.alt}><source src={asset.url} />Your browser does not support this video.</video> : null}
                  </div>
                  <div className="gallery-caption"><span>#{String(index + 1).padStart(3, "0")}</span><span>{studioStudy ? scenes[index] : asset?.alt}</span><span>DAAT®</span></div>
                </li>
              );
            })}
          </motion.ul>
          {pinned && count > 1 && <div className="gallery-progress" aria-hidden="true"><motion.div style={{ scaleX: scrollYProgress }} /></div>}
        </div>
      </div>
      <footer className="gallery-footer" id="gallery-end" tabIndex={-1}><span>{credit || (studioStudy ? "DAAT identity / Studio study" : "Project imagery")}</span><span>Brand. Digital. Motion.</span></footer>
    </article>
  );
}
