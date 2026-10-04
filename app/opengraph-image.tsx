import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DAAT — Clarity in thought. Impact by design.";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#2a41f1", color: "#f2f3f4", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70 }}>
      <div style={{ fontSize: 62, fontWeight: 700 }}>daat.</div>
      <div style={{ fontSize: 86, letterSpacing: -4, display: "flex", flexDirection: "column" }}><span>Clarity in thought.</span><span>Impact by design.</span></div>
      <div style={{ fontSize: 22 }}>BRAND. DIGITAL. MOTION.</div>
    </div>, size,
  );
}
