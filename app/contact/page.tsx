import type { Metadata } from "next";
import { BrandMark } from "@/components/brand";
import { ContactForm } from "@/components/contact-form";
import { ContactPhone } from "@/components/contact-phone";

export const metadata: Metadata = { title: "Let's talk", alternates: { canonical: "/contact" } };

export default function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-card">
        <div className="contact-phone-panel">
          <div className="contact-phone-top"><BrandMark className="contact-panel-mark" /><span className="eyebrow"><i className="status-dot" /> LINE OPEN</span></div>
          <div className="contact-phone-tile"><ContactPhone /></div>
          <div className="contact-phone-bottom"><span className="eyebrow">YOUR NEXT IDEA STARTS HERE.</span><p>Pick up the line.<br />We&apos;ll take it from there.</p></div>
        </div>
        <div className="contact-card-form">
          <BrandMark className="contact-form-mark" />
          <div className="page-heading"><h1>Let&apos;s start a conversation.</h1><p>A brand, a website, or something in motion. Tell us what you&apos;re building and we&apos;ll get back to you.</p></div>
          <ContactForm />
          <div className="contact-note">Please don&apos;t include sensitive personal information or confidential documents in your initial inquiry.</div>
        </div>
      </div>
    </section>
  );
}
