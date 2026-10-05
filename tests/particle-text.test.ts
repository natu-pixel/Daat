import { describe, expect, it } from "vitest";
import { createTextParticles, textGatherDuration, textGatherStagger, textParticlePosition } from "@/lib/particle-text";

const neutral = { x: 0, y: 0, strength: 0 };
const targets = [{ x: 120, y: 60, alpha: 1 }, { x: 200, y: 100, alpha: .5 }];

describe("footer text particles", () => {
  it("creates repeatable scattered particles without moving their glyph targets", () => {
    const particles = createTextParticles(targets, 400, 190);
    expect(particles).toEqual(createTextParticles(targets, 400, 190));
    expect(particles[0].x).toBe(targets[0].x);
    expect(particles[0].y).toBe(targets[0].y);
    expect(particles[0].startX).not.toBe(particles[0].x);
    expect(particles[0].delay).toBeGreaterThanOrEqual(0);
    expect(particles[0].delay).toBeLessThan(textGatherStagger);
  });

  it("caps text sampling at 5200 particles", () => {
    const many = Array.from({ length: 24000 }, (_, index) => ({ x: index % 400, y: Math.floor(index / 400), alpha: 1 }));
    expect(createTextParticles(many, 400, 190).length).toBeLessThanOrEqual(5200);
  });

  it("gathers within 1600 ms plus stagger and limits formed-text drift", () => {
    for (const particle of createTextParticles(targets, 400, 190)) {
      const start = textParticlePosition(particle, 0, neutral, 120);
      expect(start.x).toBe(particle.startX);
      expect(start.y).toBe(particle.startY);
      const formed = textParticlePosition(particle, textGatherDuration + textGatherStagger, neutral, 120);
      expect(Math.abs(formed.x - particle.x)).toBeLessThanOrEqual(.8);
      expect(Math.abs(formed.y - particle.y)).toBeLessThanOrEqual(.8);
      expect(formed.alpha).toBe(particle.alpha);
    }
  });

  it("repels nearby glyph particles and leaves distant or inactive pointers alone", () => {
    const particle = createTextParticles(targets, 400, 0)[0];
    const formed = textParticlePosition(particle, 2500, neutral, 120);
    const cursor = { x: formed.x - 20, y: formed.y, strength: 1 };
    const repel = textParticlePosition(particle, 2500, cursor, 120);
    expect(repel.x - formed.x).toBeGreaterThan(20);
    expect(textParticlePosition(particle, 2500, { ...cursor, strength: 0 }, 120)).toEqual(formed);
    expect(textParticlePosition(particle, 2500, { x: -500, y: -500, strength: 1 }, 120)).toEqual(formed);
  });

  it("rejects invalid dimensions and scatter values explicitly", () => {
    for (const width of [0, -1, NaN, Infinity]) expect(() => createTextParticles(targets, width, 190)).toThrow();
    for (const scatter of [-1, NaN, Infinity]) expect(() => createTextParticles(targets, 400, scatter)).toThrow();
  });
});
