import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ enable: vi.fn() }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ enable: mocks.enable }) }));
import { GET } from "../app/api/draft/route";

beforeEach(() => {
  vi.stubEnv("SANITY_PREVIEW_SECRET", "test-preview-placeholder");
  vi.stubEnv("SANITY_API_READ_TOKEN", "test-read-placeholder");
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "projectid");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
  mocks.enable.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("draft authorization", () => {
  it("rejects missing preview configuration", async () => {
    vi.stubEnv("SANITY_PREVIEW_SECRET", "");
    expect((await GET(new Request("http://localhost/api/draft"))).status).toBe(503);
    expect(mocks.enable).not.toHaveBeenCalled();
  });
  it.each(["", "wrong", "x".repeat(200)])("rejects invalid credentials %s", async (secret) => {
    expect((await GET(new Request(`http://localhost/api/draft?secret=${secret}`))).status).toBe(401);
    expect(mocks.enable).not.toHaveBeenCalled();
  });
  it("rejects external redirects even with valid credentials", async () => {
    expect((await GET(new Request("http://localhost/api/draft?secret=test-preview-placeholder&path=//untrusted.example"))).status).toBe(400);
    expect(mocks.enable).not.toHaveBeenCalled();
  });
  it("enables preview and redirects to a validated project path", async () => {
    const response = await GET(new Request("http://localhost/api/draft?secret=test-preview-placeholder&path=/work/daat-brand-system"));
    expect(mocks.enable).toHaveBeenCalledOnce();
    expect(response.headers.get("location")).toBe("http://localhost/work/daat-brand-system");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
