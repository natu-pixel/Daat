import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { BrandMark } from "@/components/brand";

export const metadata: Metadata = {
  title: "Studio",
  description: "Get to know DAAT: brand identity, web development, and motion design, with clear service lists and a practical guide to working together.",
  alternates: { canonical: "/about" },
};

export default async function About() {
  const { settings, services } = await getContent();
  return (
    <>
      <section className="section inner-page page-heading about-heading"><span className="eyebrow">DAAT® / THE STUDIO</span><h1>Perspective<br />changes <span className="blue-text">everything.</span></h1><p>{settings.about}</p><p className="about-plain-language">In practical terms: we help businesses build a recognizable identity, turn it into a usable website, and bring it to life through motion. Here&apos;s what that can look like for your project.</p></section>
      <section className="section about-capabilities" aria-labelledby="about-capabilities-heading">
        <div className="section-heading"><div><span className="eyebrow">01 / WHAT WE PROVIDE</span><h2 id="about-capabilities-heading">Creative work.<br /><span className="muted">Clear deliverables.</span></h2></div><Link href="/work" className="text-link">See it in practice <span aria-hidden="true">↗</span></Link></div>
        <p className="about-section-copy">You can come to us for one discipline or a connected brand, website, and motion project. These lists describe our capabilities, not a fixed package: we agree what&apos;s included before the work begins.</p>
        <div className="about-service-grid">{services.map((service, index) => (
          <article className="about-service-card" key={service.title}>
            <span className="eyebrow">{String(index + 1).padStart(2, "0")} /</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <h4>What this can include</h4>
            {service.items.length ? <ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="empty-state">The deliverables for this service are being updated. Contact us to discuss the scope.</p>}
            <Link href={`/services#service-${index + 1}`} className="text-link">Explore this service <span aria-hidden="true">↗</span></Link>
          </article>
        ))}</div>
        {!services.length && <p className="empty-state">Our capabilities are being updated. <Link href="/contact">Discuss your project with us.</Link></p>}
      </section>
      <section className="section about-fit" aria-labelledby="about-fit-heading">
        <div><span className="eyebrow">02 / WHERE WE CAN HELP</span><h2 id="about-fit-heading">A starting point.<br />Not just a style.</h2><p>You don&apos;t need a finished brief to get in touch. Start with the problem you&apos;re trying to solve.</p></div>
        <ul>
          <li><h3>You&apos;re launching something new.</h3><p>Establish the visual identity and digital presence that introduce your business.</p></li>
          <li><h3>Your brand no longer fits.</h3><p>Bring the way you look and communicate closer to the business you are today.</p></li>
          <li><h3>Your website needs a clearer direction.</h3><p>Connect the design, user experience, and development instead of treating them separately.</p></li>
          <li><h3>You want your brand to move.</h3><p>Extend your identity into animation and digital interactions without losing its character.</p></li>
        </ul>
      </section>
      <section className="about-art about-studio-art" aria-label="The DAAT visual identity"><span className="eyebrow">THINK CLEAR. MAKE BOLD.</span><BrandMark /><span>DAAT®</span></section>
      <section className="section about-process" aria-labelledby="about-process-heading">
        <div className="section-heading"><div><span className="eyebrow">03 / HOW WE WORK TOGETHER</span><h2 id="about-process-heading">From the first question<br /><span className="muted">to a clear handover.</span></h2></div></div>
        <ol>
          <li><h3>Understand the brief.</h3><p>Talk through your business, audience, goals, and what isn&apos;t working. Share the context before jumping to a visual solution.</p></li>
          <li><h3>Agree the scope.</h3><p>Define the deliverables, priorities, timeline, and project requirements. What you receive depends on the work we agree together.</p></li>
          <li><h3>Design, build, and refine.</h3><p>Develop the direction and review the work together. Feedback helps connect the visual choices to the original brief.</p></li>
          <li><h3>Prepare the handover.</h3><p>Bring together the agreed assets, website, or motion work with the guidance included in your scope, so you know what you&apos;re receiving.</p></li>
        </ol>
        <div className="about-next-step"><p>Tell us what you need. We&apos;ll start by working out the right scope, not by assuming you need everything.</p><Link href="/contact" className="pill-link">Discuss your project <span aria-hidden="true">↗</span></Link></div>
      </section>
    </>
  );
}
