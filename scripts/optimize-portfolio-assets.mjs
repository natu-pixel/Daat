import sharp from "sharp";
import { readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const works = path.join(root, "public", "works");
const manifestPath = path.join(works, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
let converted = 0;
let inputBytes = 0;
let outputBytes = 0;

for (const collection of ["aero", "apex", "pulse", "solvanta"]) {
  const folder = path.join(works, collection);
  const files = (await readdir(folder)).filter((name) => /\.(?:jpe?g|png|webp)$/i.test(name));
  for (const filename of files) {
    const input = path.join(folder, filename);
    const outputName = `${path.parse(filename).name}.webp`;
    const output = path.join(folder, outputName);
    if (/\.webp$/i.test(filename) && (await stat(input)).size < 24 * 1024 * 1024) continue;
    const temp = path.join(folder, `.${path.parse(filename).name}.optimized.webp`);
    const backup = `${input}.source-backup`;
    const info = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 3 })
      .toFile(temp);
    inputBytes += (await stat(input)).size;
    outputBytes += info.size;
    if (input === output) await rename(input, backup);
    await rename(temp, output);
    if (input !== output) await unlink(input);
    if (input === output) await unlink(backup);
    converted++;
  }

  manifest[collection] = (await readdir(folder))
    .filter((name) => /^1-\d+\.webp$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
    .map((name) => {
      const filename = path.join(folder, name);
      return sharp(filename).metadata().then(({ width, height }) => ({
        url: `/works/${collection}/${name}`,
        width,
        height,
        source: name,
      }));
    });
  manifest[collection] = await Promise.all(manifest[collection]);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Optimized ${converted} portfolio images.`);
console.log(`Image bytes: ${(inputBytes / 1024 / 1024).toFixed(1)} MiB -> ${(outputBytes / 1024 / 1024).toFixed(1)} MiB.`);
