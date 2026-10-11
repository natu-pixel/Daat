import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const values = new Map<string, string>();
  const kv = {
    get: vi.fn(async (key: string) => values.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => { values.set(key, value); }),
  };
  return {
    values,
    kv,
    getContext: vi.fn((): { env: { RATELIMIT_KV?: typeof kv } } => ({ env: { RATELIMIT_KV: kv } })),
  };
});

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: mocks.getContext }));
import { POST } from "../app/api/contact/route";

const payload = { name: "Test Person", email: "person@example.com", service: "Brand identity", message: "We would like to discuss a new brand identity.", website: "", consent: true };
function request(body = JSON.stringify(payload), origin = "http://localhost:3000", type = "application/json", address = "192.0.2.10") {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { origin, "content-type": type, "cf-connecting-ip": address },
    body,
  });
}

beforeEach(() => {
  mocks.values.clear();
  vi.stubEnv("SITE_URL", "http://localhost:3000");
  vi.stubEnv("RESEND_API_KEY", "test-placeholder");
  vi.stubEnv("CONTACT_FROM", "studio@example.com");
  vi.stubEnv("CONTACT_TO", "inbox@example.com");
  mocks.kv.get.mockClear().mockImplementation(async (key: string) => mocks.values.get(key) ?? null);
  mocks.kv.put.mockClear().mockImplementation(async (key: string, value: string) => { mocks.values.set(key, value); });
  mocks.getContext.mockClear().mockImplementation(() => ({ env: { RATELIMIT_KV: mocks.kv } }));
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ id: "test-id" }), { status: 200 })));
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("contact endpoint", () => {
  it("rejects cross-origin requests", async () => expect((await POST(request(undefined, "https://untrusted.example"))).status).toBe(403));
  it("rejects non-JSON requests", async () => expect((await POST(request(undefined, undefined, "text/plain"))).status).toBe(415));
  it("does not pretend to send without credentials", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await POST(request())).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("reports a missing KV binding without attempting delivery", async () => {
    mocks.getContext.mockReturnValueOnce({ env: {} });
    expect((await POST(request())).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects oversized payloads", async () => expect((await POST(request("x".repeat(16385)))).status).toBe(413));
  it("rejects malformed JSON", async () => expect((await POST(request("{bad"))).status).toBe(400));
  it("rejects spam without sending", async () => {
    expect((await POST(request(JSON.stringify({ ...payload, website: "spam" })))).status).toBe(422);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("enforces three submissions per visitor in a fixed window", async () => {
    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);
    expect((await POST(request())).status).toBe(200);
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("enforces the global limit", async () => {
    for (let index = 0; index < 50; index += 1) {
      expect((await POST(request(JSON.stringify(payload), undefined, undefined, `192.0.2.${index + 1}`))).status).toBe(200);
    }
    const response = await POST(request(JSON.stringify(payload), undefined, undefined, "198.51.100.20"));
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(fetch).toHaveBeenCalledTimes(50);
  });
  it("fails closed when the KV rate-limit store errors", async () => {
    mocks.kv.get.mockRejectedValueOnce(new Error("KV unavailable"));
    expect((await POST(request())).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("logs the provider rejection but returns a generic response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ name: "validation_error", message: "domain is not verified" }), { status: 422 }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ message: "Your inquiry couldn't be sent. Please try again later." });
    expect(console.error).toHaveBeenCalledWith("Resend rejected the inquiry:", expect.objectContaining({ message: "domain is not verified", status: 422 }));
  });
  it("reports email network errors safely", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network unavailable"));
    expect((await POST(request())).status).toBe(502);
  });
  it("sends plain text through Resend and uses reply-to", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    expect(fetch).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer test-placeholder" }),
      body: JSON.stringify({
        from: "studio@example.com",
        to: ["inbox@example.com"],
        reply_to: payload.email,
        subject: "DAAT project inquiry — Brand identity",
        text: `Name: ${payload.name}\nReply to: ${payload.email}\nInterested in: ${payload.service}\n\n${payload.message}`,
      }),
    }));
  });
});
