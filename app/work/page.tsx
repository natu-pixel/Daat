import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { WorkGrid } from "@/components/work-grid";

export const metadata: Metadata = { title: "Work", alternates: { canonical: "/work" } };

export default async function Work() {
  const { projects } = await getContent();
  return (
    <section className="section inner-page">
      <div className="page-heading"><span className="eyebrow">DAAT® / OUR WORK</span><h1>Thought.<br /><span className="blue-text">Made tangible.</span></h1><p>Identity, digital, and motion.<br />Different expressions. The same attention to detail.</p></div>
      <WorkGrid projects={projects} />
    </section>
  );
}
