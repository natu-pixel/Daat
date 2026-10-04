import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { BrandMark } from "@/components/brand";

export const metadata: Metadata = { title: "Studio", alternates: { canonical: "/about" } };

export default async function About() {
  const { settings } = await getContent();
  return (
    <>
      <section className="section inner-page page-heading"><span className="eyebrow">DAAT® / THE STUDIO</span><h1>Perspective<br />changes <span className="blue-text">everything.</span></h1><p>{settings.about}</p></section>
      <section className="about-art"><span className="eyebrow">THINK CLEAR. MAKE BOLD.</span><BrandMark /><span>DAAT®</span></section>
      <section className="section principles"><div><span className="eyebrow">OUR APPROACH</span><h2>Less noise.<br />More meaning.</h2></div><div>
        <article><span>01</span><h3>Start with clarity.</h3><p>Understand the challenge before making the thing. The strongest design starts with the right questions.</p></article>
        <article><span>02</span><h3>Think as a system.</h3><p>Identity, website, and motion should belong to the same world. We design connections, not isolated touchpoints.</p></article>
        <article><span>03</span><h3>Make it matter.</h3><p>Expression and function work together. Make something distinctive, useful, and built to evolve.</p></article>
        <Link href="/services" className="text-link">Explore our capabilities <span aria-hidden="true">↗</span></Link>
      </div></section>
    </>
  );
}
