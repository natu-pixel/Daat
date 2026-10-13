"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

// Portfolio card imagery drifts toward the pointer while the pointer is over the card
// and eases back to rest when it leaves. The overlays counter-drift through CSS for
// depth. Reduced motion and touch pointers leave the artwork completely still.
export function PointerParallax({ children, className, depth = 10, ...props }: { children: React.ReactNode; className?: string; depth?: number } & React.HTMLAttributes<HTMLDivElement>) {
  const host = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();

  useEffect(() => {
    const element = host.current;
    if (!element || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let last: number | null = null;
    let tracking = false;

    const write = () => {
      element.style.setProperty("--parallax-x", current.x.toFixed(4));
      element.style.setProperty("--parallax-y", current.y.toFixed(4));
    };

    const tick = (now: number) => {
      if (last !== null && now - last < 1000 / 60) {
        frame = requestAnimationFrame(tick);
        return;
      }
      last = now;
      current.x += (target.x - current.x) * .12;
      current.y += (target.y - current.y) * .12;
      write();
      if (!target.x && !target.y && Math.abs(current.x) < .002 && Math.abs(current.y) < .002) {
        current.x = 0;
        current.y = 0;
        write();
        tracking = false;
        element.dataset.parallax = "idle";
        last = null;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
      if (!tracking) {
        tracking = true;
        element.dataset.parallax = "tracking";
        frame = requestAnimationFrame(tick);
      }
    };

    const leave = () => { target.x = 0; target.y = 0; };

    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      if (frame) cancelAnimationFrame(frame);
      element.style.removeProperty("--parallax-x");
      element.style.removeProperty("--parallax-y");
      delete element.dataset.parallax;
    };
  }, [depth, reduced]);

  return <div ref={host} className={className} data-parallax="idle" {...props}>{children}</div>;
}
