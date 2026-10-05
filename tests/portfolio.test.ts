import { describe, expect, it } from "vitest";
import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { localProjects } from "../lib/local-content";
import manifest from "../public/works/manifest.json";
import geometry from "../public/brand/geometry.json";
import { projectLogos } from "../lib/project-logos";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

describe("supplied portfolio", () => {
  const suppliedProjects = localProjects.filter((project) => !project.studioStudy);
  const media = suppliedProjects.flatMap((project) => project.gallery);
  it("uses all 36 remaining artworks exactly once across the project galleries", () => {
    expect(media).toHaveLength(36);
    expect(new Set(media.map((asset) => asset.url)).size).toBe(36);
    expect(media.map((asset) => asset.url).sort()).toEqual(Object.values(manifest).flat().map((asset) => asset.url).sort());
  });

  describe("brand assets", () => {
    it("uses the supplied DAAT wordmark and mark geometry", async () => {
      for (const [name, file] of [["wordmark", "Daat SVGs-03.svg"], ["mark", "Daat SVGs-09.svg"]] as const) {
        const source = await readFile(path.join(process.cwd(), "works", "SVGs", file), "utf8");
        expect(geometry[name].paths).toEqual([...source.matchAll(/<path\s[^>]*\bd="([^"]+)"/g)].map((match) => match[1]));
      }
    });
    it("provides four temporary cropped logos with transparent backgrounds", async () => {
      expect(projectLogos).toHaveLength(4);
      for (const logo of projectLogos) {
        const image = sharp(path.join(process.cwd(), "public", ...logo.src.split("/").filter(Boolean)));
        expect((await image.metadata()).hasAlpha).toBe(true);
        const { data } = await image.raw().toBuffer({ resolveWithObject: true });
        const alpha = Array.from(data.filter((_, index) => index % 4 === 3));
        expect(alpha.filter((value) => value === 0).length / alpha.length).toBeGreaterThan(.4);
        expect(alpha.some((value) => value > 200)).toBe(true);
      }
    });
  });
  it("provides the five real collections and a separate studio study", () => {
    expect(suppliedProjects.map((project) => project.slug)).toEqual(["aerograin", "pulsedock", "solvanta-labs", "apex", "posters-and-campaigns"]);
    expect(localProjects.filter((project) => project.studioStudy)).toHaveLength(1);
  });
  it("does not invent years, briefs, or results for supplied projects", () => {
    for (const project of suppliedProjects) {
      expect(project.year).toBeUndefined();
      expect(project.challenge).toBeUndefined();
      expect(project.outcome).toBeUndefined();
    }
  });
  it("uses the Solvanta social board in Solvanta, not Apex", () => {
    expect(suppliedProjects.find((project) => project.slug === "solvanta-labs")?.gallery.map((asset) => asset.url)).toContain("/works/apex/04.webp");
    expect(suppliedProjects.find((project) => project.slug === "apex")?.gallery.map((asset) => asset.url)).not.toContain("/works/apex/04.webp");
  });
  it("uses a non-pinned full-artwork grid for the 10 remaining posters", () => {
    const posters = suppliedProjects.find((project) => project.slug === "posters-and-campaigns");
    expect(posters?.galleryLayout).toBe("grid");
    expect(posters?.gallery).toHaveLength(10);
  });
  it("has a persistent prepared image for every gallery entry", async () => {
    await Promise.all(media.map((asset) => access(path.join(process.cwd(), "public", ...asset.url.split("/").filter(Boolean)))));
  });
  it("matches the remaining originals and leaves no stale generated images", async () => {
    for (const [folder, assets] of Object.entries(manifest)) {
      const originals = (await readdir(path.join(process.cwd(), "works", folder))).filter((name) => /\.jpe?g$/i.test(name)).sort();
      expect(assets.map((asset) => asset.source).sort()).toEqual(originals);
      const prepared = (await readdir(path.join(process.cwd(), "public", "works", folder))).filter((name) => /^\d{2,}\.webp$/.test(name)).sort();
      expect(prepared).toEqual(assets.map((asset) => path.basename(asset.url)).sort());
    }
  });
});
