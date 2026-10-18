import type { Metadata } from "next";
import { BrandMark } from "@/components/brand";
import { ContactForm } from "@/components/contact-form";
import { ContactPhone } from "@/components/contact-phone";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Contact DAAT to discuss a brand identity, website, or motion design project. Share your goals and we’ll be in touch.",
  alternates: { canonical: "/contact" },
};

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
      <section className="section about-process" aria-labelledby="contact-guide-heading">
        <div className="section-heading"><div><span className="eyebrow">A GOOD PLACE TO START</span><h2 id="contact-guide-heading">Tell us what<br />you&apos;re working on.</h2></div></div>
        <p>A useful first message can be brief. Tell us what your business does, who you want to reach, and what prompted you to get in touch. If you already have a timeline or a particular service in mind, include that too.</p>
        <p>You do not need a finished brief or a complete plan. We can begin with the challenge, talk through possible directions, and work out whether brand identity, a website, motion design, or a combination of services best fits the project.</p>
        <p>After we understand the goal, we can discuss the scope, priorities, and deliverables before work begins. Use the form above to share your inquiry and the studio will respond using the contact details you provide.</p>
      </section>
    </section>
  );
}
