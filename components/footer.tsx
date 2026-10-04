import Link from "next/link";
import { Wordmark } from "./brand";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-invite">
        <div><span className="eyebrow">A good conversation changes things.</span><h2>What&apos;s<br />your next move?</h2></div>
        <Link href="/contact" className="round-cta" aria-label="Start a project with DAAT">↗</Link>
      </div>
      <div className="footer-bottom">
        <Link href="/" aria-label="DAAT home"><Wordmark /></Link>
        <span>Brand. Digital. Motion.</span>
        <div><Link href="/privacy">Privacy</Link><span>© {new Date().getFullYear()} DAAT</span></div>
      </div>
    </footer>
  );
}
