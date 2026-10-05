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
      <div className="footer-conversation"><span className="eyebrow">A good conversation changes things.</span><Link href="/contact" className="text-link">Start a project <span aria-hidden="true">↗</span></Link></div>
      <div className="footer-bottom">
        <Link href="/" aria-label="DAAT home"><Wordmark /></Link>
        <span>Brand. Digital. Motion.</span>
        <div><Link href="/privacy">Privacy</Link><span>© {new Date().getFullYear()} DAAT</span></div>
      </div>
      <div className="footer-invite">
        <FooterParticleText enabled={motion.enabled} />
        <Link href="/contact" className="round-cta" aria-label="Start a project with DAAT">↗</Link>
      </div>
    </footer>
  );
}
