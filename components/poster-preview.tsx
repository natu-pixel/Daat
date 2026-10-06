import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-schema";
import { Reveal } from "./reveal";

export function PosterPreview({ project }: { project: Project }) {
  const chosen = project.gallery.filter((asset) => asset.kind === "image").slice(0, 8);
  return <section className="section poster-preview">
    <Reveal><div className="positioning-heading">
      <div>
        <h2><span data-sweep>We don&apos;t just help your business look better; we position it to be understood, trusted, and chosen by the right people.</span></h2>
        <Link href="/work" className="impact-link">See more of our works <span aria-hidden="true">→</span></Link>
      </div>
      <Link href="/contact" className="positioning-cta">LET&apos;S BUILD SOMETHING CLEAR</Link>
    </div></Reveal>
    <div className="poster-preview-grid">{chosen.map((asset, index) => <Link href={`/work/${project.slug}`} key={asset.url} className="poster-preview-image"><Reveal kind="image" delay={index % 3 * .08}><Image src={asset.url} alt={asset.alt} width={asset.width || 1000} height={asset.height || 1280} sizes="(max-width: 760px) 50vw, 25vw" /></Reveal></Link>)}</div>
  </section>;
}
