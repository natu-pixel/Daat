import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Services", alternates: { canonical: "/services" } };

export default async function Services() {
  const { services } = await getContent();
  return (
    <section className="section inner-page">
      <div className="page-heading"><span className="eyebrow">DAAT® / CAPABILITIES</span><h1>A brand is more<br />than <span className="blue-text">a first impression.</span></h1><p>We connect how it looks, how it works, and how it moves.<br />One partner. A considered whole.</p></div>
      <div className="service-detail-list">{services.map((service, index) => (
        <article className="service-detail" id={`service-${index + 1}`} key={service.title}>
          <span className="eyebrow">0{index + 1} /</span><div><h2>{service.title}</h2><p>{service.description}</p><div className="tags">{service.items.map((item) => <span key={item}>{item}</span>)}</div><Link className="text-link" href="/contact">Discuss your project <span aria-hidden="true">↗</span></Link></div>
        </article>
      ))}</div>
      {!services.length && <p className="empty-state">Our capabilities are being updated. <Link href="/contact">Discuss your project with us.</Link></p>}
    </section>
  );
}
