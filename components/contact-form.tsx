"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contactSchema } from "@/lib/contact-validation";

type State = { status: "idle" | "sending" | "success" | "error"; message: string };

export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle", message: "" });
  const [mode, setMode] = useState<"inquiry" | "video">("inquiry");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlots, setBookingSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState("");

  useEffect(() => {
    if (mode !== "video" || !bookingDate) {
      setBookingSlots([]);
      setSlotsMessage("");
      return;
    }
    const controller = new AbortController();
    setSlotsLoading(true);
    setBookingSlots([]);
    setSlotsMessage("");
    fetch(`/api/booking/availability?date=${encodeURIComponent(bookingDate)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error(typeof result.message === "string" ? result.message : "We couldn't load times for this date.");
        setBookingSlots(Array.isArray(result.slots) ? result.slots.filter((slot: unknown): slot is string => typeof slot === "string") : []);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSlotsMessage(error instanceof Error ? error.message : "We couldn't load available times.");
      })
      .finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [mode, bookingDate]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    let endpoint = "/api/contact";
    let payload: unknown;
    if (mode === "video") {
      endpoint = "/api/booking";
      payload = {
        name: data.get("name"), email: data.get("email"), date: data.get("meetingDate"),
        time: data.get("meetingTime"), website: data.get("website"), consent: data.get("consent") === "on",
      };
    } else {
      const parsed = contactSchema.safeParse({
        name: data.get("name"), email: data.get("email"), service: data.get("service"), message: data.get("message"),
        meetingDate: "", meetingTime: "", website: data.get("website"), consent: data.get("consent") === "on",
      });
      if (!parsed.success) {
        setState({ status: "error", message: parsed.error.issues[0].message });
        return;
      }
      payload = parsed.data;
    }
    setState({ status: "sending", message: "" });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      if (mode === "video") {
        setBookingDate("");
        setBookingSlots([]);
      }
    } catch (error) {
      console.error("Contact form submission failed:", error instanceof Error ? error.name : "UnknownError");
      setState({ status: "error", message: "We couldn't complete your submission. Please check your connection and try again." });
    }
  }
  return (
    <form id="contact-form" className="contact-form" onSubmit={submit}>
      <div className="contact-mode-switch" role="group" aria-label="Choose how to contact DAAT">
        <button type="button" className={mode === "inquiry" ? "is-active" : ""} aria-pressed={mode === "inquiry"} onClick={() => { setMode("inquiry"); setState({ status: "idle", message: "" }); }}>Project inquiry</button>
        <button type="button" className={mode === "video" ? "is-active" : ""} aria-pressed={mode === "video"} onClick={() => { setMode("video"); setState({ status: "idle", message: "" }); }}>Book a video call</button>
      </div>
      <div className="form-field"><label htmlFor="name">Your name *</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="How should we call you?" /></div>
      <div className="form-field"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /></div>
      {mode === "inquiry" ? <>
        <div className="form-field"><label htmlFor="service">What are you thinking about?</label><select id="service" name="service" defaultValue="Not sure yet"><option>Not sure yet</option><option>Brand identity</option><option>Web development</option><option>Motion design</option></select></div>
        <div className="form-field"><label htmlFor="message">A little about your project *</label><textarea id="message" name="message" required minLength={20} maxLength={4000} rows={4} placeholder="Your idea, your challenge, where you'd like to go…" /></div>
      </> : <>
        <p className="video-call-intro">Choose an available weekday and time. Your calendar invitation will include the Google Meet link.</p>
        <div className="form-field"><label htmlFor="meetingDate">Preferred date *</label><input id="meetingDate" name="meetingDate" type="date" required min={new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())} value={bookingDate} onChange={(event) => { setBookingDate(event.target.value); setState({ status: "idle", message: "" }); }} /></div>
        <div className="form-field"><label htmlFor="meetingTime">Available time (East Africa Time) *</label><select id="meetingTime" name="meetingTime" required defaultValue="" disabled={!bookingDate || slotsLoading || bookingSlots.length === 0}><option value="">{!bookingDate ? "Choose a date first" : slotsLoading ? "Loading available times…" : bookingSlots.length ? "Choose a time" : "No times available"}</option>{bookingSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></div>
        {slotsMessage && <p className="booking-slots-message" role="status">{slotsMessage}</p>}
      </>}
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="consent"><input type="checkbox" name="consent" required /><span>I agree that DAAT can use these details to respond to my inquiry, as described in the <Link href="/privacy">privacy notice</Link>.</span></label>
      <button className="pill-link" type="submit" disabled={state.status === "sending"}>{state.status === "sending" ? "Sending…" : mode === "video" ? "Request a video call" : "Start the conversation"}<span aria-hidden="true">↗</span></button>
      <div aria-live="polite" aria-atomic="true">{state.message && <p role={state.status === "error" ? "alert" : "status"} className={`form-message ${state.status === "error" ? "is-error" : ""}`}>{state.message}</p>}</div>
    </form>
  );
}
