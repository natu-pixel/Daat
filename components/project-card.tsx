import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-schema";
import { ProjectArt } from "./project-art";
import { Reveal } from "./reveal";

export function ProjectCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className="project-card">
      <Reveal kind="image"><div className="project-visual">
        {project.cover
          ? <Image src={project.cover.url} alt={project.cover.alt} fill sizes={wide ? "(max-width: 760px) 100vw, 90vw" : "(max-width: 760px) 100vw, 45vw"} />
          : <ProjectArt />}
        <span className="project-open" aria-hidden="true">↗</span>
      </div>
      <div className="project-caption">
        <div><h3>{project.title}</h3><span>{project.category}{project.studioStudy ? " / Studio study" : ""}</span></div>
        <span>{project.year && <>{project.year} </>}<span aria-hidden="true">↗</span></span>
      </div>
      </Reveal>
    </Link>
  );
}
