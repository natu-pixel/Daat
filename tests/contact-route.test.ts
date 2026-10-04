import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ limit: vi.fn(), send: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() { return {}; }
    limit = mocks.limit;
  },
}));
vi.mock("resend", () => ({ Resend: class { emails = { send: mocks.send }; } }));
import { POST } from "../app/api/contact/route";

const payload = { name: "Test Person", email: "person@example.com", service: "Brand identity", message: "We would like to discuss a new brand identity.", website: "", consent: true };
function request(body = JSON.stringify(payload), origin = "http://localhost:3000", type = "application/json") {
  return new Request("http://localhost:3000/api/contact", { method: "POST", headers: { origin, "content-type": type }, body });
}

beforeEach(() => {
  vi.stubEnv("SITE_URL", "http://localhost:3000");
  vi.stubEnv("RESEND_API_KEY", "test-placeholder");
  vi.stubEnv("CONTACT_FROM", "studio@example.com");
  vi.stubEnv("CONTACT_TO", "inbox@example.com");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.com");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-placeholder");
  mocks.limit.mockReset().mockResolvedValue({ success: true, reset: Date.now() + 60000 });
  mocks.send.mockReset().mockResolvedValue({ data: { id: "test-id" }, error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("contact endpoint", () => {
  it("rejects cross-origin requests", async () => expect((await POST(request(undefined, "https://untrusted.example"))).status).toBe(403));
  it("rejects non-JSON requests", async () => expect((await POST(request(undefined, undefined, "text/plain"))).status).toBe(415));
  it("does not pretend to send without credentials", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await POST(request())).status).toBe(503);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("rejects oversized payloads", async () => expect((await POST(request("x".repeat(16385)))).status).toBe(413));
  it("rejects malformed JSON", async () => expect((await POST(request("{bad"))).status).toBe(400));
  it("rejects spam without sending", async () => {
    expect((await POST(request(JSON.stringify({ ...payload, website: "spam" })))).status).toBe(422);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("enforces visitor rate limits", async () => {
    mocks.limit.mockResolvedValue({ success: false, reset: Date.now() + 60000 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("enforces the global rate limit", async () => {
    mocks.limit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, reset: Date.now() + 60000 });
    expect((await POST(request())).status).toBe(429);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("fails closed on rate-limit provider failure", async () => {
    mocks.limit.mockRejectedValue(new Error("Provider unavailable"));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("surfaces email provider rejection", async () => {
    mocks.send.mockResolvedValue({ data: null, error: { name: "validation_error" } });
    expect((await POST(request())).status).toBe(502);
  });
  it("surfaces email network failure", async () => {
    mocks.send.mockRejectedValue(new Error("Network unavailable"));
    expect((await POST(request())).status).toBe(502);
  });
  it("requires provider acceptance and uses reply-to", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ from: "studio@example.com", replyTo: payload.email, to: ["inbox@example.com"] }));
  });
});
