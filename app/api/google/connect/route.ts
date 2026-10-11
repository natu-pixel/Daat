import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import type { GoogleCalendarEnvironment } from "@/lib/google-calendar";

export const runtime = "nodejs";

function html(body: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Connect Google Calendar</title><body style="font:16px system-ui;max-width:680px;margin:4rem auto;padding:0 1rem;color:#10132f">${body}</body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function getEnvironment(): GoogleCalendarEnvironment {
  return getCloudflareContext().env as GoogleCalendarEnvironment;
}

export async function GET() {
  let env: GoogleCalendarEnvironment;
  try { env = getEnvironment(); } catch { env = {}; }
  if (!env.GOOGLE_SETUP_KEY || !env.GOOGLE_CLIENT_ID) {
    return html("<h1>Google Calendar setup is not configured</h1><p>Set GOOGLE_SETUP_KEY and GOOGLE_CLIENT_ID in the server environment, then try again.</p>", 503);
  }
  return html(`<h1>Connect the studio calendar</h1><p>This one-time setup connects the Google account that will host video calls. Use the setup key provided to the site administrator.</p><form method="post"><label for="key">Setup key</label><p><input id="key" name="key" type="password" required autocomplete="current-password" style="box-sizing:border-box;width:100%;padding:12px"></p><button style="padding:12px 18px">Continue to Google</button></form>`);
}

export async function POST(request: Request) {
  let env: GoogleCalendarEnvironment;
  try { env = getEnvironment(); } catch { env = {}; }
  const origin = request.headers.get("origin");
  const baseUrl = env.SITE_URL || process.env.SITE_URL || new URL(request.url).origin;
  if (origin !== new URL(baseUrl).origin) return html("<h1>Request rejected</h1><p>Open this page directly on the DAAT website.</p>", 403);
  if (!env.GOOGLE_SETUP_KEY || !env.GOOGLE_CLIENT_ID) return html("<h1>Google Calendar setup is not configured</h1>", 503);

  const form = await request.formData();
  const suppliedKey = form.get("key");
  if (typeof suppliedKey !== "string" || suppliedKey !== env.GOOGLE_SETUP_KEY) {
    return html("<h1>Setup key not accepted</h1><p>Check the key and try again.</p>", 403);
  }

  const state = crypto.randomUUID();
  const redirectUri = `${new URL(baseUrl).origin}/api/google/callback`;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
  const secure = new URL(baseUrl).protocol === "https:";
  response.cookies.set("daat_google_oauth_state", state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/google",
    maxAge: 600,
  });
  return response;
}
