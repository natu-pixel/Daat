import { defineArrayMember, defineField, defineType } from "sanity";

const textField = (name: string, title: string) => defineField({ name, title, type: "text", rows: 3, validation: (rule) => rule.required() });
const image = (name: string, title: string) => defineField({
  name, title, type: "image", options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Image description", type: "string", validation: (rule) => rule.required() })],
});

export const schemaTypes = [
  defineType({
    name: "siteSettings", title: "Site settings", type: "document",
    fields: [textField("headline", "Homepage headline (two lines)"), textField("introduction", "Homepage introduction"), textField("about", "Studio introduction")],
    preview: { prepare: () => ({ title: "DAAT site settings" }) },
  }),
  defineType({
    name: "service", title: "Service", type: "document",
    fields: [
      defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
      textField("description", "Description"),
      defineField({ name: "items", title: "Capabilities", type: "array", of: [defineArrayMember({ type: "string" })], validation: (rule) => rule.required().min(1) }),
      defineField({ name: "orderRank", title: "Display order", type: "number", initialValue: 0 }),
    ],
  }),
  defineType({
    name: "projectVideo", title: "Project video", type: "object",
    fields: [
      defineField({ name: "file", title: "Video file", type: "file", options: { accept: "video/mp4,video/webm" }, validation: (rule) => rule.required() }),
      defineField({ ...image("poster", "Poster image"), validation: (rule) => rule.required() }),
      defineField({ name: "alt", title: "Video description", type: "string", validation: (rule) => rule.required() }),
    ],
  }),
  defineType({
    name: "project", title: "Project", type: "document",
    fields: [
      defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required().custom((value) => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || "Use lowercase words separated by hyphens.") }),
      defineField({ name: "category", type: "string", options: { list: ["Brand identity", "Web development", "Motion design", "Campaign design"] }, validation: (rule) => rule.required() }),
      defineField({ name: "year", type: "string", description: "Optional. Do not infer a project date from image filenames.", validation: (rule) => rule.regex(/^\d{4}$/) }),
      textField("description", "Introduction"),
      defineField({ name: "challenge", type: "text", rows: 3, description: "Optional. Only include the actual project brief." }),
      defineField({ name: "approach", type: "text", rows: 3, description: "Optional visual or process narrative." }),
      defineField({ name: "deliverables", type: "array", of: [defineArrayMember({ type: "string" })], validation: (rule) => rule.required() }),
      defineField({ name: "outcome", title: "Verified outcome (optional)", type: "text", description: "Only include substantiated results. Leave blank if unavailable." }),
      defineField({
        ...image("cover", "Cover image"),
        validation: (rule) => rule.custom((value, context) => context.document?.studioStudy || value?.asset ? true : "Client projects require a cover image."),
      }),
      defineField({
        name: "gallery", title: "Scroll gallery", type: "array",
        of: [
          defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", validation: (rule) => rule.required() })] }),
          defineArrayMember({ type: "projectVideo" }),
        ],
      }),
      defineField({ name: "galleryLayout", title: "Gallery layout", type: "string", options: { list: [{ title: "Horizontal scroll", value: "scroll" }, { title: "Full artwork grid", value: "grid" }] }, initialValue: "scroll" }),
      defineField({ name: "studioStudy", title: "DAAT's own identity study", type: "boolean", initialValue: false, description: "Enable only for DAAT's identity project. Enables the DAAT design-board gallery when no media is uploaded." }),
      defineField({ name: "orderRank", title: "Display order", type: "number", initialValue: 0 }),
    ],
  }),
];
