import Image from "next/image";
import Link from "next/link";
import { webProjects, type WebProject } from "@/lib/web-projects";
import { Reveal } from "./reveal";

function TileContent({ project, index }: { project: WebProject; index: number }) {
  return (
    <>
      <Reveal className="portfolio-stage-image" kind="image" delay={index * .09}>
        {project.image
          ? <Image src={project.image.url} alt={project.image.alt} fill priority={index === 0} sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 50vw, 33vw"} />
          : <div className="web-tile-art">
            <strong>{project.name}</strong>
            {project.status === "in-development"
              ? <span className="web-tile-status"><i aria-hidden="true" /> In development</span>
              : <small>{project.domain} <span aria-hidden="true">↗</span></small>}
          </div>}
      </Reveal>
      {project.status === "in-development" && project.image && <span className="web-tile-status is-floating"><i aria-hidden="true" /> In development</span>}
      {project.url && project.image && <span className="portfolio-tile-caption"><span>{project.name}</span><span aria-hidden="true">↗</span></span>}
    </>
  );
}

export function PortfolioStage() {
  return (
    <section className="portfolio-stage" aria-label="DAAT web development portfolio">
      <div className="portfolio-stage-heading"><span className="eyebrow">WEB DEVELOPMENT. LIVE AND IN PROGRESS.</span><Link href="/contact" className="eyebrow">START YOUR WEBSITE ↗</Link></div>
      <div className="portfolio-stage-grid">
        {webProjects.map((project, index) => {
          const className = `portfolio-stage-tile tile-${index + 1}${project.image ? " is-site" : ""}`;
          return project.url
            ? <a key={project.name} href={project.url} target="_blank" rel="noopener noreferrer" className={className} aria-label={`${project.name}, ${project.status === "in-development" ? "in development, preview" : project.domain} (opens in a new tab)`}><TileContent project={project} index={index} /></a>
            : <div key={project.name} className={className} role="img" aria-label={`${project.name}, currently in development`}><TileContent project={project} index={index} /></div>;
        })}
      </div>
    </section>
  );
}
