"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMotionPreference, useMotionPreferenceRevision } from "./use-motion-preference";

const subscribe = () => () => {};

export type DecorativePointer = { x: number; y: number; strength: number };

export function useDecorativeMotion() {
  const reduced = useMotionPreference();
  const revision = useMotionPreferenceRevision();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [intent, setIntent] = useState<{ revision: number; enabled: boolean } | null>(null);
  const enabled = hydrated && (intent?.revision === revision ? intent.enabled : !reduced);
  return { hydrated, enabled, toggle: () => setIntent({ revision, enabled: !enabled }) };
}

export function useDecorativeLoop(
  enabled: boolean,
  draw: (elapsed: number, pointer: DecorativePointer) => void,
  onError: (error: unknown) => void,
  pointerSurface: "parent" | "self" = "parent",
) {
  const host = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const frames = useRef(0);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let frame = 0;
    let last: number | null = null;
    let visible = false;
    let failed = false;
    const pointer: DecorativePointer = { x: 0, y: 0, strength: 0 };
    const target: DecorativePointer = { x: 0, y: 0, strength: 0 };
    const surface = pointerSurface === "self" ? element : element.parentElement;
    const move = (event: PointerEvent) => {
      if (!enabled || event.pointerType === "touch" || !surface) return;
      const bounds = surface.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      target.strength = 1;
    };
    const leave = () => {
      target.x = 0;
      target.y = 0;
      target.strength = 0;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      element.dataset.motion = failed ? "error" : "paused";
    };
    const tick = (now: number) => {
      if (last === null || now - last >= 1000 / 30) {
        elapsed.current += last === null ? 0 : Math.min(now - last, 100);
        last = now;
        try {
          pointer.x += (target.x - pointer.x) * .18;
          pointer.y += (target.y - pointer.y) * .18;
          pointer.strength += (target.strength - pointer.strength) * .18;
          draw(elapsed.current / 1000, pointer);
        } catch (error: unknown) {
          failed = true;
          stop();
          onError(error);
          return;
        }
        element.dataset.frame = String(++frames.current);
        element.dataset.pointer = pointer.strength.toFixed(3);
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (!enabled || !visible || document.hidden || failed) {
        stop();
      } else if (!frame) {
        element.dataset.motion = "running";
        frame = requestAnimationFrame(tick);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    surface?.addEventListener("pointermove", move, { passive: true });
    surface?.addEventListener("pointerleave", leave);
    sync();
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      surface?.removeEventListener("pointermove", move);
      surface?.removeEventListener("pointerleave", leave);
    };
  }, [enabled, draw, onError, pointerSurface]);

  return host;
}
