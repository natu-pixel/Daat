"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/lib/use-motion-preference";

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useMotionPreference();
  const [intent, setIntent] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const shouldPlay = intent ?? reduced === false;
  const canLoad = reduced === false || intent === true;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let cancelled = false;
    if (!shouldPlay) {
      element.pause();
      return;
    }
    element.play().catch((error: unknown) => {
      if (cancelled) return;
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setMessage("Autoplay is disabled. Use Play video to start the reel.");
      } else {
        console.error("Hero video playback failed:", error instanceof Error ? error.name : "UnknownError");
        setMessage("The reel couldn't start. The still frame is shown instead.");
      }
    });
    return () => { cancelled = true; };
  }, [shouldPlay, canLoad]);

  return (
    <>
      <video
        ref={video}
        className="hero-background-video"
        src={canLoad ? "/hero/studio-reel.mp4" : undefined}
        poster="/hero/poster.webp"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onPlay={() => { setPlaying(true); setMessage(""); }}
        onPause={() => setPlaying(false)}
        onError={() => {
          console.error("Hero video could not be loaded:", video.current?.error?.code);
          setPlaying(false);
          setMessage("The reel couldn't load. The still frame is shown instead.");
        }}
      />
      <div className="hero-video-controls">
        {message && <span className="hero-video-status" role="status">{message}</span>}
        <button type="button" className="hero-video-toggle" aria-label={playing ? "Pause hero video" : "Play hero video"} onClick={() => setIntent(!playing)}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>{playing ? "Pause video" : "Play video"}
        </button>
      </div>
    </>
  );
}
