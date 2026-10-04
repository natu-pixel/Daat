"use client";

import { useEffect } from "react";
import { stagger, useAnimate } from "motion/react";
import { useMotionPreference } from "@/lib/use-motion-preference";

export function HeroHeadline({ headline }: { headline: string }) {
  const [scope, animate] = useAnimate<HTMLHeadingElement>();
  const reduced = useMotionPreference();
  useEffect(() => {
    const controls = reduced
      ? animate(".hero-line-text", { y: 0, opacity: 1 }, { duration: 0 })
      : animate(".hero-line-text", { y: [28, 0], opacity: [.6, 1] }, { duration: .8, delay: stagger(.12), ease: [.2, .8, .2, 1] });
    return () => controls.stop();
  }, [animate, reduced]);
  return <h1 ref={scope}>{headline.split("\n").map((line, index) => <span className="hero-line" key={index}><span className="hero-line-text">{line}</span></span>)}</h1>;
}
