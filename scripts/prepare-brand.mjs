import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const destination = path.join(root, "public", "brand");
await mkdir(destination, { recursive: true });

function geometry(svg, viewBox) {
  const paths = [...svg.matchAll(/<path\s[^>]*\bd="([^"]+)"/g)].map((match) => match[1]);
  const rects = [...svg.matchAll(/<rect\s([^>]+)\/>/g)].map((match) => {
    const attributes = Object.fromEntries([...match[1].matchAll(/(x|y|width|height)="([^"]+)"/g)].map((attribute) => [attribute[1], Number(attribute[2])]));
    if (Object.keys(attributes).length !== 4 || !Object.values(attributes).every(Number.isFinite)) throw new Error("Invalid supplied DAAT rectangle.");
    return attributes;
  });
  if (!paths.length || !rects.length) throw new Error("The supplied DAAT SVG has no supported logo geometry.");
  return { viewBox, paths, rects };
}

const wordmark = await readFile(path.join(root, "works", "SVGs", "Daat SVGs-03.svg"), "utf8");
const mark = await readFile(path.join(root, "works", "SVGs", "Daat SVGs-09.svg"), "utf8");
await writeFile(path.join(destination, "geometry.json"), `${JSON.stringify({
  wordmark: geometry(wordmark, "34.185 49.516 592.859 140.904"),
  mark: geometry(mark, "74.649 147.324 445.253 299.903"),
}, null, 2)}\n`);
await writeFile(path.join(destination, "daat-wordmark.svg"), wordmark.replace(/viewBox="[^"]+"/, 'viewBox="34.185 49.516 592.859 140.904"'));
await writeFile(path.join(destination, "daat-mark.svg"), mark.replace(/viewBox="[^"]+"/, 'viewBox="74.649 147.324 445.253 299.903"'));
await writeFile(path.join(root, "public", "mark.svg"), mark.replace(/viewBox="[^"]+"/, 'viewBox="60 110 480 380"'));

const crops = [
  { name: "aerograin", source: ["aero", "photo_2026-10-04_18-42-56.jpg"], area: { left: 274, top: 304, width: 736, height: 113 } },
  { name: "pulsedock", source: ["pulse", "photo_2026-10-04_18-41-38.jpg"], area: { left: 199, top: 391, width: 881, height: 113 } },
  { name: "apex", source: ["apex", "photo_2026-10-04_18-45-47.jpg"], area: { left: 42, top: 314, width: 430, height: 117 }, color: true },
  { name: "solvanta-labs", source: ["solvanta", "photo_2026-10-04_18-51-18.jpg"], area: { left: 362, top: 277, width: 559, height: 165 }, color: true },
];
for (const crop of crops) {
  const { data, info } = await sharp(path.join(root, "works", ...crop.source)).extract(crop.area).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) {
    const [r, g, b] = data.subarray(offset, offset + 3);
    const minimum = Math.min(r, g, b);
    const colored = crop.color && ((r > 145 && g < 115 && b < 90) || (r > 165 && g > 105 && g < 200 && b < 120));
    const white = Math.max(r, g, b) - minimum < 30;
    data[offset + 3] = colored ? 255 : white ? Math.max(0, Math.min(255, Math.round((minimum - 218) / 22 * 255))) : 0;
    if (!colored) { data[offset] = 242; data[offset + 1] = 243; data[offset + 2] = 244; }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(path.join(destination, `${crop.name}.png`));
}
console.log("Prepared official DAAT geometry and four temporary transparent project-logo crops.");
