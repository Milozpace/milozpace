import Link from "next/link";
import { ThemeChoices } from "./theme-toggle";

export function SiteFooter() {
  return (
    <footer className="confirmed-footer confirmed-footer--innei" data-footer-variant="footer-innei-soft-bridge">
      <div className="confirmed-footer-inner">
        <section className="confirmed-footer-identity" aria-label="站点落款">
          <Link prefetch={false} href="/">miloz</Link>
          <p>Let everything pass through you.</p>
        </section>
        <nav aria-label="页脚链接" className="confirmed-footer-links">
          <p className="confirmed-footer-mobile-title">链接</p>
        </nav>
        <div className="confirmed-footer-tools">
          <small>© 2026 miloz</small>
          <ThemeChoices />
        </div>
      </div>
    </footer>
  );
}

