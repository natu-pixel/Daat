import sharp from "sharp";
import { readdir, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = path.join(root, "works");
const destination = path.join(root, "public", "works");
const manifest = {};
let sourceBytes = 0;
let outputBytes = 0;

for (const folder of (await readdir(source, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !["video", "svgs"].includes(entry.name.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name))) {
  const input = path.join(source, folder.name);
  const output = path.join(destination, folder.name);
  await mkdir(output, { recursive: true });
  const files = (await readdir(input)).filter((name) => /\.jpe?g$/i.test(name)).sort();
  if (!files.length) throw new Error(`No JPEG artwork found in works/${folder.name}.`);
  const assets = [];
  for (const [index, filename] of files.entries()) {
    const number = String(index + 1).padStart(2, "0");
    const name = `${number}.webp`;
    const image = sharp(path.join(input, filename));
    const info = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(output, name));
    sourceBytes += (await stat(path.join(input, filename))).size;
    outputBytes += info.size;
    assets.push({ url: `/works/${folder.name}/${name}`, width: info.width, height: info.height, source: filename });
  }
  manifest[folder.name] = assets;
}

await writeFile(path.join(destination, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared ${Object.values(manifest).reduce((count, assets) => count + assets.length, 0)} images in ${Object.keys(manifest).length} collections.`);
console.log(`Originals: ${(sourceBytes / 1024 / 1024).toFixed(2)} MB. WebP: ${(outputBytes / 1024 / 1024).toFixed(2)} MB.`);
