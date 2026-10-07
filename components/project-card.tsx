import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-schema";
import { ProjectArt } from "./project-art";
import { Reveal } from "./reveal";

const workTags: Record<Project["category"], string> = {
  "Brand identity": "Branding",
  "Web development": "Web development",
  "Motion design": "Motion",
  "Campaign design": "Campaign",
};

export function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className="project-card">
      <Reveal kind="image"><div className="project-visual">
        {project.cover
          ? <Image src={project.cover.url} alt={project.cover.alt} fill sizes={wide ? "(max-width: 760px) 100vw, 90vw" : "(max-width: 760px) 100vw, 45vw"} />
          : <ProjectArt />}
        <span className="project-tag">{workTags[project.category]}</span>
        <span className="project-open" aria-hidden="true">↗</span>
        <div className="project-info">
          <h3>{project.title}</h3>
          <span className="project-info-type">{project.category}{project.studioStudy ? " / Studio study" : ""}{project.year && <> · {project.year}</>}</span>
          <div className="project-description"><p>{project.description}</p></div>
        </div>
      </div>
      </Reveal>
    </Link>
  );
}
