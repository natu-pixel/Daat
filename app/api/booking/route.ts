import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readLimitedBody } from "@/lib/contact-validation";
import {
  bookingEndTime,
  bookingIntervalMinutes,
  bookingSlotMinutes,
  bookingStartTime,
  bookingTimeZone,
  formatDateTime,
  getBusyTimes,
  getGoogleAccessToken,
  isAllowedWeekday,
  minutesOfDay,
  overlaps,
  parseDate,
  type GoogleCalendarEnvironment,
} from "@/lib/google-calendar";

export const runtime = "nodejs";

type RateLimitKV = { get(key: string): Promise<string | null>; put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> };
type BookingEnvironment = GoogleCalendarEnvironment & { SITE_URL?: string; RATELIMIT_KV?: RateLimitKV };
const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(254),
  date: z.string(),
  time: z.string(),
  website: z.string().max(0, "We couldn't accept this submission."),
  consent: z.literal(true, { error: "Please agree to the privacy notice." }),
});

function failure(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function limitBooking(kv: RateLimitKV, ip: string) {
  const now = Date.now();
  const windowStart = Math.floor(now / 600_000) * 600_000;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const keyHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const key = `booking:${keyHash}:${windowStart}`;
  const current = Number(await kv.get(key) || "0");
  if (!Number.isSafeInteger(current) || current < 0) throw new Error("Invalid booking rate limit");
  if (current >= 3) return false;
  await kv.put(key, String(current + 1), { expirationTtl: 600 });
  return true;
}

export async function POST(request: Request) {
  let env: BookingEnvironment;
  try { env = getCloudflareContext().env as BookingEnvironment; } catch { env = {}; }
  const siteUrl = env.SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  if (request.headers.get("origin") !== new URL(siteUrl).origin) return failure("This request must come from the DAAT website.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return failure("Please submit the form as JSON.", 415);
  const raw = await readLimitedBody(request);
  if (raw === null) return failure("Your submission is too large.", 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return failure("The submission wasn't valid JSON.", 400); }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0].message, 422);

  const { name, email, date, time } = parsed.data;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    return failure("Google Calendar isn't connected yet. The studio needs to finish setup before calls can be booked.", 503);
  }
  const bookingDate = parseDate(date);
  if (!bookingDate || !isAllowedWeekday(bookingDate)) return failure("Choose a weekday for your call.", 422);
  const zone = bookingTimeZone(env);
  const startMinutes = minutesOfDay(bookingStartTime(env));
  const endMinutes = minutesOfDay(bookingEndTime(env));
  const selectedMinute = minutesOfDay(time);
  const duration = bookingSlotMinutes(env);
  const interval = bookingIntervalMinutes(env);
  if (startMinutes === null || endMinutes === null || selectedMinute === null || selectedMinute < startMinutes || selectedMinute + duration > endMinutes || (selectedMinute - startMinutes) % interval !== 0) {
    return failure("That time isn't available. Choose one of the listed slots.", 422);
  }
  if (!env.RATELIMIT_KV) return failure("Online booking isn't configured yet. Please try again later.", 503);
  try {
    if (!await limitBooking(env.RATELIMIT_KV, request.headers.get("cf-connecting-ip") || "shared")) {
      return failure("You've made several booking requests. Please try again in a few minutes.", 429);
    }
    const accessToken = await getGoogleAccessToken(env);
    const startsAt = formatDateTime(date, time, zone);
    const endsAt = new Date(Date.parse(startsAt) + duration * 60_000).toISOString();
    const busy = await getBusyTimes(accessToken, env, startsAt, endsAt);
    if (overlaps(Date.parse(startsAt), Date.parse(endsAt), busy)) return failure("That slot was just taken. Please choose another available time.", 409);

    const calendar = env.GOOGLE_CALENDAR_ID || "primary";
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar)}/events?conferenceDataVersion=1&sendUpdates=all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `DAAT video call with ${name}`,
        description: `Video call booked through daat.tech. Contact: ${email}`,
        start: { dateTime: startsAt, timeZone: zone },
        end: { dateTime: endsAt, timeZone: zone },
        attendees: [{ email, displayName: name }],
        conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      }),
    });
    const event: unknown = await response.json().catch(() => null);
    if (!response.ok || !event || typeof event !== "object") {
      console.error("Google Calendar event creation failed:", response.status);
      return failure("We couldn't create the calendar booking. Please try another time or contact the studio.", 502);
    }
    const data = event as { conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> }; htmlLink?: string };
    const meetLink = data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri;
    return NextResponse.json({
      ok: true,
      message: meetLink
        ? "Your video call is booked. A calendar invitation with the Google Meet link has been sent to your email."
        : "Your booking is on the calendar. Google is preparing the Meet link; the calendar invitation will arrive by email.",
      meetLink,
    });
  } catch (error) {
    console.error("Google Calendar booking failed:", error instanceof Error ? error.message : "UnknownError");
    return failure("We couldn't complete the calendar booking. Please try again shortly.", 503);
  }
}
