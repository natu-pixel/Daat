"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("DAAT page failed:", error); }, [error]);
  return <section className="section inner-page page-heading"><span className="eyebrow">SOMETHING WENT WRONG</span><h1>A brief<br />interruption.</h1><p>We couldn&apos;t load this page. Please try again. If you manage this site, check the server logs and CMS configuration.</p><button className="pill-link" onClick={reset}>Try again <span aria-hidden="true">↗</span></button></section>;
}
