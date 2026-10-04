import { describe, expect, it } from "vitest";
import { contactSchema, previewPath, readLimitedBody } from "../lib/contact-validation";
import { projectSchema } from "../lib/content-schema";
import { localProjects } from "../lib/local-content";

const valid = { name: "Test Person", email: "person@example.com", service: "Brand identity", message: "We would like to discuss a new brand identity.", website: "", consent: true };

describe("contact input", () => {
  it("accepts a complete inquiry", () => expect(contactSchema.safeParse(valid).success).toBe(true));
  it.each([
    { name: "" }, { email: "bad-address" }, { message: "short" },
    { message: "x".repeat(4001) }, { name: "x".repeat(101) },
    { website: "spam" }, { consent: false }, { service: "not-a-service" },
  ])("rejects invalid or abusive input %j", (override) => expect(contactSchema.safeParse({ ...valid, ...override }).success).toBe(false));
  it("trims name and brief", () => expect(contactSchema.parse({ ...valid, name: "  Person  " }).name).toBe("Person"));
});

describe("preview path", () => {
  it.each(["/", "/work", "/about", "/services", "/work/brand-system"])("accepts %s", (path) => expect(previewPath(path)).toBe(path));
  it.each(["//evil.example", "https://evil.example", "/work/../contact", "/api/contact", "/work/a?secret=1", "/work/%2f", null])("rejects %s", (path) => expect(previewPath(path)).toBeNull());
});

describe("bounded body reader", () => {
  it("accepts the exact byte limit", async () => expect(await readLimitedBody(new Request("http://localhost", { method: "POST", body: "12345" }), 5)).toBe("12345"));
  it("rejects one byte over the limit", async () => expect(await readLimitedBody(new Request("http://localhost", { method: "POST", body: "123456" }), 5)).toBeNull());
  it("measures UTF-8 bytes, not characters", async () => expect(await readLimitedBody(new Request("http://localhost", { method: "POST", body: "ééé" }), 5)).toBeNull());
});

describe("project shape", () => {
  it.each(localProjects)("accepts the $title project", (project) => expect(projectSchema.safeParse(project).success).toBe(true));
  it("does not substitute DAAT artwork for client projects", () => expect(projectSchema.safeParse({ ...localProjects[0], studioStudy: false, cover: undefined }).success).toBe(false));
  it.each(["https://untrusted.example/image.jpg", "//untrusted.example/image.jpg", "/works/../private.webp", "javascript:alert(1)"])("rejects unapproved asset paths %s", (url) => expect(projectSchema.safeParse({ ...localProjects[0], cover: { url, alt: "Example" } }).success).toBe(false));
  it("rejects gallery images without descriptions", () => expect(projectSchema.safeParse({ ...localProjects[0], gallery: [{ kind: "image", url: "https://cdn.sanity.io/image.jpg", alt: "" }] }).success).toBe(false));
  it("requires video posters", () => expect(projectSchema.safeParse({ ...localProjects[0], gallery: [{ kind: "video", url: "https://cdn.sanity.io/video.mp4", alt: "Brand motion" }] }).success).toBe(false));
});
