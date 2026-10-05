"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import { useDecorativeLoop, useDecorativeMotion, type DecorativePointer } from "@/lib/use-decorative-motion";
import { maxWaterRipples, paintWaterMap, waterDisplacementScale, waterNeutralOffset, waterRippleLifetime, type WaterRipple } from "@/lib/water-ripples";

type WaterTexture = { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D; pixels: ImageData };

export function BuildingHero() {
  const id = `hero-liquid-${useId().replace(/:/g, "")}`;
  const displacementImage = useRef<SVGFEImageElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const water = useRef<{
    ripples: WaterRipple[];
    lastPoint: { x: number; y: number; time: number } | null;
    lastStrength: number;
    texture: WaterTexture | null;
  }>({ ripples: [], lastPoint: null, lastStrength: 0, texture: null });
  const { hydrated, enabled, toggle } = useDecorativeMotion();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const draw = useCallback((time: number, pointer: DecorativePointer) => {
    const artwork = image.current;
    const map = displacementImage.current;
    if (!artwork || !map) throw new Error("Hero water refraction surface is unavailable.");
    const width = artwork.clientWidth;
    const height = artwork.clientHeight;
    if (!width || !height) return;
    const current = water.current;
    current.ripples = current.ripples.filter(ripple => time - ripple.started < waterRippleLifetime);
    const x = .5 + pointer.x / (2 * 1.16);
    const y = .5 + pointer.y / (2 * 1.16);
    const previous = current.lastPoint;
    const distance = previous ? Math.hypot((x - previous.x) * width, (y - previous.y) * height) : 0;
    if (pointer.strength > .15 && pointer.strength >= current.lastStrength - .0001 && (!previous || (distance > 3 && time - previous.time >= .07))) {
      current.ripples.push({ x, y, started: time, strength: Math.min(1, .5 + distance / 40) });
      current.ripples = current.ripples.slice(-maxWaterRipples);
      current.lastPoint = { x, y, time };
    }
    if (pointer.strength < .01) current.lastPoint = null;
    current.lastStrength = pointer.strength;
    const parent = artwork.parentElement;
    if (parent) {
      parent.dataset.water = current.ripples.length ? "rippling" : "idle";
      parent.dataset.ripples = String(current.ripples.length);
    }
    if (!current.ripples.length) {
      if (artwork.style.filter !== "none") artwork.style.filter = "none";
      return;
    }
    const textureWidth = width >= height ? 192 : Math.max(1, Math.round(192 * width / height));
    const textureHeight = height >= width ? 192 : Math.max(1, Math.round(192 * height / width));
    if (!current.texture || current.texture.canvas.width !== textureWidth || current.texture.canvas.height !== textureHeight) {
      const canvas = document.createElement("canvas");
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Water displacement canvas rendering is unavailable.");
      current.texture = { canvas, context, pixels: context.createImageData(textureWidth, textureHeight) };
    }
    const texture = current.texture;
    paintWaterMap(texture.pixels.data, textureWidth, textureHeight, width, height, current.ripples, time);
    texture.context.putImageData(texture.pixels, 0, 0);
    const source = texture.canvas.toDataURL("image/png");
    if (!source.startsWith("data:image/png")) throw new Error("Water displacement texture could not be encoded.");
    if (map.getAttribute("width") !== String(width)) map.setAttribute("width", String(width));
    if (map.getAttribute("height") !== String(height)) map.setAttribute("height", String(height));
    map.setAttribute("href", source);
    artwork.style.filter = `url("#${id}")`;
  }, [id]);
  const onError = useCallback((cause: unknown) => {
    console.error("Hero effect failed:", cause);
    setError(current => current || "The hero effect couldn't start. The still image is shown instead.");
  }, []);
  const host = useDecorativeLoop(enabled && loaded && !error, draw, onError);

  return (
    <>
      <div ref={host} className="hero-artwork" data-motion="paused" data-water={enabled && !error ? undefined : "idle"} aria-hidden="true">
        <svg className="effect-definitions" width="0" height="0" focusable="false">
          <defs>
            <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feImage ref={displacementImage} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="water-map" onError={() => onError(new Error("Water displacement texture could not be loaded."))} />
              <feComponentTransfer in="water-map" result="water-normal">
                <feFuncR type="linear" slope="1" intercept={waterNeutralOffset} />
                <feFuncG type="linear" slope="1" intercept={waterNeutralOffset} />
                <feFuncA type="linear" slope="0" intercept="1" />
              </feComponentTransfer>
              <feDisplacementMap in="SourceGraphic" in2="water-normal" scale={waterDisplacementScale} xChannelSelector="R" yChannelSelector="G" result="refracted" />
              <feComposite in="refracted" in2="water-map" operator="in" result="local-water" />
              <feComposite in="SourceGraphic" in2="water-map" operator="out" result="outside-water" />
              <feComposite in="local-water" in2="outside-water" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            </filter>
            <filter id={`${id}-grain`}>
              <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
        </svg>
        <Image
          ref={image}
          src="/building.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-building-image"
          style={{ filter: enabled && loaded && !error ? undefined : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            console.error("Hero building image could not be loaded.");
            setError("The building image couldn't load. Please refresh to try again.");
          }}
        />
        <svg className="hero-grain" width="100%" height="100%" focusable="false">
          <rect width="100%" height="100%" filter={`url(#${id}-grain)`} />
        </svg>
      </div>
      <div className="hero-effect-controls effect-controls">
        {error && <span className="effect-status" role="status">{error}</span>}
        {hydrated && !error && <button type="button" className="effect-toggle" aria-label={enabled ? "Pause hero effect" : "Play hero effect"} aria-pressed={enabled} onClick={toggle}>
          {enabled ? "Pause effect" : "Play effect"}
        </button>}
      </div>
    </>
  );
}
