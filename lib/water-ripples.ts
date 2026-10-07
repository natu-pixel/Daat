export type WaterRipple = { x: number; y: number; started: number; strength: number };

export const waterRippleLifetime = 1.6;
export const maxWaterRipples = 6;
export const waterDisplacementScale = 48;
// Peak jitter, in scene pixels, added inside active ripples for a grainy water surface.
export const waterNoiseAmount = 3.5;
// SVG neutral is 0.5; the byte texture stores neutral as 128/255.
export const waterNeutralOffset = .5 - 128 / 255;

function waterNoise(x: number, y: number, frame: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + frame * 74.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

export function waterDisplacement(x: number, y: number, width: number, height: number, ripples: WaterRipple[], time: number) {
  let offsetX = 0;
  let offsetY = 0;
  let mask = 0;
  for (const ripple of ripples) {
    const age = time - ripple.started;
    if (age < 0 || age >= waterRippleLifetime) continue;
    const dx = x - ripple.x * width;
    const dy = y - ripple.y * height;
    const distance = Math.hypot(dx, dy);
    if (distance < .001) continue;
    const ring = distance - (16 + age * 160);
    if (Math.abs(ring) > 110) continue;
    const envelope = Math.exp(-((ring / 42) ** 2));
    const decay = (1 - age / waterRippleLifetime) ** 2;
    const force = Math.cos(ring / 12) * envelope * decay * ripple.strength * 18;
    mask += envelope * decay * ripple.strength;
    offsetX += dx / distance * force;
    offsetY += dy / distance * force;
  }
  return { x: Math.max(-24, Math.min(24, offsetX)), y: Math.max(-24, Math.min(24, offsetY)), mask: Math.min(1, mask) };
}

export function paintWaterMap(pixels: Uint8ClampedArray, width: number, height: number, sceneWidth: number, sceneHeight: number, ripples: WaterRipple[], time: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 192 || height > 192 || pixels.length !== width * height * 4) {
    throw new Error("Water displacement texture dimensions are invalid.");
  }
  if (!Number.isFinite(sceneWidth) || !Number.isFinite(sceneHeight) || sceneWidth <= 0 || sceneHeight <= 0 || ripples.length > maxWaterRipples) {
    throw new Error("Water ripple scene dimensions or ripple count are invalid.");
  }
  const frame = Math.floor(time * 24);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = waterDisplacement((x + .5) / width * sceneWidth, (y + .5) / height * sceneHeight, sceneWidth, sceneHeight, ripples, time);
      const jitter = waterNoiseAmount * offset.mask;
      const offsetX = offset.x + waterNoise(x, y, frame) * jitter;
      const offsetY = offset.y + waterNoise(y + 17, x + 31, frame) * jitter;
      const index = (y * width + x) * 4;
      pixels[index] = Math.round(128 + offsetX / waterDisplacementScale * 255);
      pixels[index + 1] = Math.round(128 + offsetY / waterDisplacementScale * 255);
      pixels[index + 2] = 128;
      pixels[index + 3] = Math.round(offset.mask * 255);
    }
  }
}
