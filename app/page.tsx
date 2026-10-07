import Link from "next/link";
import { getContent } from "@/lib/content";
import { ProjectCard } from "@/components/project-card";
import { ScrollGallery } from "@/components/scroll-gallery";
import { Reveal } from "@/components/reveal";
import type { Metadata } from "next";
import { PortfolioStage } from "@/components/portfolio-stage";
import { PosterPreview } from "@/components/poster-preview";
import type { Project } from "@/lib/content-schema";
import { HeroHeadline } from "@/components/hero-headline";
import { BuildingHero } from "@/components/building-hero";
import { SectionTransition } from "@/components/section-transition";
import { LogoTicker } from "@/components/logo-ticker";
import { CountUp } from "@/components/count-up";

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
      <section className="hero hero-building">
        <BuildingHero slides={clientProjects.flatMap((project) => project.cover ? [project.cover] : [])} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-headline"><HeroHeadline headline={settings.headline} /></div>
          <Link className="pill-link" href="/work">Explore our work <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className="hero-interlude" aria-label="What DAAT does">
        <div className="intro-statement">
          <span className="intro-badge">DAAT™</span>
          <div className="intro-copy">
            <Reveal><h2><span data-sweep>We help ambitious businesses build brands that look credible, communicate clearly, and win clients before the first meeting.</span></h2></Reveal>
            <div className="intro-detail">
              <p>DAAT helps B2B companies build brands that look clear, credible, and ready for growth.</p>
              <Link href="/contact" className="intro-link">Let&apos;s collaborate <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
        <dl className="impact-stats" aria-label="Studio impact">
          <div><dt>Projects delivered for growing businesses.</dt><dd><CountUp value={50} suffix="+" /></dd></div>
          <div><dt>Companies supported through brand transformation.</dt><dd><CountUp value={10} suffix="+" /></dd></div>
          <div><dt>In combined client business value.</dt><dd><CountUp value={10} prefix="$" suffix="k+" /></dd></div>
        </dl>
        <div className="impact-partners">
          <p>We&apos;re partnered with.</p>
          <div className="impact-partners-box"><LogoTicker projectSlugs={clientProjects.map((project) => project.slug)} /></div>
        </div>
      </section>
      <PortfolioStage />
      <section className="section selected-work" id="selected-work">
        <Reveal><div className="section-heading"><div><span className="eyebrow">01 / SELECTED WORK</span><h2><span className="text-gradient" data-sweep>Ideas made</span><br /><span className="text-gradient text-gradient-light" data-sweep>unmistakable.</span></h2></div><Link href="/work" className="see-all-link">See all of our works <span aria-hidden="true">→</span></Link></div></Reveal>
        <div className="work-grid">{(clientProjects.length ? clientProjects : projects).map((project, index) => <ProjectCard key={project.slug} project={project} wide={index === 0} />)}</div>
        {!projects.length && <p className="empty-state">New work is on its way. <Link href="/contact">Start a conversation.</Link></p>}
      </section>
      {hasGallery && <SectionTransition direction="into-dark" />}
      {showcase.length ? <ScrollGallery media={showcase} heading={"Our work.\nIn full color."} credit="Selected DAAT projects" /> : studioProject && <ScrollGallery media={studioProject.gallery} studioStudy={studioProject.gallery.length === 0} />}
      {hasGallery && <SectionTransition direction="into-light" />}
      {posterProject && <PosterPreview project={posterProject} />}
      <div className="services-split">
        <div className="services-media" aria-hidden="true" />
        <div className="services-content">
          <Reveal><div className="services-intro">
            <span className="eyebrow"><i className="status-dot" /> Our Work</span>
            <p><span data-sweep>Every project starts with a clear problem. We define the direction, build the system, and make sure the final result works beyond the screen.</span></p>
          </div></Reveal>
          <section className="services-section section">
            <Reveal><div className="section-heading"><div><span className="eyebrow">02 / WHAT WE DO</span><h2><span data-sweep>Built to connect.</span></h2></div><p>From the first idea<br />to the final interaction.</p></div></Reveal>
            <div className="service-list">{services.map((service, index) => (
              <Link href={`/services#service-${index + 1}`} key={service.title} className="service-row"><span className="service-number">0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p><span className="service-arrow" aria-hidden="true">↗</span></Link>
            ))}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
