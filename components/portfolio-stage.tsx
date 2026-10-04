import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-schema";
import { Reveal } from "./reveal";

export function PortfolioStage({ projects }: { projects: Project[] }) {
  const chosen = projects.filter((project) => !project.studioStudy && project.cover).slice(0, 3);
  if (!chosen.length) return null;
  return (
    <section className="portfolio-stage" aria-label="A first look at DAAT's work">
      <div className="portfolio-stage-heading"><span className="eyebrow">A FEW DIFFERENT WORLDS. ONE STUDIO.</span><Link href="/work" className="eyebrow">EXPLORE THE COLLECTION ↗</Link></div>
      <div className="portfolio-stage-grid">
        {chosen.map((project, index) => project.cover && <Link key={project.slug} href={`/work/${project.slug}`} className={`portfolio-stage-tile tile-${index + 1}`}>
          <Reveal className="portfolio-stage-image" kind="image" delay={index * .09}><Image src={project.cover.url} alt={project.cover.alt} fill priority={index === 0} sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 50vw, 33vw"} /></Reveal>
          <span className="portfolio-tile-caption"><span>{project.title}</span><span aria-hidden="true">↗</span></span>
        </Link>)}
      </div>
    </section>
  );
}
