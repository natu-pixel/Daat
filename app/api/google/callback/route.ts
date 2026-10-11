import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import type { GoogleCalendarEnvironment } from "@/lib/google-calendar";

export const runtime = "nodejs";

function page(message: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Google Calendar setup</title><body style="font:16px system-ui;max-width:720px;margin:4rem auto;padding:0 1rem;color:#10132f">${message}</body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}

function getEnvironment(): GoogleCalendarEnvironment {
  return getCloudflareContext().env as GoogleCalendarEnvironment;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export async function GET(request: NextRequest) {
  let env: GoogleCalendarEnvironment;
  try { env = getEnvironment(); } catch { env = {}; }
  const expectedOrigin = env.SITE_URL || process.env.SITE_URL || new URL(request.url).origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("daat_google_oauth_state")?.value;
  const clearCookie = (response: NextResponse) => {
    response.cookies.set("daat_google_oauth_state", "", { httpOnly: true, secure: new URL(expectedOrigin).protocol === "https:", sameSite: "lax", path: "/api/google", maxAge: 0 });
    return response;
  };
  if (request.nextUrl.origin !== new URL(expectedOrigin).origin) return clearCookie(NextResponse.json({ ok: false, message: "OAuth callback origin mismatch." }, { status: 400 }));
  if (!code || !state || !cookieState || state !== cookieState) return clearCookie(NextResponse.json({ ok: false, message: "Google authorization could not be verified. Restart the connection flow." }, { status: 400 }));
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return clearCookie(NextResponse.json({ ok: false, message: "Google OAuth client credentials are not configured." }, { status: 503 }));

  const redirectUri = `${new URL(expectedOrigin).origin}/api/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens: unknown = await tokenResponse.json().catch(() => null);
  const refreshToken = tokens && typeof tokens === "object" && "refresh_token" in tokens && typeof tokens.refresh_token === "string"
    ? tokens.refresh_token
    : null;
  if (!tokenResponse.ok || !refreshToken) {
    return clearCookie(NextResponse.json({ ok: false, message: "Google did not return a refresh token. Restart setup and approve calendar access." }, { status: 502 }));
  }

  const tokenField = escapeHtml(refreshToken);
  const connectedPage = page(`<h1>Google Calendar connected</h1><p>Copy this refresh token now, then save it as the Cloudflare Worker secret <code>GOOGLE_REFRESH_TOKEN</code>. This page shows it once and does not save it in the app.</p><p><input id="token" readonly value="${tokenField}" style="box-sizing:border-box;width:100%;padding:12px"></p><button onclick="navigator.clipboard.writeText(document.getElementById('token').value)">Copy token</button><p>After saving the secret, remove or rotate <code>GOOGLE_SETUP_KEY</code>. Keep this token private.</p>`);
  const response = new NextResponse(await connectedPage.text(), {
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
  return clearCookie(response);
}
