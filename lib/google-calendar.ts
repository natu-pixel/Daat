export type GoogleCalendarEnvironment = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  GOOGLE_CALENDAR_ID?: string;
  GOOGLE_SETUP_KEY?: string;
  SITE_URL?: string;
  BOOKING_TIME_ZONE?: string;
  BOOKING_START_TIME?: string;
  BOOKING_END_TIME?: string;
  BOOKING_SLOT_MINUTES?: string;
  BOOKING_INTERVAL_MINUTES?: string;
};

type FreeBusyResponse = {
  calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
};

export const calendarId = (env: GoogleCalendarEnvironment) => env.GOOGLE_CALENDAR_ID || "primary";
export const bookingTimeZone = (env: GoogleCalendarEnvironment) => env.BOOKING_TIME_ZONE || "Africa/Nairobi";
export const bookingSlotMinutes = (env: GoogleCalendarEnvironment) => positiveInteger(env.BOOKING_SLOT_MINUTES, 30);
export const bookingIntervalMinutes = (env: GoogleCalendarEnvironment) => positiveInteger(env.BOOKING_INTERVAL_MINUTES, 30);
export const bookingStartTime = (env: GoogleCalendarEnvironment) => env.BOOKING_START_TIME || "09:00";
export const bookingEndTime = (env: GoogleCalendarEnvironment) => env.BOOKING_END_TIME || "17:00";

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 240 ? parsed : fallback;
}

export function isValidTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function localDateTime(date: string, time: string, timeZone: string) {
  return { dateTime: `${date}T${time}:00`, timeZone };
}

export async function getGoogleAccessToken(env: GoogleCalendarEnvironment) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("Google Calendar is not connected. Configure the Google OAuth secrets first.");
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== "object" || !("access_token" in data) || typeof data.access_token !== "string") {
    throw new Error("Google Calendar authorization failed. Check the configured OAuth credentials.");
  }
  return data.access_token;
}

export async function getBusyTimes(accessToken: string, env: GoogleCalendarEnvironment, start: string, end: string) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: start, timeMax: end, timeZone: bookingTimeZone(env), items: [{ id: calendarId(env) }] }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error("Google Calendar availability could not be checked.");
  const busy = (data as FreeBusyResponse | null)?.calendars?.[calendarId(env)]?.busy;
  if (!busy) throw new Error("Google Calendar did not return availability for the selected calendar.");
  return busy.map((period) => ({ start: Date.parse(period.start), end: Date.parse(period.end) }));
}

export function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function minutesOfDay(value: string) {
  if (!isValidTime(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isAllowedWeekday(date: Date) {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

export function overlaps(start: number, end: number, busy: Array<{ start: number; end: number }>) {
  return busy.some((period) => start < period.end && end > period.start);
}

export function formatDateTime(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desiredWallTime = Date.UTC(year, month - 1, day, hour, minute);
  let result = desiredWallTime;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(result));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const representedWallTime = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
    result += desiredWallTime - representedWallTime;
  }
  return new Date(result).toISOString();
}
