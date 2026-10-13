"use client";

import { useEffect } from "react";

export function DtCursor() {
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(hover: none)").matches) {
      return;
    }

    const cursor = document.createElement("div");
    cursor.id = "dt-cursor";
    cursor.className = "dt-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = `
      <div class="inner">
        <svg class="ring" viewBox="0 0 160 160"><circle cx="80" cy="80" r="76" pathLength="120"/></svg>
        <svg class="arrow" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </div>
    `;
    document.body.appendChild(cursor);

    const EASE = 0.16;
    let mx = -200;
    let my = -200;
    let cx = -200;
    let cy = -200;
    let frame = 0;

    const targets = document.querySelectorAll<HTMLElement>("[data-cursor]");
    if (targets.length === 0) {
      cursor.remove();
      return;
    }

    const show = (e: MouseEvent) => {
      if (!cursor.classList.contains("on")) {
        cx = e.clientX;
        cy = e.clientY;
      }
      cursor.classList.add("on");
    };
    const hide = () => cursor.classList.remove("on");

    targets.forEach((el) => {
      el.style.cursor = "none";
      el.addEventListener("mouseenter", show);
      el.addEventListener("mouseleave", hide);
    });

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const loop = () => {
      cx += (mx - cx) * EASE;
      cy += (my - cy) * EASE;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", show);
        el.removeEventListener("mouseleave", hide);
        el.style.removeProperty("cursor");
      });
      if (frame) cancelAnimationFrame(frame);
      cursor.remove();
    };
  }, []);

  return null;
}