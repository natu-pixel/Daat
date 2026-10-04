import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Resend } from "resend";
import { contactSchema, readLimitedBody } from "@/lib/contact-validation";

export const runtime = "nodejs";

function failure(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, message }, { status, headers });
}

export async function POST(request: Request) {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  if (request.headers.get("origin") !== new URL(siteUrl).origin) {
    return failure("This request must come from the DAAT website.", 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return failure("Please submit the form as JSON.", 415);
  }
  const { RESEND_API_KEY, CONTACT_FROM, CONTACT_TO, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;
  if (!RESEND_API_KEY || !CONTACT_FROM || !CONTACT_TO || !UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    console.error("Contact delivery is not configured. Set Resend, recipient, and Upstash environment variables.");
    return failure("The inquiry form isn't connected yet. Please try again once the studio has enabled email delivery.", 503);
  }
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
  const redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });
  const perVisitor = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "daat:contact:visitor", analytics: false });
  const global = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, "1 h"), prefix: "daat:contact:global", analytics: false });
  // Hosting must overwrite forwarded headers. Without one, use a conservative shared bucket.
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "shared";
  try {
    const visitorLimit = await perVisitor.limit(address);
    if (!visitorLimit.success) {
      return failure("You've sent several inquiries. Please try again in a few minutes.", 429, { "Retry-After": String(Math.max(1, Math.ceil((visitorLimit.reset - Date.now()) / 1000))) });
    }
    const globalLimit = await global.limit("all");
    if (!globalLimit.success) {
      return failure("The studio is receiving a lot of inquiries. Please try again later.", 429, { "Retry-After": String(Math.max(1, Math.ceil((globalLimit.reset - Date.now()) / 1000))) });
    }
  } catch (error) {
    console.error("Contact rate-limit provider failed:", error instanceof Error ? error.name : "UnknownError");
    return failure("We couldn't securely process your inquiry. Please try again later.", 503);
  }
  const { name, email, service, message } = parsed.data;
  try {
    const result = await new Resend(RESEND_API_KEY).emails.send({
      from: CONTACT_FROM,
      to: CONTACT_TO.split(",").map((recipient) => recipient.trim()),
      replyTo: email,
      subject: `DAAT project inquiry — ${service}`,
      text: `Name: ${name}\nReply to: ${email}\nInterested in: ${service}\n\n${message}`,
    });
    if (result.error || !result.data?.id) {
      console.error("Resend did not accept the inquiry:", result.error?.name || "MissingMessageId");
      return failure("Your inquiry couldn't be sent. Please try again later.", 502);
    }
  } catch (error) {
    console.error("Contact email provider failed:", error instanceof Error ? error.name : "UnknownError");
    return failure("We couldn't connect to email delivery. Please try again later.", 502);
  }
  return NextResponse.json({ ok: true, message: "Your inquiry has been accepted for delivery. Thank you for starting the conversation." });
}
