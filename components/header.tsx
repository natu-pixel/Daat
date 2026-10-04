"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./brand";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "Studio" },
  { href: "/services", label: "Services" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  return (
    <header className="header">
      <Link href="/" className="brand-link" aria-label="DAAT home" onClick={() => setOpen(false)}><Wordmark /></Link>
      <span className="header-descriptor">Independent thinking.<br />Connected design.</span>
      <button ref={button} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
        {open ? "Close −" : "Menu +"}
      </button>
      <nav id="main-navigation" className={`navigation ${open ? "is-open" : ""}`} aria-label="Main navigation">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>
        ))}
        <Link href="/contact" className="nav-contact" aria-current={pathname === "/contact" ? "page" : undefined} onClick={() => setOpen(false)}>
          Let&apos;s talk <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
