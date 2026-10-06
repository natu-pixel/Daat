import type { Metadata } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { Header } from "@/components/header";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import "./globals.css";

const aspekta = localFont({
  src: "../public/fonts/AspektaVF.woff2",
  variable: "--font-aspekta",
  weight: "100 900",
  display: "swap",
});

const baseMetadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "DAAT — Brand. Digital. Motion.", template: "%s — DAAT" },
  description: "Clarity in thought. Impact by design. DAAT connects brand identity, web development, and motion into distinctive digital experiences.",
  openGraph: { type: "website", siteName: "DAAT", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/mark.svg" },
};

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  return { ...baseMetadata, robots: isEnabled ? { index: false, follow: false } : { index: true, follow: true } };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode();
  return (
    <html lang="en" className={aspekta.variable}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {isEnabled && <div className="preview-banner">Draft preview <a href="/api/draft/disable">Exit preview</a></div>}
        <AnnouncementBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
