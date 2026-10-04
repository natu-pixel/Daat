import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-schema";
import { Reveal } from "./reveal";

export function PosterPreview({ project }: { project: Project }) {
  const chosen = [2, 7, 16, 17, 18, 21, 24, 25].map((index) => project.gallery[index]).filter((asset) => asset?.kind === "image");
  return <section className="section poster-preview">
    <Reveal><div className="section-heading"><div><span className="eyebrow">DESIGNED TO BE NOTICED</span><h2>Many voices.<br /><span className="muted">Every one distinct.</span></h2></div><Link href={`/work/${project.slug}`} className="text-link">The full collection <span aria-hidden="true">↗</span></Link></div></Reveal>
    <div className="poster-preview-grid">{chosen.map((asset, index) => <Link href={`/work/${project.slug}`} key={asset.url} className="poster-preview-image"><Reveal kind="image" delay={index % 3 * .08}><Image src={asset.url} alt={asset.alt} width={asset.width || 1000} height={asset.height || 1280} sizes="(max-width: 760px) 50vw, 25vw" /></Reveal></Link>)}</div>
  </section>;
}
