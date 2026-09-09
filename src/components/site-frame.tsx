"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ConfirmedAmbient } from "./confirmed-ambient";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const notesIndex = pathname === "/notes" || pathname === "/notes/";
  const reader = /^\/notes\/[^/]+\/?$/.test(pathname);
  const says = pathname === "/says" || pathname === "/says/";

  if (home) {
    return <>
      <ConfirmedAmbient />
      <SiteHeader variant="home" />
      <main className="home-refined-v3" data-home-layout="home-narrative-refined-v3">{children}</main>
      <SiteFooter />
    </>;
  }

  const mainClassName = notesIndex
    ? "notes-compact-main"
    : reader
      ? "note-reading-layout"
      : "confirmed-main";

  return <div
    className={`confirmed-site${reader ? " note-reading-site" : ""}`}
    data-homepage-version="1.3.1-public"
    data-nav-variant="innei-boku"
    data-notes-variant={notesIndex ? "notes-compact-innei" : undefined}
    data-note-reading-template={reader ? "paper-system" : undefined}
    data-note-reading-refinement={reader ? "v9" : undefined}
    data-note-timeline-variant={reader ? "theme-responsive" : undefined}
    data-note-timeline-theme={reader ? "light" : undefined}
    data-palette="cloud-breath"
    data-says-animation={says ? "io-motion-spring" : undefined}
    data-says-variant={says ? "says-grid-sorted" : undefined}
    data-testid="theme-preview"
  >
    <ConfirmedAmbient />
    <SiteHeader />
    {reader && <div className="note-reading-edge-progress" aria-hidden="true"><span /></div>}
    <main className={mainClassName}>{children}</main>
    {!says && <SiteFooter />}
  </div>;
}
