import { timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { previewPath } from "@/lib/contact-validation";

export async function GET(request: Request) {
  const expected = process.env.SANITY_PREVIEW_SECRET;
  if (!expected || !process.env.SANITY_API_READ_TOKEN || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    console.error("Draft preview configuration is incomplete.");
    return NextResponse.json({ message: "Draft preview is not configured." }, { status: 503 });
  }
  const url = new URL(request.url);
  const supplied = url.searchParams.get("secret") || "";
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ message: "Invalid preview credentials." }, { status: 401 });
  const path = previewPath(url.searchParams.get("path") || "/");
  if (!path) return NextResponse.json({ message: "Invalid preview path." }, { status: 400 });
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, request.url), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
