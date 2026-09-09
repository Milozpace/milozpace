"use client";

import { type ReactNode, useEffect } from "react";

export function HomeNarrativeRefinedV3Motion({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("main[data-home-layout='home-narrative-refined-v3']");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const identity = root.querySelector<HTMLElement>("[data-architecture-section='identity']");
    const writing = root.querySelector<HTMLElement>("[data-writing-concept='sky-manuscript']");
    const wind = root.querySelector<HTMLElement>(".transition-writing");
    const windSkipBoundary = writing;
    const life = root.querySelector<HTMLElement>("[data-life-concept='natural-two-column']");
    const ending = root.querySelector<HTMLElement>("[data-home-refined-v3-ending]");
    const cleanups: Array<() => void> = [];

    if (identity) {
      let firstFrame = 0;
      let secondFrame = 0;
      const playIdentityEntrance = () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        identity.classList.remove("identity-motion-ready", "identity-is-entered");

        if (reducedMotion.matches) {
          document.documentElement.classList.remove("home-motion-booting");
          identity.classList.add("identity-is-entered");
          return;
        }

        identity.classList.add("identity-motion-ready");
        void identity.offsetWidth;
        document.documentElement.classList.remove("home-motion-booting");
        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => identity.classList.add("identity-is-entered"));
        });
      };
      const onPageShow = (event: PageTransitionEvent) => {
        if (event.persisted) playIdentityEntrance();
      };

      playIdentityEntrance();
      window.addEventListener("pageshow", onPageShow);
      cleanups.push(() => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        window.removeEventListener("pageshow", onPageShow);
        document.documentElement.classList.remove("home-motion-booting");
      });
    }

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      writing?.classList.add("writing-is-entered");
      wind?.classList.add("wind-is-finished");
      life?.classList.add("life-is-entered");
    } else {
      if (writing) {
        writing.classList.add("writing-motion-ready");
        const writingObserver = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            writing.classList.add("writing-is-entered");
            writingObserver.disconnect();
          },
          { threshold: 0.12, rootMargin: "0px 0px -18% 0px" },
        );
        writingObserver.observe(writing);
        cleanups.push(() => writingObserver.disconnect());
      }

      if (wind && windSkipBoundary) {
        wind.classList.add("wind-motion-ready");
        let hasSettled = false;
        let windTimer = 0;
        const finishWind = () => {
          wind.classList.remove("wind-is-playing");
          wind.classList.add("wind-is-finished");
          window.clearTimeout(windTimer);
        };
        const windObserver = new IntersectionObserver(
          (entries) => {
            if (hasSettled) return;
            const windEntry = entries.find((entry) => entry.target === wind);
            const crossedSkipBoundary = entries.some(
              (entry) => entry.target === windSkipBoundary && entry.isIntersecting,
            );
            const windWasSkipped = Boolean(windEntry && windEntry.boundingClientRect.bottom < 0);

            if (windEntry?.isIntersecting) {
              hasSettled = true;
              wind.classList.add("wind-is-playing");
              windTimer = window.setTimeout(finishWind, 1320);
              windObserver.disconnect();
              return;
            }
            if (windWasSkipped || crossedSkipBoundary) {
              hasSettled = true;
              finishWind();
              windObserver.disconnect();
            }
          },
          { threshold: 0.12, rootMargin: "0px 0px -35% 0px" },
        );
        windObserver.observe(wind);
        windObserver.observe(windSkipBoundary);
        cleanups.push(() => {
          window.clearTimeout(windTimer);
          windObserver.disconnect();
        });
      }

      if (life) {
        life.classList.add("life-motion-ready");
        const lifeObserver = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            life.classList.add("life-is-entered");
            lifeObserver.disconnect();
          },
          { threshold: 0.14, rootMargin: "0px 0px -16% 0px" },
        );
        lifeObserver.observe(life);
        cleanups.push(() => lifeObserver.disconnect());
      }

      if (ending) {
        const endingObserver = new IntersectionObserver(
          (entries) => {
            ending.classList.toggle(
              "final-transition-is-active",
              entries.some((entry) => entry.isIntersecting),
            );
          },
          { threshold: 0.08, rootMargin: "12% 0px 12% 0px" },
        );
        endingObserver.observe(ending);
        cleanups.push(() => endingObserver.disconnect());
      }
    }

    if (!reducedMotion.matches && ending) {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      let responseTimer = 0;
      const onPointerMove = (event: PointerEvent) => {
        if (!finePointer.matches) return;
        const bounds = ending.getBoundingClientRect();
        ending.classList.toggle("page-breath-near-left", event.clientX < bounds.left + bounds.width / 2);
        ending.classList.toggle("page-breath-near-right", event.clientX >= bounds.left + bounds.width / 2);
      };
      const onPointerLeave = () => ending.classList.remove("page-breath-near-left", "page-breath-near-right");
      const onPress = () => {
        window.clearTimeout(responseTimer);
        ending.classList.remove("page-breath-is-responding");
        void ending.offsetWidth;
        ending.classList.add("page-breath-is-responding");
        responseTimer = window.setTimeout(
          () => ending.classList.remove("page-breath-is-responding"),
          720,
        );
      };
      ending.addEventListener("pointermove", onPointerMove);
      ending.addEventListener("pointerleave", onPointerLeave);
      ending.addEventListener("click", onPress);
      cleanups.push(() => {
        window.clearTimeout(responseTimer);
        ending.removeEventListener("pointermove", onPointerMove);
        ending.removeEventListener("pointerleave", onPointerLeave);
        ending.removeEventListener("click", onPress);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return children;
}
