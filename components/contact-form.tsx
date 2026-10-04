"use client";

import Link from "next/link";
import { useState } from "react";
import { contactSchema } from "@/lib/contact-validation";

type State = { status: "idle" | "sending" | "success" | "error"; message: string };

export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle", message: "" });
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = contactSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      service: data.get("service"),
      message: data.get("message"),
      website: data.get("website"),
      consent: data.get("consent") === "on",
    });
    if (!parsed.success) {
      setState({ status: "error", message: parsed.error.issues[0].message });
      return;
    }
    setState({ status: "sending", message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result: unknown = await response.json();
      if (typeof result !== "object" || result === null || !("message" in result) || typeof result.message !== "string" || !("ok" in result)) {
        throw new Error("Unexpected contact endpoint response.");
      }
      if (!response.ok || result.ok !== true) {
        setState({ status: "error", message: result.message });
        return;
      }
      setState({ status: "success", message: result.message });
      form.reset();
    } catch (error) {
      console.error("Inquiry submission failed:", error instanceof Error ? error.name : "UnknownError");
      setState({ status: "error", message: "We couldn't complete your submission. Please check your connection and try again." });
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-field"><label htmlFor="name">Your name *</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="How should we call you?" /></div>
      <div className="form-field"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></div>
      <div className="form-field"><label htmlFor="service">What are you thinking about?</label><select id="service" name="service" defaultValue="Not sure yet"><option>Not sure yet</option><option>Brand identity</option><option>Web development</option><option>Motion design</option></select></div>
      <div className="form-field"><label htmlFor="message">A little about your project *</label><textarea id="message" name="message" required minLength={20} maxLength={4000} rows={4} placeholder="Your idea, your challenge, where you'd like to go…" /></div>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="consent"><input type="checkbox" name="consent" required /><span>I agree that DAAT can use these details to respond to my inquiry, as described in the <Link href="/privacy">privacy notice</Link>.</span></label>
      <button className="pill-link" type="submit" disabled={state.status === "sending"}>{state.status === "sending" ? "Sending your inquiry…" : "Start the conversation"}<span aria-hidden="true">↗</span></button>
      <div aria-live="polite" aria-atomic="true">{state.message && <p role={state.status === "error" ? "alert" : "status"} className={`form-message ${state.status === "error" ? "is-error" : ""}`}>{state.message}</p>}</div>
    </form>
  );
}
