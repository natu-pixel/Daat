import { createClient } from "@sanity/client";
import { draftMode } from "next/headers";
import { z } from "zod";
import { projectSchema, servicesSchema, settingsSchema } from "./content-schema";
import { localProjects, localServices, localSettings } from "./local-content";

const projectFields = `{
  "slug": slug.current, title, category, year, description, challenge, approach,
  deliverables, outcome, "studioStudy": coalesce(studioStudy, false),
  "galleryLayout": coalesce(galleryLayout, "scroll"),
  "cover": cover{ "url": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height },
  "gallery": coalesce(gallery[]{
    "kind": select(_type == "projectVideo" => "video", "image"),
    "url": select(_type == "projectVideo" => file.asset->url, asset->url),
    alt, "poster": poster.asset->url,
    "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height
  }, [])
}`;

export async function getContent() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId && !dataset) {
    return { projects: localProjects, services: localServices, settings: localSettings, source: "local" as const };
  }
  if (!projectId || !dataset) {
    throw new Error("Sanity requires both NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.");
  }
  const { isEnabled } = await draftMode();
  if (isEnabled && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error("Draft preview requires a server-side Sanity read token.");
  }
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-01-01",
    useCdn: false,
    perspective: isEnabled ? "drafts" : "published",
    token: isEnabled ? process.env.SANITY_API_READ_TOKEN : undefined,
  });
  const result = await client.fetch<unknown>(`{
    "projects": *[_type == "project"] | order(orderRank asc, title asc)${projectFields},
    "services": *[_type == "service"] | order(orderRank asc){title, description, items},
    "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{headline, introduction, about}
  }`, {}, { cache: "no-store" });
  const parsed = z.object({
    projects: z.array(projectSchema),
    services: servicesSchema,
    settings: settingsSchema,
  }).safeParse(result);
  if (!parsed.success) {
    console.error("Sanity content validation failed:", parsed.error.issues.map(({ path, message }) => ({ path, message })));
    throw new Error("Studio content is incomplete. Check the required Sanity fields.");
  }
  return { ...parsed.data, source: "sanity" as const };
}
