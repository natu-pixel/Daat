import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { contactSchema, readLimitedBody } from "@/lib/contact-validation";

export const runtime = "nodejs";

type RateLimitKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type ContactEnvironment = {
  SITE_URL?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
  RATELIMIT_KV?: RateLimitKV;
};

function failure(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, message }, { status, headers });
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "UnknownError";
  return message.replace(/[\r\n\t]+/g, " ").slice(0, 300);
}

async function hashAddress(address: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(address));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeFixedWindow(kv: RateLimitKV, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const reset = windowStart + windowMs;
  const storageKey = `contact-rate:${key}:${windowStart}`;
  const currentValue = await kv.get(storageKey);
  const currentCount = currentValue === null ? 0 : Number(currentValue);
  if (!Number.isSafeInteger(currentCount) || currentCount < 0) {
    throw new Error("Invalid rate-limit value in KV");
  }
  if (currentCount >= limit) return { success: false, reset };

  await kv.put(storageKey, String(currentCount + 1), {
    expirationTtl: Math.max(60, Math.ceil((reset - now) / 1000)),
  });
  return { success: true, reset };
}

export async function POST(request: Request) {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  if (request.headers.get("origin") !== new URL(siteUrl).origin) {
    return failure("This request must come from the DAAT website.", 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return failure("Please submit the form as JSON.", 415);
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_FROM = process.env.CONTACT_FROM;
  const CONTACT_TO = process.env.CONTACT_TO;
  let rateLimitKV: RateLimitKV | undefined;
  try {
    rateLimitKV = (getCloudflareContext().env as ContactEnvironment).RATELIMIT_KV;
  } catch (error) {
    console.error("Contact Worker bindings are unavailable:", safeErrorMessage(error));
    // Local .env values can still be used for validation and email, but KV is required for safe delivery.
  }

  const missing = [
    !RESEND_API_KEY && "RESEND_API_KEY",
    !CONTACT_FROM && "CONTACT_FROM",
    !CONTACT_TO && "CONTACT_TO",
    !rateLimitKV && "RATELIMIT_KV",
  ].filter((name): name is string => Boolean(name));
  if (missing.length) {
    console.error("Contact delivery configuration is missing:", missing.join(", "));
    return failure("The inquiry form isn't connected yet. Please try again once the studio has enabled email delivery.", 503);
  }
  const resendApiKey = RESEND_API_KEY!;
  const contactFrom = CONTACT_FROM!;
  const contactTo = CONTACT_TO!;
  const kv = rateLimitKV!;

  const raw = await readLimitedBody(request);
  if (raw === null) return failure("Your submission is too large. Please shorten your project brief.", 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return failure("The submission wasn't valid JSON. Please try again.", 400);
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0].message, 422);

  // Cloudflare overwrites this header. Hash the address before storing a per-visitor key.
  const address = request.headers.get("cf-connecting-ip") || "shared";
  try {
    const addressHash = await hashAddress(address);
    const visitorLimit = await consumeFixedWindow(kv, `visitor:${addressHash}`, 3, 10 * 60 * 1000);
    if (!visitorLimit.success) {
      return failure("You've sent several inquiries. Please try again in a few minutes.", 429, {
        "Retry-After": String(Math.max(1, Math.ceil((visitorLimit.reset - Date.now()) / 1000))),
      });
    }
    const globalLimit = await consumeFixedWindow(kv, "global", 50, 60 * 60 * 1000);
    if (!globalLimit.success) {
      return failure("The studio is receiving a lot of inquiries. Please try again later.", 429, {
        "Retry-After": String(Math.max(1, Math.ceil((globalLimit.reset - Date.now()) / 1000))),
      });
    }
  } catch (error) {
    console.error("Contact KV rate limit failed:", safeErrorMessage(error));
    return failure("We couldn't securely process your inquiry. Please try again later.", 503);
  }

  const { name, email, service, message, meetingDate, meetingTime } = parsed.data;
  const meetingRequest = meetingDate && meetingTime
    ? `\n\nGoogle Meet request: ${meetingDate} at ${meetingTime} (EAT, UTC+03:00). Please confirm availability by email.`
    : "";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: contactFrom,
        to: contactTo.split(",").map((recipient) => recipient.trim()).filter(Boolean),
        reply_to: email,
        subject: `DAAT project inquiry — ${service}`,
        text: `Name: ${name}\nReply to: ${email}\nInterested in: ${service}\n\n${message}${meetingRequest}`,
      }),
    });
    const result: unknown = await response.json().catch(() => null);
    const resultObject = result && typeof result === "object" ? result as Record<string, unknown> : {};
    if (!response.ok || typeof resultObject.id !== "string") {
      const errorObject = resultObject.error && typeof resultObject.error === "object"
        ? resultObject.error as Record<string, unknown>
        : resultObject;
      const errorName = typeof errorObject.name === "string" ? errorObject.name : "ResendError";
      const errorMessage = typeof errorObject.message === "string" ? errorObject.message : `HTTP ${response.status}`;
      console.error("Resend rejected the inquiry:", {
        status: response.status,
        name: errorName,
        message: errorMessage.replace(/[\r\n\t]+/g, " ").slice(0, 300),
      });
      return failure("Your inquiry couldn't be sent. Please try again later.", 502);
    }
  } catch (error) {
    console.error("Resend request failed:", safeErrorMessage(error));
    return failure("We couldn't connect to email delivery. Please try again later.", 502);
  }

  const messageText = meetingRequest
    ? "Thanks, your inquiry has been sent. We’ll confirm your requested Google Meet time by email."
    : "Thanks, your inquiry has been sent. We’ll be in touch by email soon.";
  return NextResponse.json({ ok: true, message: messageText });
}
