"use client";

import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";
import { useMotionPreference } from "@/lib/use-motion-preference";
import { playTextSweep, prepareTextSweep, settleTextSweep } from "@/lib/text-sweep";

export function Reveal({ children, className, delay = 0, kind = "text" }: { children: React.ReactNode; className?: string; delay?: number; kind?: "text" | "image" }) {
  const reduced = useMotionPreference();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const played = useRef(false);
  const active = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    if (reduced) {
      active.current?.stop();
      active.current = animate(element, { y: 0, scale: 1, opacity: 1 }, { duration: 0 });
      settleTextSweep(element);
      return;
    }
    if (played.current) return;
    prepareTextSweep(element);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (played.current) return;
      played.current = true;
      playTextSweep(element, delay + .1);
      active.current = animate(element, {
        y: [kind === "image" ? 64 : 38, 0],
        scale: [kind === "image" ? .91 : .98, 1],
        opacity: [.15, 1],
      }, { type: "spring", duration: .9, bounce: .2, delay, opacity: { type: "tween", duration: .55, delay } });
    }, { threshold: .12, rootMargin: "0px 0px -30px 0px" });
    observer.observe(element);
    return () => { observer.disconnect(); active.current?.stop(); };
  }, [animate, delay, kind, reduced, scope]);

  useEffect(() => {
    const element = scope.current;
    if (!element) return;
    const target = element.closest("a") || element;
    function settle() {
      played.current = true;
      active.current?.stop();
      active.current = animate(element, { y: 0, scale: 1, opacity: 1 }, { duration: 0 });
      settleTextSweep(element);
    }
    target.addEventListener("focusin", settle);
    return () => target.removeEventListener("focusin", settle);
  }, [animate, scope]);

  return <div ref={scope} className={className} data-reveal={kind}>{children}</div>;
}
