import Link from "next/link";
import type { Project } from "@/lib/content-schema";
import { PosterWall } from "./poster-wall";
import { Reveal } from "./reveal";

export function PosterPreview({ project }: { project: Project }) {
  const posters = project.gallery.filter((asset): asset is Extract<typeof asset, { kind: "image" }> => asset.kind === "image");
  return <section className="section poster-preview">
    <Reveal><div className="positioning-heading">
      <div>
        <h2><span className="text-gradient positioning-gradient" data-sweep>We don&apos;t just help your business look better; we position it to be understood, trusted, and chosen by the right people.</span></h2>
        <Link href="/work" className="impact-link gradient-link">See more of our works <span aria-hidden="true">→</span></Link>
      </div>
      <Link href="/contact" className="positioning-cta gradient-link">LET&apos;S BUILD SOMETHING CLEAR</Link>
    </div></Reveal>
    <PosterWall posters={posters} href={`/work/${project.slug}`} />
  </section>;
}
