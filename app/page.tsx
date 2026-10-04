import Link from "next/link";
import { getContent } from "@/lib/content";
import { BrandMark } from "@/components/brand";
import { ProjectCard } from "@/components/project-card";
import { ScrollGallery } from "@/components/scroll-gallery";
import { Reveal } from "@/components/reveal";
import type { Metadata } from "next";
import { PortfolioStage } from "@/components/portfolio-stage";
import { PosterPreview } from "@/components/poster-preview";
import type { Project } from "@/lib/content-schema";
import { HeroHeadline } from "@/components/hero-headline";
import { HeroVideo } from "@/components/hero-video";
import { SectionTransition } from "@/components/section-transition";
import { LogoTicker } from "@/components/logo-ticker";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const { settings, projects, services } = await getContent();
  const studioProject = projects.find((project) => project.studioStudy);
  const clientProjects = projects.filter((project) => !project.studioStudy);
  const posterProject = clientProjects.find((project) => project.galleryLayout === "grid");
  const showcase = clientProjects.flatMap<Project["gallery"][number]>((project) => project.cover ? [{ kind: "image", ...project.cover }] : []).slice(0, 5);
  const hasGallery = showcase.length > 0 || !!studioProject;
  return (
    <div className="homepage">
      <section className="hero hero-video">
        <HeroVideo />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-topline"><span className="eyebrow"><i className="status-dot" /> BRAND. DIGITAL. MOTION.</span></div>
          <div className="hero-headline"><HeroHeadline headline={settings.headline} /></div>
          <div className="hero-bottom"><p>{settings.introduction}</p><Link className="pill-link" href="/work">Explore our work <span aria-hidden="true">↗</span></Link></div>
        </div>
        <a className="scroll-cue" href="#selected-work">SCROLL TO DISCOVER <span aria-hidden="true">↓</span></a>
      </section>
      <section className="hero-interlude" aria-label="From idea to expression">
        <Reveal><div className="interlude-copy"><span className="eyebrow">A CLEAR IDEA IS JUST THE BEGINNING.</span><h2>We don&apos;t just make brands.<br /><span>We make them move.</span></h2><span className="interlude-arrow" aria-hidden="true">↗</span></div></Reveal>
        <LogoTicker projectSlugs={clientProjects.map((project) => project.slug)} />
      </section>
      {clientProjects.some((project) => project.cover) ? <PortfolioStage projects={clientProjects} /> : <section className="brand-stage" aria-label="The DAAT visual world">
        <div className="stage-top"><span>THOUGHT INTO FORM.</span><span>DAAT® / 001</span></div>
        <div className="stage-grid" aria-hidden="true"><div /><div /><div /><div /><div /><div /></div>
        <div className="stage-orbit" aria-hidden="true" />
        <BrandMark className="stage-mark" />
        <div className="stage-note"><span className="stage-dot" /><span>A different perspective.<br />A clearer direction.</span></div>
        <span className="stage-bottom">NOT JUST SEEN. FELT.</span>
      </section>}
      <section className="section selected-work" id="selected-work">
        <Reveal><div className="section-heading"><div><span className="eyebrow">01 / SELECTED WORK</span><h2>Ideas made<br /><span className="muted">unmistakable.</span></h2></div><Link href="/work" className="text-link">All work <span aria-hidden="true">↗</span></Link></div></Reveal>
        <div className="work-grid">{(clientProjects.length ? clientProjects : projects).map((project, index) => <ProjectCard key={project.slug} project={project} wide={index === 0} />)}</div>
        {!projects.length && <p className="empty-state">New work is on its way. <Link href="/contact">Start a conversation.</Link></p>}
      </section>
      {hasGallery && <SectionTransition direction="into-dark" />}
      {showcase.length ? <ScrollGallery media={showcase} heading={"Our work.\nIn full color."} credit="Selected DAAT projects" /> : studioProject && <ScrollGallery media={studioProject.gallery} studioStudy={studioProject.gallery.length === 0} />}
      {hasGallery && <SectionTransition direction="into-light" />}
      {posterProject && <PosterPreview project={posterProject} />}
      <section className="studio-intro section">
        <span className="eyebrow">02 / THE WAY WE THINK</span>
        <Reveal><h2>Different disciplines.<br />One clear direction.</h2><p>{settings.about}</p><Link href="/about" className="text-link">Meet the studio <span aria-hidden="true">↗</span></Link></Reveal>
      </section>
      <section className="services-section section">
        <Reveal><div className="section-heading"><div><span className="eyebrow">03 / WHAT WE DO</span><h2>Built to connect.</h2></div><p>From the first idea<br />to the final interaction.</p></div></Reveal>
        <div className="service-list">{services.map((service, index) => (
          <Link href={`/services#service-${index + 1}`} key={service.title} className="service-row"><span className="service-number">0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p><span className="service-arrow" aria-hidden="true">↗</span></Link>
        ))}</div>
      </section>
      <div className="brand-strip" aria-hidden="true"><span>Clear thinking.</span><span>↗</span><span>Bold expression.</span><span>↗</span></div>
    </div>
  );
}
