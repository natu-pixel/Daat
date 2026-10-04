import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localProjects, localServices, localSettings } from "../lib/local-content";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), fetch: vi.fn(), draftMode: vi.fn() }));
vi.mock("@sanity/client", () => ({ createClient: mocks.createClient }));
vi.mock("next/headers", () => ({ draftMode: mocks.draftMode }));
import { getContent } from "../lib/content";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "");
  vi.stubEnv("SANITY_API_READ_TOKEN", "");
  mocks.createClient.mockReset().mockReturnValue({ fetch: mocks.fetch });
  mocks.fetch.mockReset().mockResolvedValue({ projects: localProjects, services: localServices, settings: localSettings });
  mocks.draftMode.mockReset().mockResolvedValue({ isEnabled: false });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

function configured() {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "projectid");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
}

describe("content modes", () => {
  it("uses intentional local studio content when CMS is disabled", async () => expect((await getContent()).source).toBe("local"));
  it("fails on partial CMS configuration", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "projectid");
    await expect(getContent()).rejects.toThrow("requires both");
  });
  it("reads only published content without a token", async () => {
    configured();
    vi.stubEnv("SANITY_API_READ_TOKEN", "test-placeholder");
    expect((await getContent()).source).toBe("sanity");
    expect(mocks.createClient).toHaveBeenCalledWith(expect.objectContaining({ perspective: "published", token: undefined }));
  });
  it("requires a token for draft preview", async () => {
    configured();
    mocks.draftMode.mockResolvedValue({ isEnabled: true });
    await expect(getContent()).rejects.toThrow("read token");
  });
  it("uses the server token only in draft mode", async () => {
    configured();
    vi.stubEnv("SANITY_API_READ_TOKEN", "test-placeholder");
    mocks.draftMode.mockResolvedValue({ isEnabled: true });
    await getContent();
    expect(mocks.createClient).toHaveBeenCalledWith(expect.objectContaining({ perspective: "drafts", token: "test-placeholder" }));
  });
  it("does not fall back to local projects when CMS is empty", async () => {
    configured();
    mocks.fetch.mockResolvedValue({ projects: [], services: [], settings: localSettings });
    expect((await getContent()).projects).toEqual([]);
  });
  it("surfaces invalid CMS content", async () => {
    configured();
    mocks.fetch.mockResolvedValue({ projects: [], services: [], settings: null });
    await expect(getContent()).rejects.toThrow("content is incomplete");
  });
  it("surfaces CMS fetch failures", async () => {
    configured();
    mocks.fetch.mockRejectedValue(new Error("CMS unavailable"));
    await expect(getContent()).rejects.toThrow("CMS unavailable");
  });
});
