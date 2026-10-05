export type TextTarget = { x: number; y: number; alpha: number };
export type TextParticle = TextTarget & {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  delay: number;
  seed: number;
  size: number;
  tone: number;
};

export const textGatherDuration = 1600;
export const textGatherStagger = 420;

export function createTextParticles(targets: TextTarget[], width: number, scatter: number): TextParticle[] {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(scatter) || scatter < 0) throw new Error("Particle text dimensions and scatter are invalid.");
  const stride = Math.max(1, Math.ceil(targets.length / 5200));
  return targets.filter((_, index) => index % stride === 0).map((target, index) => {
    const seed = (Math.imul(index + 1, 2654435761) >>> 0) / 4294967296;
    const angle = seed * Math.PI * 2;
    const distance = scatter * (.4 + ((index * 37) % 101) / 101 * .6);
    const startX = target.x + Math.cos(angle) * distance;
    const startY = target.y + Math.sin(angle) * distance;
    return {
      ...target,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      seed,
      delay: seed * textGatherStagger,
      size: 2.2 * (.85 + target.alpha * .3),
      tone: Math.max(0, Math.min(7, Math.floor(target.x / width * 8))),
    };
  });
}

export function textParticlePosition(particle: TextParticle, elapsed: number, cursor: { x: number; y: number; strength: number }, radius: number) {
  const progress = Math.max(0, Math.min(1, (elapsed - particle.delay) / textGatherDuration));
  const eased = 1 - (1 - progress) ** 3;
  let x = particle.startX + (particle.x - particle.startX) * eased;
  let y = particle.startY + (particle.y - particle.startY) * eased;
  if (progress === 1) {
    x += Math.sin(elapsed * .0009 + particle.seed * 10) * .8;
    y += Math.cos(elapsed * .00075 + particle.seed * 8) * .8;
  }
  if (cursor.strength > .001) {
    const dx = x - cursor.x;
    const dy = y - cursor.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0 && distance < radius) {
      const force = (1 - distance / radius) ** 2 * 42 * cursor.strength;
      x += dx / distance * force;
      y += dy / distance * force;
    }
  }
  return { x, y, alpha: (.35 + progress * .65) * particle.alpha };
}
