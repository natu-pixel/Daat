import { describe, expect, it } from "vitest";
import { createFooterParticles, footerParticleCount, footerParticlePosition } from "@/lib/footer-particles";

const neutral = { x: 0, y: 0, strength: 0 };

describe("footer particle clouds", () => {
  it("scales particle density with width without exceeding its rendering budget", () => {
    expect(footerParticleCount(375)).toBe(4500);
    expect(footerParticleCount(768)).toBe(9216);
    expect(footerParticleCount(1440)).toBe(14000);
    expect(footerParticleCount(3840)).toBe(14000);
  });

  it("rejects invalid dimensions and particle budgets explicitly", () => {
    for (const width of [0, -1, NaN, Infinity]) expect(() => footerParticleCount(width)).toThrow();
    for (const count of [-1, .5, 14001, NaN]) expect(() => createFooterParticles(count)).toThrow();
  });

  it("creates repeatable irregular positions with all four edges represented", () => {
    const particles = createFooterParticles(400);
    expect(particles).toEqual(createFooterParticles(400));
    expect(new Set(particles.map(particle => particle.side))).toEqual(new Set([0, 1, 2, 3]));
    expect(new Set(particles.map(particle => particle.position)).size).toBe(400);
    expect(new Set(particles.map(particle => particle.depth)).size).toBe(400);
  });

  it("keeps the reading area open while concentrating particles along the edges", () => {
    const particles = createFooterParticles(14000);
    for (const time of [0, 2, 5, 10]) {
      const points = particles.map(particle => footerParticlePosition(particle, 1440, 680, time, neutral));
      const visible = points.filter(({ x, y }) => x >= 0 && x <= 1440 && y >= 0 && y <= 680);
      const center = visible.filter(({ x, y }) => x > 1440 * .3 && x < 1440 * .7 && y > 680 * .3 && y < 680 * .7);
      expect(visible.length).toBeGreaterThan(6000);
      expect(center.length / visible.length).toBeLessThan(.05);
    }
  });

  it("animates the cloud positions over time without losing finite coordinates", () => {
    for (const particle of createFooterParticles(100)) {
      const first = footerParticlePosition(particle, 1440, 680, 0, neutral);
      const later = footerParticlePosition(particle, 1440, 680, 1, neutral);
      expect(later).not.toEqual(first);
      expect(Number.isFinite(later.x) && Number.isFinite(later.y)).toBe(true);
    }
  });

  it("bends nearby particles into a cursor vortex and restores the unmodified field at zero strength", () => {
    const particle = createFooterParticles(1)[0];
    const first = footerParticlePosition(particle, 1440, 680, 2, neutral);
    const pointer = { x: first.x / 1440 * 2 - .9, y: first.y / 680 * 2 - 1, strength: 1 };
    const hovered = footerParticlePosition(particle, 1440, 680, 2, pointer);
    expect(Math.hypot(hovered.x - first.x, hovered.y - first.y)).toBeGreaterThan(10);
    expect(footerParticlePosition(particle, 1440, 680, 2, { ...pointer, strength: 0 })).toEqual(first);
  });
});
