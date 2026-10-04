import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Let's talk", alternates: { canonical: "/contact" } };

export default function Contact() {
  return (
    <section className="section inner-page contact-layout">
      <div className="page-heading"><span className="eyebrow">DAAT® / START SOMETHING</span><h1>Good things<br />start with<br /><span className="blue-text">a conversation.</span></h1><p>A new identity, a digital experience, or an idea that hasn&apos;t found its shape yet. Tell us what&apos;s on your mind.</p><div className="contact-note">Share a little context. Please don&apos;t include sensitive personal information or confidential documents in your initial inquiry.</div></div>
      <ContactForm />
    </section>
  );
}
