"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

function active(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function HomeIcon({ preview = false }: { preview?: boolean }) {
  if (preview) return <svg aria-hidden="true" className="preview-home-icon" viewBox="0 0 24 24"><path d="M3.5 10.5 12 3l8.5 7.5" /><path d="M5.5 9.2V21h5v-6h3v6h5V9.2" /></svg>;
  return <svg aria-hidden="true" className="confirmed-nav-home-icon" viewBox="0 0 24 24"><path d="m3.5 10 8.5-7 8.5 7v9.5a1.5 1.5 0 0 1-1.5 1.5h-4.5v-7h-5v7H5a1.5 1.5 0 0 1-1.5-1.5Z" /></svg>;
}

function QuoteIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.5 11.5H4.8c.1-3 1.2-4.8 3.5-6l1 1.7c-1.4.8-2 1.8-2.1 3h.3a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Zm9 0h-2.7c.1-3 1.2-4.8 3.5-6l1 1.7c-1.4.8-2 1.8-2.1 3h.3a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Z" /></svg>;
}

function PersonIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.25" /><path d="M5.5 19c.7-3.6 2.9-5.4 6.5-5.4s5.8 1.8 6.5 5.4" /></svg>;
}

export function SiteHeader({ variant = "confirmed" }: { variant?: "confirmed" | "home" }) {
  const pathname = usePathname();
  const preview = variant === "home";
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const [locked, setLocked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const suppressNextFocusOpenRef = useRef(false);
  const closeDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrameRef = useRef<number | null>(null);
  const menuRevisionRef = useRef(0);
  const menuActiveRef = useRef(false);
  const visibilityLockRef = useRef<(key: string, active: boolean) => void>(() => undefined);

  const setMenuOpen = useCallback((next: boolean) => {
    menuActiveRef.current = next;
    const revision = ++menuRevisionRef.current;
    if (closeDelayRef.current) clearTimeout(closeDelayRef.current);
    if (hideDelayRef.current) clearTimeout(hideDelayRef.current);
    if (openFrameRef.current !== null) cancelAnimationFrame(openFrameRef.current);
    if (next) {
      setRenderMenu(true);
      openFrameRef.current = requestAnimationFrame(() => {
        openFrameRef.current = null;
        if (revision === menuRevisionRef.current) setOpen(true);
      });
      return;
    }
    setOpen(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    hideDelayRef.current = setTimeout(() => setRenderMenu(false), reduced ? 0 : 160);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const locks = new Set<string>();
    let lastScrollY = Math.max(0, window.scrollY);
    let pendingScrollY = lastScrollY;
    let accumulatedDistance = 0;
    let lastDirection: "up" | "down" | null = null;
    let frame = 0;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let inputModality: "pointer" | "keyboard" = "pointer";

    const clearRevealTimer = () => {
      if (!revealTimer) return;
      clearTimeout(revealTimer);
      revealTimer = null;
    };
    const show = (returning = false) => {
      clearRevealTimer();
      header.classList.remove("nav-is-hidden");
      header.classList.toggle("nav-is-revealed", returning && !reducedMotion.matches);
    };
    const hide = () => {
      clearRevealTimer();
      header.classList.remove("nav-is-revealed");
      header.classList.add("nav-is-hidden");
    };
    const resetTracking = (scrollY = Math.max(0, window.scrollY)) => {
      lastScrollY = scrollY;
      pendingScrollY = scrollY;
      accumulatedDistance = 0;
      lastDirection = null;
    };
    visibilityLockRef.current = (key, isActive) => {
      if (isActive) locks.add(key);
      else locks.delete(key);
      show(window.scrollY > 200);
      resetTracking();
    };
    const update = () => {
      frame = 0;
      const currentScrollY = pendingScrollY;
      if (currentScrollY <= 200 || locks.size > 0) {
        show();
        resetTracking(currentScrollY);
        return;
      }
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      if (Math.abs(delta) < 1) return;
      const direction = delta > 0 ? "down" : "up";
      if (direction !== lastDirection) {
        accumulatedDistance = 0;
        lastDirection = direction;
      }
      accumulatedDistance += Math.abs(delta);
      if (direction === "down") {
        clearRevealTimer();
        if (accumulatedDistance >= 16) {
          hide();
          accumulatedDistance = 0;
        }
        return;
      }
      if (currentScrollY > 600 && accumulatedDistance >= 24 && header.classList.contains("nav-is-hidden") && !revealTimer) {
        revealTimer = setTimeout(() => {
          revealTimer = null;
          show(true);
          accumulatedDistance = 0;
        }, 120);
      }
    };
    const onScroll = () => {
      pendingScrollY = Math.max(0, window.scrollY);
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      inputModality = "keyboard";
      if (header.classList.contains("nav-is-hidden")) {
        show(true);
        resetTracking();
      }
    };
    const onPointerDown = () => {
      inputModality = "pointer";
      visibilityLockRef.current("focus", false);
    };
    const onFocusIn = () => {
      if (inputModality === "keyboard") visibilityLockRef.current("focus", true);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (header.contains(event.relatedTarget as Node | null)) return;
      visibilityLockRef.current("focus", false);
    };
    const restore = () => {
      show();
      resetTracking();
    };
    const onVisibilityChange = () => {
      if (!document.hidden) restore();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    header.addEventListener("focusin", onFocusIn);
    header.addEventListener("focusout", onFocusOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", restore);
    document.addEventListener("visibilitychange", onVisibilityChange);
    show();
    return () => {
      visibilityLockRef.current = () => undefined;
      if (frame) cancelAnimationFrame(frame);
      clearRevealTimer();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
      header.removeEventListener("focusin", onFocusIn);
      header.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", restore);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => visibilityLockRef.current("more", open), [open]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setLocked(false);
      setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menuActiveRef.current) return;
      setLocked(false);
      setMenuOpen(false);
      suppressNextFocusOpenRef.current = true;
      triggerRef.current?.focus();
      setTimeout(() => { suppressNextFocusOpenRef.current = false; }, 0);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [setMenuOpen]);

  useEffect(() => () => {
    if (closeDelayRef.current) clearTimeout(closeDelayRef.current);
    if (hideDelayRef.current) clearTimeout(hideDelayRef.current);
    if (openFrameRef.current !== null) cancelAnimationFrame(openFrameRef.current);
  }, []);

  return (
    <header className={preview ? "preview-header" : "confirmed-header confirmed-header--no-backdrop"} ref={headerRef}>
      <div className={preview ? "preview-header-grid" : "confirmed-header-grid"}>
        <nav className={preview ? "preview-nav" : "confirmed-nav"} aria-label="主导航">
          <Link className={preview ? "preview-nav-item" : "confirmed-nav-item"} prefetch={false} href="/" aria-current={active(pathname, "/") ? "page" : undefined} aria-label="首页"><HomeIcon preview={preview} />首页</Link>
          <span className={preview ? "preview-nav-divider" : "confirmed-nav-divider"} aria-hidden="true" />
          <Link className={preview ? "preview-nav-item" : "confirmed-nav-item"} prefetch={false} href="/notes/" aria-current={active(pathname, "/notes") ? "page" : undefined}>手记</Link>
          <span className={preview ? "preview-nav-divider" : "confirmed-nav-divider"} aria-hidden="true" />
          <Link className={preview ? "preview-nav-item" : undefined} prefetch={false} href="/life/" aria-current={active(pathname, "/life") ? "page" : undefined}>生活</Link>
          <span className={preview ? "preview-nav-divider" : "confirmed-nav-divider"} aria-hidden="true" />
          <div className={`${preview ? "preview-more" : "confirmed-more"}${preview && open ? " menu-is-open" : ""}`} data-more-active={!preview && (active(pathname, "/says") || active(pathname, "/about")) ? "true" : undefined} data-more-menu-variant={preview ? undefined : "mirror-life"} ref={menuRef} onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => { if (!locked) closeDelayRef.current = setTimeout(() => setMenuOpen(false), 120); }} onFocus={() => { if (!suppressNextFocusOpenRef.current) setMenuOpen(true); }} onBlur={(event) => { if (!locked && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false); }}>
            <button className={preview ? "preview-nav-item" : undefined} type="button" aria-expanded={open} aria-controls={preview ? "preview-more-menu" : "confirmed-more-menu"} ref={triggerRef} onClick={() => { const nextLocked = !locked; setLocked(nextLocked); setMenuOpen(nextLocked); }}>更多</button>
            <div className={preview ? "preview-menu preview-more-menu" : `confirmed-more-menu confirmed-more-menu--no-backdrop${open ? " nav-open" : renderMenu ? " nav-closing" : ""}`} id={preview ? "preview-more-menu" : "confirmed-more-menu"} hidden={!renderMenu}>
              <Link className={preview ? "preview-menu-link" : undefined} prefetch={false} href="/says/" aria-current={active(pathname, "/says") ? "page" : undefined}><span className={preview ? "preview-menu-icon" : "confirmed-menu-icon"}><QuoteIcon /></span><span><strong>一言</strong><small>留下的一些句子</small></span></Link>
              <Link className={preview ? "preview-menu-link" : undefined} prefetch={false} href="/about/" aria-current={active(pathname, "/about") ? "page" : undefined}><span className={preview ? "preview-menu-icon" : "confirmed-menu-icon"}><PersonIcon /></span><span><strong>我</strong><small>关于这个公开项目</small></span></Link>
            </div>
          </div>
        </nav>
        <ThemeToggle variant={preview ? "home" : "confirmed"} onTransitionLockChange={(value) => visibilityLockRef.current("theme", value)} />
      </div>
    </header>
  );
}
