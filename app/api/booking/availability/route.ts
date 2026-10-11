import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
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

function environment() {
  return getCloudflareContext().env as GoogleCalendarEnvironment;
}

function localToday(timeZone: string) {
  const values = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = Object.fromEntries(values.map(({ type, value }) => [type, value]));
  return `${part.year}-${part.month}-${part.day}`;
}

export async function GET(request: NextRequest) {
  const dateString = request.nextUrl.searchParams.get("date") || "";
  const date = parseDate(dateString);
  if (!date || !isAllowedWeekday(date)) return NextResponse.json({ ok: false, message: "Choose a weekday for your call." }, { status: 400 });
  let env: GoogleCalendarEnvironment;
  try { env = environment(); } catch { env = {}; }
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ ok: false, message: "Google Calendar isn't connected yet. The studio needs to finish setup before times can be booked." }, { status: 503 });
  }
  const zone = bookingTimeZone(env);
  const today = localToday(zone);
  const dayDistance = (date.getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000;
  if (dayDistance < 0 || dayDistance > 90) return NextResponse.json({ ok: false, message: "Choose a date within the next 90 days." }, { status: 400 });

  const startMinutes = minutesOfDay(bookingStartTime(env));
  const endMinutes = minutesOfDay(bookingEndTime(env));
  const duration = bookingSlotMinutes(env);
  const interval = bookingIntervalMinutes(env);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes || duration > endMinutes - startMinutes) {
    return NextResponse.json({ ok: false, message: "Booking hours need configuration." }, { status: 503 });
  }

  try {
    const rangeStart = formatDateTime(dateString, bookingStartTime(env), zone);
    const rangeEnd = formatDateTime(dateString, bookingEndTime(env), zone);
    const busy = await getBusyTimes(await getGoogleAccessToken(env), env, rangeStart, rangeEnd);
    const now = Date.now();
    const slots: string[] = [];
    for (let minute = startMinutes; minute + duration <= endMinutes; minute += interval) {
      const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const slotStart = Date.parse(formatDateTime(dateString, time, zone));
      if (slotStart > now && !overlaps(slotStart, slotStart + duration * 60_000, busy)) slots.push(time);
    }
    return NextResponse.json({ ok: true, slots, timeZone: zone, durationMinutes: duration }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Google Calendar availability failed:", error instanceof Error ? error.message : "UnknownError");
    return NextResponse.json({ ok: false, message: "We couldn't load available times. Please try again shortly." }, { status: 503 });
  }
}
