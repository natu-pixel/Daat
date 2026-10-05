import type { DecorativePointer } from "./use-decorative-motion";

export type FooterParticle = {
  side: number;
  position: number;
  depth: number;
  phase: number;
  speed: number;
  size: number;
  tone: number;
};

export function footerParticleCount(width: number) {
  if (!Number.isFinite(width) || width <= 0) throw new Error("Footer particle width must be positive and finite.");
  return Math.min(14000, Math.round(width * 12));
}

export function createFooterParticles(count: number): FooterParticle[] {
  if (!Number.isInteger(count) || count < 0 || count > 14000) throw new Error("Footer particle count must be an integer between 0 and 14000.");
  let seed = 41;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, (_, index) => ({
    side: index % 4,
    position: random(),
    depth: (random() + random() + random()) / 3 - .5,
    phase: random() * Math.PI * 2,
    speed: .018 + random() * .02,
    size: .65 + random() * 1.55,
    tone: Math.floor(random() * 6),
  })).sort((a, b) => a.tone - b.tone);
}

export function footerParticlePosition(particle: FooterParticle, width: number, height: number, time: number, pointer: DecorativePointer) {
  const u = (particle.position + time * particle.speed) % 1;
  const horizontal = particle.side < 2;
  const wave = Math.sin(u * 8 + time * .32) * .055 + Math.sin(u * 19 - time * .24) * .022;
  const fold = Math.sin(u * 24 + particle.depth * 12 + time * .38) * .028;
  const jitter = Math.sin(particle.phase + time * .2) * .003;
  const along = u * 1.4 - .2;
  let x = horizontal ? along * width : ((particle.side === 2 ? .11 : .89) + wave + fold + particle.depth * .24 + jitter) * width;
  let y = horizontal ? ((particle.side === 0 ? .14 : .91) + wave + fold + particle.depth * .35 + jitter) * height : along * height;

  if (pointer.strength > .001) {
    const cursorX = (pointer.x + 1) * width / 2;
    const cursorY = (pointer.y + 1) * height / 2;
    const dx = x - cursorX;
    const dy = y - cursorY;
    const reach = Math.min(240, Math.min(width, height) * .45);
    const influence = Math.exp(-(dx * dx + dy * dy) / (2 * reach * reach)) * pointer.strength;
    const angle = influence * (.8 + Math.sin(time * .8 + particle.phase) * .25);
    const spread = 1 + influence * .28;
    x = cursorX + (dx * Math.cos(angle) - dy * Math.sin(angle)) * spread;
    y = cursorY + (dx * Math.sin(angle) + dy * Math.cos(angle)) * spread;
  }
  return { x, y };
}
