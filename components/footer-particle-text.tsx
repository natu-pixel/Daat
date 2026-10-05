"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDecorativeLoop, type DecorativePointer } from "@/lib/use-decorative-motion";
import { createTextParticles, textGatherDuration, textGatherStagger, textParticlePosition, type TextParticle, type TextTarget } from "@/lib/particle-text";

type TextModel = {
  context: CanvasRenderingContext2D;
  particles: TextParticle[];
  width: number;
  height: number;
  textWidth: number;
  textHeight: number;
  padding: number;
  radius: number;
};

const colors = Array.from({ length: 8 }, (_, index) => `rgb(${Math.round(242 - index / 7 * 80)}, ${Math.round(243 - index / 7 * 11)}, ${Math.round(244 + index / 7 * 5)})`);

export function FooterParticleText({ enabled }: { enabled: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const model = useRef<TextModel | null>(null);
  const gatherStart = useRef<number | null>(null);
  const time = useRef(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onError = useCallback((cause: unknown) => {
    console.error("Footer text animation failed:", cause);
    setError(current => current || "The text animation couldn't start. The readable headline is shown instead.");
  }, []);
  const draw = useCallback((elapsed: number, pointer: DecorativePointer) => {
    const current = model.current;
    if (!current || !canvas.current) throw new Error("Footer text particle surface is unavailable.");
    time.current = elapsed;
    if (gatherStart.current === null) gatherStart.current = elapsed;
    const progress = (elapsed - gatherStart.current) * 1000;
    const { context, particles, width, height, textWidth, textHeight, padding, radius } = current;
    const cursor = { x: (pointer.x + 1) * textWidth / 2 + padding, y: (pointer.y + 1) * textHeight / 2 + padding, strength: pointer.strength };
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      const point = textParticlePosition(particle, progress, cursor, radius);
      particle.currentX += (point.x - particle.currentX) * .3;
      particle.currentY += (point.y - particle.currentY) * .3;
      context.fillStyle = colors[particle.tone];
      context.globalAlpha = point.alpha;
      context.fillRect(particle.currentX - particle.size / 2, particle.currentY - particle.size / 2, particle.size, particle.size);
    }
    context.globalAlpha = 1;
    canvas.current.dataset.textPhase = progress < textGatherDuration + textGatherStagger ? "gathering" : "formed";
  }, []);
  const host = useDecorativeLoop(enabled && ready && !error, draw, onError, "self");

  useEffect(() => {
    const label = heading.current;
    const surface = canvas.current;
    if (!label || !surface) return;
    let build = 0;
    let cancelled = false;
    async function sample() {
      const version = ++build;
      try {
        if (!label || !surface) throw new Error("Footer text elements are unavailable.");
        const style = getComputedStyle(label);
        const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        await document.fonts.load(font);
        await document.fonts.ready;
        if (cancelled || version !== build) return;
        const bounds = label.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const fontSize = parseFloat(style.fontSize);
        if (!Number.isFinite(fontSize) || fontSize <= 0) throw new Error("Footer text font size is invalid.");
        const padding = Math.min(64, Math.ceil(fontSize * .45));
        const width = Math.ceil(bounds.width + padding * 2);
        const height = Math.ceil(bounds.height + padding * 2);
        const mask = document.createElement("canvas");
        mask.width = width;
        mask.height = height;
        const ink = mask.getContext("2d", { willReadFrequently: true });
        const context = surface.getContext("2d");
        if (!ink || !context) throw new Error("Canvas text rendering is unavailable.");
        ink.font = font;
        ink.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
        ink.textBaseline = "alphabetic";
        ink.fillStyle = "#ffffff";
        for (const line of label.querySelectorAll<HTMLElement>(".particle-text-line")) {
          const baseline = line.querySelector<HTMLElement>(".particle-text-baseline");
          if (!baseline || !line.firstChild?.textContent) throw new Error("Footer text line is incomplete.");
          ink.fillText(line.firstChild.textContent, line.getBoundingClientRect().left - bounds.left + padding, baseline.getBoundingClientRect().top - bounds.top + padding);
        }
        const pixels = ink.getImageData(0, 0, width, height).data;
        const targets: TextTarget[] = [];
        const step = Math.max(2, Math.ceil(fontSize / 50));
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const alpha = pixels[(y * width + x) * 4 + 3];
            if (alpha > 40) targets.push({ x, y, alpha: alpha / 255 });
          }
        }
        if (!targets.length) throw new Error("Footer text sampling produced no visible glyphs.");
        const particles = createTextParticles(targets, width, Math.min(190, bounds.height * .6, bounds.width * .22));
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        surface.width = Math.round(width * ratio);
        surface.height = Math.round(height * ratio);
        surface.style.width = `${width}px`;
        surface.style.height = `${height}px`;
        surface.style.left = `${-padding}px`;
        surface.style.top = `${-padding}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        for (const particle of particles) {
          if (gatherStart.current !== null) {
            const point = textParticlePosition(particle, (time.current - gatherStart.current) * 1000, { x: 0, y: 0, strength: 0 }, Math.min(120, fontSize * 1.4));
            particle.currentX = point.x;
            particle.currentY = point.y;
          }
          context.fillStyle = colors[particle.tone];
          const x = gatherStart.current === null ? particle.x : particle.currentX;
          const y = gatherStart.current === null ? particle.y : particle.currentY;
          context.fillRect(x - particle.size / 2, y - particle.size / 2, particle.size, particle.size);
        }
        model.current = { context, particles, width, height, padding, textWidth: bounds.width, textHeight: bounds.height, radius: Math.min(120, fontSize * 1.4) };
        surface.dataset.particles = String(particles.length);
        surface.dataset.textPhase = gatherStart.current === null ? "waiting" : (time.current - gatherStart.current) * 1000 < textGatherDuration + textGatherStagger ? "gathering" : "formed";
        setReady(true);
      } catch (cause: unknown) {
        if (!cancelled && version === build) onError(cause);
      }
    }
    const resize = new ResizeObserver(() => { void sample(); });
    resize.observe(label);
    return () => {
      cancelled = true;
      build++;
      resize.disconnect();
    };
  }, [onError]);

  return (
    <div ref={host} className="footer-particle-headline" data-motion="paused" data-active={enabled && ready && !error}>
      <h2 ref={heading} className="particle-text-label">
        <span className="particle-text-line">What&apos;s your<i className="particle-text-baseline" aria-hidden="true" /></span>
        <span className="particle-text-line">next move?<i className="particle-text-baseline" aria-hidden="true" /></span>
      </h2>
      <canvas ref={canvas} className="particle-text-canvas" aria-hidden="true" />
      {error && <span className="footer-text-status effect-status" role="status">{error}</span>}
    </div>
  );
}
