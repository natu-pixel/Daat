"use client";

import Link from "next/link";
import { Wordmark } from "./brand";
import { FooterFlow } from "./footer-flow";
import { FooterParticleText } from "./footer-particle-text";
import { useDecorativeMotion } from "@/lib/use-decorative-motion";

export function Footer() {
  const motion = useDecorativeMotion();
  return (
    <footer className="footer">
      <FooterFlow motion={motion} />
      <div className="footer-conversation"><Link href="/" aria-label="DAAT home"><Wordmark /></Link><Link href="/contact" className="text-link">Start a project <span aria-hidden="true">↗</span></Link></div>
      <div className="footer-bottom">
        <span>Brand. Digital. Motion.</span>
        <div><Link href="/privacy">Privacy</Link><span>© {new Date().getFullYear()} DAAT</span></div>
      </div>
      <div className="footer-invite">
        <FooterParticleText enabled={motion.enabled} />
        <nav className="footer-socials" aria-label="Social media">
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.4H2V22h3.2V8.4ZM3.6 2A1.9 1.9 0 1 0 3.6 5.8 1.9 1.9 0 0 0 3.6 2ZM22 14.2c0-4.1-2.2-6-5.1-6-2.4 0-3.5 1.3-4.1 2.2V8.4H9.6V22h3.2v-6.7c0-1.8.3-3.6 2.6-3.6s2.3 2.1 2.3 3.7V22H22v-7.8Z" /></svg>
          </a>
          <a href="https://x.com/Daat_tech" target="_blank" rel="noreferrer" aria-label="X">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.4 4.8a9.4 9.4 0 0 1-2.7.7 4.7 4.7 0 0 0 2.1-2.6 9.4 9.4 0 0 1-3 1.1 4.7 4.7 0 0 0-8 4.3A13.4 13.4 0 0 1 2.1 3.4a4.7 4.7 0 0 0 1.5 6.3 4.7 4.7 0 0 1-2.1-.6v.1a4.7 4.7 0 0 0 3.8 4.6 4.7 4.7 0 0 1-2.1.1 4.7 4.7 0 0 0 4.4 3.3A9.4 9.4 0 0 1 0 19.2a13.3 13.3 0 0 0 7.2 2.1c8.7 0 13.5-7.2 13.5-13.5v-.6a9.6 9.6 0 0 0 2.7-2.4Z" /></svg>
          </a>
          <a href="https://www.instagram.com/daat_tech/" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-icon-dot" cx="17.5" cy="6.8" r="1" /></svg>
          </a>
          <a href="https://www.facebook.com/share/1BkykyffJJ/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" /></svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
