"use client";

import { useState } from "react";
import type { Project } from "@/lib/content-schema";
import { ProjectCard } from "./project-card";

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("All work");
  const categories = ["All work", ...new Set(projects.map((p) => p.category))];
  const visible = filter === "All work" ? projects : projects.filter((p) => p.category === filter);
  return (
    <div>
      {categories.length > 2 && <div className="filters" aria-label="Filter projects">{categories.map((category) => (
        <button key={category} onClick={() => setFilter(category)} aria-pressed={filter === category}>{category}</button>
      ))}</div>}
      <div className="work-grid">{visible.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
      {!visible.length && <p className="empty-state">New work is on its way. <a href="/contact">Talk to us about your project.</a></p>}
    </div>
  );
}
