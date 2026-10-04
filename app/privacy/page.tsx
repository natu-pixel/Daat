import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return <section className="section inner-page"><div className="page-heading"><span className="eyebrow">DAAT® / PRIVACY</span><h1>Your details.<br /><span className="blue-text">Handled thoughtfully.</span></h1></div><div className="privacy-copy">
    <h2>Project inquiries</h2><p>The contact form asks for your name, email, service interest, and project brief so the studio can respond to your inquiry. Do not send sensitive personal information. Submitting the form is not a newsletter subscription.</p>
    <h2>Delivery and abuse prevention</h2><p>When email delivery is configured, inquiries are sent through Resend to the studio&apos;s configured inbox. Rate limiting uses Upstash Redis and a network identifier to help prevent abuse. These providers may process technical request data according to their own policies. Inquiries are not saved in the website&apos;s CMS.</p>
    <h2>Cookies and analytics</h2><p>This website does not include advertising or analytics trackers. Authenticated editorial previews use a temporary preview cookie. Hosting providers may maintain operational request logs.</p>
    <h2>Questions about your information</h2><p>Use the <Link className="text-link" href="/contact">contact form</Link> to request a correction or deletion of your inquiry. The studio&apos;s inbox and provider retention settings determine how long correspondence is retained.</p>
  </div></section>;
}
