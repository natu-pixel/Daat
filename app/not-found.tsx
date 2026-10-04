import Link from "next/link";

export default function NotFound() {
  return <section className="section inner-page page-heading"><span className="eyebrow">404 / A DIFFERENT DIRECTION</span><h1>Not here.<br /><span className="blue-text">But not far.</span></h1><p>This page doesn&apos;t exist, or the project hasn&apos;t been published.</p><Link className="pill-link" href="/">Back to DAAT <span aria-hidden="true">↗</span></Link></section>;
}
