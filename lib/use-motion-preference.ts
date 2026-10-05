"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const listeners = new Set<() => void>();
let media: MediaQueryList | null = null;
let revision = 0;

function notify() {
  revision++;
  for (const callback of listeners) callback();
}

function subscribe(callback: () => void) {
  if (!listeners.size) {
    media = window.matchMedia(query);
    media.addEventListener("change", notify);
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (!listeners.size) {
      media?.removeEventListener("change", notify);
      media = null;
    }
  };
}

export function useMotionPreference() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);
}

export function useMotionPreferenceRevision() {
  return useSyncExternalStore(subscribe, () => revision, () => 0);
}
