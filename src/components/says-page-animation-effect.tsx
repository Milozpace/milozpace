"use client";

import { useEffect } from "react";

export function SaysPageAnimationEffect() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-says-animation='io-motion-spring'] .confirmed-quote-masonry blockquote"));
    if (!cards.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((card) => { card.style.opacity = "1"; card.style.transform = "none"; });
      return;
    }
    let disposed = false;
    let observer: IntersectionObserver | undefined;
    import("motion").then(({ animate, stagger }) => {
      if (disposed) return;
      cards.forEach((card) => { card.style.opacity = "0"; card.style.transform = "translateY(50px)"; });
      observer = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement);
        if (!visible.length) return;
        visible.forEach((card) => observer?.unobserve(card));
        animate(visible, { opacity: 1, y: 0 }, { type: "spring", damping: 10, stiffness: 100, delay: stagger(0.05) });
      }, { rootMargin: "50px" });
      cards.forEach((card) => observer?.observe(card));
    });
    return () => { disposed = true; observer?.disconnect(); };
  }, []);
  return null;
}
