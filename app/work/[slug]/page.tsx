import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { ProjectArt } from "@/components/project-art";
import { ScrollGallery } from "@/components/scroll-gallery";
import { MasonryGallery } from "@/components/masonry-gallery";
import { SectionTransition } from "@/components/section-transition";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getContent();
  const project = projects.find((item) => item.slug === slug);
  return { title: project?.title || "Project not found", description: project?.description, alternates: { canonical: `/work/${slug}` } };
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const { projects } = await getContent();
  const index = projects.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const hasDarkGallery = project.gallery.length > 0 ? project.galleryLayout !== "grid" : project.studioStudy;
  return (
    <article className="case-study">
      <header className="section page-heading">
        <Link href="/work" className="eyebrow text-link">← ALL WORK</Link>
        <h1>{project.title}</h1><p>{project.description}</p>
        <div className="case-meta"><span>{project.category}</span>{project.year && <span>{project.year}</span>}{project.studioStudy && <span>Studio study / Our own identity</span>}</div>
      </header>
      <div className="case-cover">{project.cover ? <Image src={project.cover.url} alt={project.cover.alt} fill sizes="100vw" priority /> : <ProjectArt />}</div>
      {project.challenge && <div className="section case-copy"><span className="eyebrow">THE CHALLENGE</span><h2>{project.challenge}</h2></div>}
      {(project.approach || project.deliverables.length > 0) && <div className="section case-copy"><span className="eyebrow">{project.challenge ? "THE APPROACH" : "THE VISUAL WORLD"}</span><div>{project.approach && <p>{project.approach}</p>}<div className="tags">{project.deliverables.map((item) => <span key={item}>{item}</span>)}</div></div></div>}
      {project.gallery.length > 0 ? project.galleryLayout === "grid" ? <section className="section poster-collection" aria-label={`${project.title} artwork`}><MasonryGallery media={project.gallery} /></section> : <ScrollGallery media={project.gallery} heading={`${project.title}.\nIn detail.`} credit={project.title} /> : project.studioStudy ? <ScrollGallery studioStudy /> : null}
      {hasDarkGallery && <SectionTransition direction="into-light" />}
      {project.outcome && <div className="section case-copy"><span className="eyebrow">03 / THE OUTCOME</span><p>{project.outcome}</p></div>}
      <div className="section case-next"><Link className="text-link" href={next ? `/work/${next.slug}` : "/work"}>{next ? `Next: ${next.title}` : "Back to all work"} <span aria-hidden="true">↗</span></Link></div>
    </article>
  );
}
