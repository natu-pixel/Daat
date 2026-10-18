import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { WorkGrid } from "@/components/work-grid";

export const metadata: Metadata = {
  title: "Selected work",
  description: "Explore DAAT’s brand identity, website, campaign, and motion design projects for growing businesses.",
  alternates: { canonical: "/work" },
};

export default async function Work() {
  const { projects } = await getContent();
  return (
    <section className="section inner-page">
      <div className="page-heading"><span className="eyebrow">DAAT® / OUR WORK</span><h1>Thought.<br /><span className="blue-text">Made tangible.</span></h1><p>Identity, digital, and motion.<br />Different expressions. The same attention to detail.</p><p>Browse selected brand identities, digital experiences, and campaign work. Each project brings a clear visual direction into the places people meet a business, from screens and social graphics to print and physical spaces.</p></div>
      <WorkGrid projects={projects} />
      <section className="section about-process" aria-labelledby="work-context-heading">
        <div className="section-heading"><div><span className="eyebrow">HOW TO READ THE WORK</span><h2 id="work-context-heading">One point of view.<br /><span className="muted">Many applications.</span></h2></div></div>
        <p>A brand is experienced in more than a logo. The projects here show visual identities applied across digital interfaces, campaign graphics, packaging, apparel, signage, and presentation materials. Seeing the system in context helps explain how its colors, marks, typography, and imagery work together.</p>
        <p>Some entries focus on a complete identity system, while others bring together a collection of campaign pieces. The project pages describe the visual direction and show selected applications. They represent the work shown here; contact the studio if you need details about a particular scope or a new project.</p>
      </section>
    </section>
  );
}
