import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Brand, web, and motion services",
  description: "DAAT offers connected brand identity, web design and development, and motion design for businesses ready to grow.",
  alternates: { canonical: "/services" },
};

export default async function Services() {
  const { services } = await getContent();
  return (
    <section className="section inner-page">
      <div className="page-heading"><span className="eyebrow">DAAT® / CAPABILITIES</span><h1>A brand is more<br />than <span className="blue-text">a first impression.</span></h1><p>We connect how it looks, how it works, and how it moves.<br />One partner. A considered whole.</p><p>Choose a single service or bring the disciplines together. We shape each project around your goals, audience, and practical needs, then agree on the scope and deliverables before work begins.</p></div>
      <div className="service-detail-list">{services.map((service, index) => (
        <article className="service-detail" id={`service-${index + 1}`} key={service.title}>
          <span className="eyebrow">0{index + 1} /</span><div><h2>{service.title}</h2><p>{service.description}</p><div className="tags">{service.items.map((item) => <span key={item}>{item}</span>)}</div><Link className="text-link" href="/contact">Discuss your project <span aria-hidden="true">↗</span></Link></div>
        </article>
      ))}</div>
      {!services.length && <p className="empty-state">Our capabilities are being updated. <Link href="/contact">Discuss your project with us.</Link></p>}
      <p className="about-section-copy">Not sure where to begin? Start with the challenge your business is facing. We can help clarify whether the next step is a stronger identity, a more useful website, or motion that gives your brand a distinctive voice.</p>
      <section className="about-process" aria-labelledby="services-in-practice-heading">
        <div className="section-heading"><div><span className="eyebrow">HOW THE DISCIPLINES CONNECT</span><h2 id="services-in-practice-heading">A system that<br /><span className="muted">works together.</span></h2></div></div>
        <p>Brand identity sets the foundation: the visual language, art direction, and guidelines that help a business show up consistently. Web design and development turn that foundation into a useful digital experience, bringing together page structure, interaction, and the content visitors need to make a decision.</p>
        <p>Motion design adds timing and movement to the same visual system. It can give a mark a distinct introduction, make a digital interaction feel more considered, or help a campaign tell its story. When these services are developed together, each part can share a direction while still doing its own job.</p>
        <p>DAAT can focus on one of these needs or connect several in a single engagement. We shape the work around your audience, business priorities, and existing materials, then define what is included before the project begins.</p>
      </section>
    </section>
  );
}
