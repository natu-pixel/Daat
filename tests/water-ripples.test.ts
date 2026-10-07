import { describe, expect, it } from "vitest";
import { paintWaterMap, waterDisplacement, waterRippleLifetime, type WaterRipple } from "@/lib/water-ripples";

const ripple: WaterRipple = { x: .5, y: .5, started: 0, strength: 1 };

describe("cursor water refraction", () => {
  it("produces a neutral field when idle, outside a wave, and after decay", () => {
    expect(waterDisplacement(516, 500, 1000, 1000, [], 0)).toEqual({ x: 0, y: 0, mask: 0 });
    expect(waterDisplacement(0, 0, 1000, 1000, [ripple], .2)).toEqual({ x: 0, y: 0, mask: 0 });
    expect(waterDisplacement(516, 500, 1000, 1000, [ripple], waterRippleLifetime)).toEqual({ x: 0, y: 0, mask: 0 });
  });

  it("displaces radially rather than shifting the entire image in one direction", () => {
    const right = waterDisplacement(516, 500, 1000, 1000, [ripple], 0);
    const left = waterDisplacement(484, 500, 1000, 1000, [ripple], 0);
    const bottom = waterDisplacement(500, 516, 1000, 1000, [ripple], 0);
    expect(right.x).toBeGreaterThan(10);
    expect(right.y).toBe(0);
    expect(left.x).toBeCloseTo(-right.x);
    expect(bottom.y).toBeCloseTo(right.x);
    expect(bottom.x).toBe(0);
  });

  it("propagates an expanding wave while reducing its amplitude", () => {
    const early = waterDisplacement(596, 500, 1000, 1000, [ripple], 0);
    const later = waterDisplacement(596, 500, 1000, 1000, [ripple], .5);
    const peak = waterDisplacement(516, 500, 1000, 1000, [ripple], 0);
    expect(Math.abs(later.x)).toBeGreaterThan(Math.abs(early.x));
    expect(later.mask).toBeGreaterThan(early.mask);
    expect(later.x).toBeLessThan(peak.x);
  });

  it("bounds combined waves to 24 image-space pixels per channel", () => {
    const waves = Array.from({ length: 6 }, () => ripple);
    const point = waterDisplacement(516, 500, 1000, 1000, waves, 0);
    expect(point.x).toBe(24);
    expect(point.mask).toBe(1);
  });

  it("encodes only the local wave region and leaves remote pixels transparent and neutral", () => {
    const pixels = new Uint8ClampedArray(32 * 32 * 4);
    paintWaterMap(pixels, 32, 32, 1000, 1000, [ripple], .2);
    expect(Array.from(pixels.subarray(0, 4))).toEqual([128, 128, 128, 0]);
    let changed = 0;
    let painted = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] !== 128 || pixels[i + 1] !== 128) changed++;
      if (pixels[i + 3]) painted++;
    }
    expect(changed).toBeGreaterThan(0);
    expect(painted).toBeLessThan(32 * 32 / 4);
  });

  it("adds subtle frame-varying noise only inside active ripples", () => {
    const at = (time: number) => { const pixels = new Uint8ClampedArray(32 * 32 * 4); paintWaterMap(pixels, 32, 32, 1000, 1000, [ripple], time); return pixels; };
    const a = at(.2);
    const b = at(.2 + 1 / 24);
    const c = at(.2);
    expect(Array.from(a)).toEqual(Array.from(c));
    let differs = 0;
    for (let i = 0; i < a.length; i += 4) {
      if (!a[i + 3] && !b[i + 3]) expect([a[i], a[i + 1]]).toEqual([128, 128]);
      if (a[i] !== b[i] || a[i + 1] !== b[i + 1]) differs++;
    }
    expect(differs).toBeGreaterThan(0);
  });

  it("rejects invalid texture sizes and excessive ripple counts explicitly", () => {
    expect(() => paintWaterMap(new Uint8ClampedArray(16), 2, 3, 1000, 1000, [], 0)).toThrow();
    expect(() => paintWaterMap(new Uint8ClampedArray(193 * 4), 193, 1, 1000, 1000, [], 0)).toThrow();
    expect(() => paintWaterMap(new Uint8ClampedArray(16), 2, 2, 0, 1000, [], 0)).toThrow();
    expect(() => paintWaterMap(new Uint8ClampedArray(16), 2, 2, 1000, 1000, Array.from({ length: 7 }, () => ripple), 0)).toThrow();
  });
});
