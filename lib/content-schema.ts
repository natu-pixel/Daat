import { z } from "zod";

const assetUrlSchema = z.string().refine(
  (value) => /^\/works\/[a-z0-9-]+\/\d{2}\.webp$/.test(value) || /^https:\/\/cdn\.sanity\.io\/[^\s]+$/.test(value),
  "Use a prepared local work asset or a Sanity CDN URL.",
);
const dimensions = { width: z.number().positive().optional().nullable(), height: z.number().positive().optional().nullable() };
const mediaSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("image"), url: assetUrlSchema, alt: z.string().min(1), ...dimensions }),
  z.object({ kind: z.literal("video"), url: assetUrlSchema, alt: z.string().min(1), poster: assetUrlSchema }),
]);

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  category: z.enum(["Brand identity", "Web development", "Motion design", "Campaign design"]),
  year: z.string().regex(/^\d{4}$/).optional().nullable(),
  description: z.string().min(1),
  challenge: z.string().min(1).optional().nullable(),
  approach: z.string().min(1).optional().nullable(),
  deliverables: z.array(z.string()),
  outcome: z.string().optional().nullable(),
  cover: z.object({ url: assetUrlSchema, alt: z.string().min(1), ...dimensions }).optional().nullable(),
  gallery: z.array(mediaSchema).default([]),
  studioStudy: z.boolean().default(false),
  galleryLayout: z.enum(["scroll", "grid"]).default("scroll"),
}).superRefine((project, context) => {
  if (!project.studioStudy && !project.cover) {
    context.addIssue({ code: "custom", path: ["cover"], message: "Client projects require a cover image." });
  }
});

export type Project = z.infer<typeof projectSchema>;

export const servicesSchema = z.array(z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(z.string().min(1)),
}));

export const settingsSchema = z.object({
  headline: z.string().min(1),
  introduction: z.string().min(1),
  about: z.string().min(1),
});
