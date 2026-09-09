"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "system" | "dark";
const storageKey = "milozpace-theme";
const eventName = "milozpace-theme-change";
const themes: ThemeChoice[] = ["light", "system", "dark"];

function isTheme(value: string | null | undefined): value is ThemeChoice { return themes.includes(value as ThemeChoice); }
function readChoice(): ThemeChoice {
  if (typeof document === "undefined") return "system";
  const current = document.documentElement.dataset.confirmedTheme;
  if (isTheme(current)) return current;
  const saved = localStorage.getItem(storageKey);
  return isTheme(saved) ? saved : "system";
}
function subscribe(callback: () => void) { window.addEventListener(eventName, callback); return () => window.removeEventListener(eventName, callback); }
function resolveTheme(choice: ThemeChoice) { return choice === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : choice; }
function publishTheme(choice: ThemeChoice) {
  const resolved = resolveTheme(choice);
  localStorage.setItem(storageKey, choice);
  document.documentElement.dataset.confirmedTheme = choice;
  document.documentElement.dataset.themeChoice = choice;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  window.dispatchEvent(new CustomEvent<ThemeChoice>(eventName, { detail: choice }));
}
function useThemeChoice() { return useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice); }

function SunIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" /></svg>; }
function MoonIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" /></svg>; }

export function ThemeToggle({ onTransitionLockChange, variant = "confirmed" }: { onTransitionLockChange?: (active: boolean) => void; variant?: "confirmed" | "home" }) {
  const choice = useThemeChoice();
  const [systemDark, setSystemDark] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revisionRef = useRef(0);
  const resolved = choice === "system" ? (systemDark ? "dark" : "light") : choice;
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => { setSystemDark(media.matches); if (readChoice() === "system") publishTheme("system"); };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); onTransitionLockChange?.(false); }, [onTransitionLockChange]);
  const toggleTheme = () => {
    const next: ThemeChoice = resolved === "light" ? "dark" : "light";
    const revision = ++revisionRef.current;
    if (timerRef.current) clearTimeout(timerRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) { document.documentElement.classList.add("theme-is-transitioning"); onTransitionLockChange?.(true); }
    publishTheme(next);
    if (reduced) { document.documentElement.classList.remove("theme-is-transitioning"); onTransitionLockChange?.(false); return; }
    timerRef.current = setTimeout(() => {
      if (revision !== revisionRef.current) return;
      document.documentElement.classList.remove("theme-is-transitioning");
      onTransitionLockChange?.(false);
      timerRef.current = null;
    }, 520);
  };
  const home = variant === "home";
  return <div className={home ? "preview-theme" : "confirmed-theme-control confirmed-theme-control--binary"}><button className={home ? "preview-theme-toggle" : "confirmed-theme-toggle"} type="button" aria-label={resolved === "light" ? "切换到夜间模式" : "切换到白昼模式"} onClick={toggleTheme}><span className={home ? "preview-theme-icon-clip" : "confirmed-theme-icon-clip"} aria-hidden="true"><span className={home ? "preview-theme-icon preview-theme-sun" : "confirmed-theme-icon confirmed-theme-sun"}><SunIcon /></span><span className={home ? "preview-theme-icon preview-theme-moon" : "confirmed-theme-icon confirmed-theme-moon"}><MoonIcon /></span></span></button></div>;
}

export function ThemeChoices() {
  const choice = useThemeChoice();
  return <div className="confirmed-footer-theme" aria-label="主题" role="group">{themes.map((theme, index) => <span key={theme}>{index > 0 && <i aria-hidden="true">·</i>}<button type="button" aria-pressed={choice === theme} onClick={() => publishTheme(theme)}>{theme === "light" ? "浅色" : theme === "system" ? "系统" : "深色"}</button></span>)}</div>;
}
