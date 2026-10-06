"use client";

import { useLayoutEffect, useRef } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

export function CountUp({ value, prefix = "", suffix = "", duration = 1800 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const reduced = useMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${value}${suffix}`;

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (reduced) {
      element.textContent = final;
      return;
    }
    element.textContent = `${prefix}0${suffix}`;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${prefix}${Math.round(value * eased)}${suffix}`;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = final;
    };
  }, [reduced, value, prefix, suffix, duration, final]);

  return <span className="count-up"><span className="sr-only">{final}</span><span ref={ref} aria-hidden="true">{final}</span></span>;
}
