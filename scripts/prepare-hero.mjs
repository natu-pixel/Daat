import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, readdir, copyFile, writeFile, stat, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = path.join(root, "works", "video");
const files = (await readdir(source)).filter((name) => /\.mp4$/i.test(name));
if (files.length !== 1) throw new Error("Place exactly one MP4 hero video in works/video.");
const input = path.join(source, files[0]);
const destination = path.join(root, "public", "hero");
await mkdir(destination, { recursive: true });

const bytes = await readFile(input);
const server = createServer((request, response) => {
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end('<html><body><video muted preload="auto" src="/reel.mp4"></video></body></html>');
    return;
  }
  if (request.url !== "/reel.mp4") { response.writeHead(404); response.end(); return; }
  const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  const start = range ? Number(range[1]) : 0;
  const end = range?.[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
  if (start > end || start >= bytes.length) { response.writeHead(416); response.end(); return; }
  response.writeHead(range ? 206 : 200, {
    "Content-Type": "video/mp4",
    "Content-Length": end - start + 1,
    "Accept-Ranges": "bytes",
    ...(range ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` } : {}),
  });
  response.end(bytes.subarray(start, end + 1));
});
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
const address = server.address();
if (!address || typeof address === "string") throw new Error("Poster server did not bind a local port.");
console.log("Preparing video poster with the local browser.");
let browser;
try {
  browser = await chromium.launch({ channel: process.env.PW_BROWSER_CHANNEL || "msedge", headless: true, timeout: 30_000 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return video && video.readyState >= 2;
  }, { timeout: 30_000 });
  const metadata = await page.locator("video").evaluate((video) => {
    video.pause();
    video.muted = true;
    return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
  });
  if (!metadata.width || !metadata.height || !Number.isFinite(metadata.duration)) throw new Error("Hero video metadata is invalid.");
  const height = Math.round(1280 * metadata.height / metadata.width);
  await page.setViewportSize({ width: 1280, height });
  await page.addStyleTag({ content: "html,body {margin:0;background:#050926;} video {display:block;width:1280px;height:auto;position:static;}" });
  const time = Math.min(1, metadata.duration / 3);
  await page.locator("video").evaluate((video, target) => { video.currentTime = target; }, time);
  await page.waitForFunction((target) => {
    const video = document.querySelector("video");
    return video && !video.seeking && Math.abs(video.currentTime - target) < .1;
  }, time, { timeout: 15_000 });
  await sharp(await page.locator("video").screenshot()).webp({ quality: 90 }).toFile(path.join(destination, "poster.webp"));
  await copyFile(input, path.join(destination, "studio-reel.mp4"));
  await writeFile(path.join(destination, "metadata.json"), `${JSON.stringify({ ...metadata, source: files[0] }, null, 2)}\n`);
  console.log(`Prepared hero: ${metadata.width}x${metadata.height}, ${metadata.duration.toFixed(2)}s, ${((await stat(input)).size / 1024 / 1024).toFixed(2)} MB.`);
} finally {
  if (browser) await browser.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
