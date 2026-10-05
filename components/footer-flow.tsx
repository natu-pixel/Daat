"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDecorativeLoop, type useDecorativeMotion, type DecorativePointer } from "@/lib/use-decorative-motion";
import { createFooterParticles, footerParticleCount, footerParticlePosition, type FooterParticle } from "@/lib/footer-particles";

export function FooterFlow({ motion }: { motion: ReturnType<typeof useDecorativeMotion> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const gradient = useRef<HTMLImageElement>(null);
  const { hydrated, enabled, toggle } = motion;
  const [error, setError] = useState("");
  const time = useRef(0);
  const currentPointer = useRef<DecorativePointer>({ x: 0, y: 0, strength: 0 });
  const particles = useRef<FooterParticle[]>([]);
  const draw = useCallback((elapsed: number, pointer: DecorativePointer) => {
    const surface = canvas.current;
    if (!surface) throw new Error("Footer particle surface is unavailable.");
    const context = surface.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable.");
    time.current = elapsed;
    currentPointer.current = pointer;
    const { width, height } = surface.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (surface.width !== pixelWidth || surface.height !== pixelHeight) {
      surface.width = pixelWidth;
      surface.height = pixelHeight;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (gradient.current) {
      const transform = `translate(${(pointer.x * 14).toFixed(3)}px, ${(pointer.y * 10).toFixed(3)}px) scale(1.1)`;
      if (gradient.current.style.transform !== transform) gradient.current.style.transform = transform;
    }
    const count = footerParticleCount(width);
    if (particles.current.length !== count) particles.current = createFooterParticles(count);
    surface.dataset.particles = String(count);
    let tone = -1;
    for (const particle of particles.current) {
      if (particle.tone !== tone) {
        tone = particle.tone;
        context.fillStyle = `rgba(${tone < 2 ? "162,232,249" : "242,243,244"},${.4 + tone * .085})`;
      }
      const { x, y } = footerParticlePosition(particle, width, height, elapsed, pointer);
      context.fillRect(x, y, particle.size, particle.size);
    }
  }, []);
  const onError = useCallback((cause: unknown) => {
    console.error("Footer particle effect failed:", cause);
    setError(current => current || "The footer effect couldn't start. The gradient is shown instead.");
  }, []);
  const host = useDecorativeLoop(enabled && !error, draw, onError);

  useEffect(() => {
    const element = canvas.current;
    if (!element || error) return;
    const resize = new ResizeObserver(() => {
      try { draw(time.current, enabled ? currentPointer.current : { x: 0, y: 0, strength: 0 }); } catch (cause: unknown) { onError(cause); }
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, [draw, onError, error, enabled]);

  return (
    <>
      <div ref={host} className="footer-flow" data-motion="paused" aria-hidden="true">
        <Image ref={gradient} src="/gradiant.jpg" alt="" fill sizes="100vw" className="footer-gradient" style={{ transform: enabled && !error ? undefined : "scale(1.1)" }} onError={() => {
          console.error("Footer gradient image could not be loaded.");
          setError("The footer gradient couldn't load. Please refresh to try again.");
        }} />
        {!error && <canvas ref={canvas} />}
      </div>
      <div className="footer-effect-controls effect-controls">
        {error && <span className="effect-status" role="status">{error}</span>}
        {hydrated && !error && <button type="button" className="effect-toggle" aria-label={enabled ? "Pause footer effect" : "Play footer effect"} aria-pressed={enabled} onClick={toggle}>
          {enabled ? "Pause effect" : "Play effect"}
        </button>}
      </div>
    </>
  );
}
