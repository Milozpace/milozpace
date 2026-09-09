"use client";
import { useLayoutEffect } from "react";
import { beginFirstRound } from "@/lib/life-readiness";
import { lifeTemplate } from "./life-template";
import { LifeViewer, getLocalYearStatus } from "./life-viewer";
import {
  renderLifeTimeline,
  startLifeEntrance,
  disposeTimelineAnimations,
  type LifeRuntimePost,
} from "@/lib/life-runtime";
export function LifeTimeline({ posts }: { posts: LifeRuntimePost[] }) {
  useLayoutEffect(() => {
    document.querySelector("main")?.setAttribute("aria-busy", "true");
    renderLifeTimeline(document, posts, { entrance: "defer" });
    const status = getLocalYearStatus();
    document.querySelector("[data-year-day]")!.textContent = String(status.day);
    document.querySelector("[data-year-progress]")!.textContent =
      status.progress + "%";
    const bar = document.querySelector("[data-year-progress-bar]")!;
    bar.setAttribute("aria-valuenow", String(status.progress));
    (bar.firstElementChild as HTMLElement).style.width = status.progress + "%";
    let cancelled = false;
    const gate = beginFirstRound({ work: document.fonts.ready });
    void gate.settle.then(() => {
      if (cancelled) return;
      document
        .querySelector("[data-local-life]")
        ?.removeAttribute("data-pending");
      startLifeEntrance(document);
      document.querySelector("main")?.removeAttribute("aria-busy");
    });
    return () => {
      cancelled = true;
      document.querySelector("main")?.removeAttribute("aria-busy");
      const stream = document.querySelector(".life-v9-stream");
      if (stream) disposeTimelineAnimations(stream);
    };
  }, [posts]);
  return (
    <>
      <div
        data-local-life
        data-pending
        dangerouslySetInnerHTML={{ __html: lifeTemplate }}
      />
      <LifeViewer />
    </>
  );
}

