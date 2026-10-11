import { execFile } from "node:child_process";
import { copyFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const destination = path.join(root, "public", "hero");
const width = 2560;
const attempts = 4;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// OneDrive sync can transiently reject writes; retry, then fall back to the shell API,
// which replaces files the platform layer still holds.
async function replace(temporary, input) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await copyFile(temporary, input);
      await rm(temporary);
      return;
    } catch {
      if (attempt === attempts) {
        await new Promise((resolve, reject) => {
          execFile("powershell.exe", ["-NoProfile", "-Command", `$ErrorActionPreference = 'Stop'; try { Copy-Item -LiteralPath '${temporary}' -Destination '${input}' -Force -ErrorAction Stop; Remove-Item -LiteralPath '${temporary}' -Force -ErrorAction Stop } catch { exit 1 }`], (failure) => failure ? reject(new Error(`Could not replace ${input}. ${failure.message}`)) : resolve());
        });
      }
      await wait(1500);
    }
  }
}

const files = (await readdir(destination)).filter((name) => /\.(jpe?g|webp)$/i.test(name)).sort();
if (!files.length) throw new Error("No hero artwork found in public/hero.");
let sourceBytes = 0;
let outputBytes = 0;

for (const [index, name] of files.entries()) {
  const number = String(index + 1).padStart(2, "0");
  const input = path.join(destination, name);
  const source = await sharp(input).metadata();
  if ((source.width ?? 0) <= width && (source.height ?? 0) <= width) {
    console.log(`${number} ${name}: skipped, already ${source.width}x${source.height}.`);
    continue;
  }
  const temporary = path.join(destination, `.${name}.tmp`);
  const pipeline = sharp(input).rotate().resize({ width, fit: "inside", withoutEnlargement: true });
  const encoded = /\.webp$/i.test(name) ? pipeline.webp({ quality: 88 }) : pipeline.jpeg({ quality: 82, mozjpeg: true });
  const previous = (await stat(input)).size;
  const info = await encoded.toFile(temporary);
  await replace(temporary, input);
  sourceBytes += previous;
  outputBytes += info.size;
  console.log(`${number} ${name}: ${info.width}x${info.height}, ${(previous / 1024 / 1024).toFixed(2)} MB -> ${(info.size / 1024 / 1024).toFixed(2)} MB.`);
}

console.log(`Optimized hero artwork. Before: ${(sourceBytes / 1024 / 1024).toFixed(2)} MB. After: ${(outputBytes / 1024 / 1024).toFixed(2)} MB.`);
