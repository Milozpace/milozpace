"use client";
import Image from "next/image";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
export type CurrentLifePhoto = {
  caption: string;
  place: string;
  src: string;
  width: number;
  height: number;
  recordedAt: string;
};
type ActiveLayer =
  | { kind: "photo"; photo: CurrentLifePhoto }
  | { kind: "reader"; sample: { recordedAt: string; text: string } };
function formatTime(recordedAt: string) {
  return recordedAt.slice(11, 16);
}

function formatFullDate(recordedAt: string) {
  return recordedAt.slice(0, 10).replaceAll("-", ".");
}

export function getLocalYearStatus() {
  const now = new Date();
  const year = now.getFullYear();
  const todayUtc = Date.UTC(year, now.getMonth(), now.getDate());
  const yearStartUtc = Date.UTC(year, 0, 1);
  const nextYearStartUtc = Date.UTC(year + 1, 0, 1);
  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const day = Math.floor((todayUtc - yearStartUtc) / dayInMilliseconds) + 1;
  const daysInYear = Math.round(
    (nextYearStartUtc - yearStartUtc) / dayInMilliseconds,
  );
  return {
    day,
    progress: Math.min(100, Math.round((day / daysInYear) * 100)),
  };
}

function LifeTimelineLayer({
  activeLayer,
  closeButtonRef,
  onClose,
  shouldReduceMotion,
}: {
  activeLayer: Exclude<ActiveLayer, null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  shouldReduceMotion: boolean;
}) {
  const isPhoto = activeLayer.kind === "photo";
  const label = isPhoto ? "照片大图" : "阅读完整想法";
  const panelMotion = shouldReduceMotion
    ? { initial: false as const }
    : {
        initial: {
          opacity: 0,
          y: isPhoto ? 0 : 16,
          scale: isPhoto ? 0.985 : 1,
        },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: isPhoto ? 0 : 10, scale: isPhoto ? 0.99 : 1 },
        transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
      };

  function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="life-v8-dialog"
      data-testid="life-v8-dialog-backdrop"
      exit={{ opacity: 0 }}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
    >
      <motion.section
        {...panelMotion}
        aria-label={label}
        aria-modal="true"
        className={`life-v8-dialog-panel life-v8-dialog-panel--${activeLayer.kind}`}
        onKeyDown={trapFocus}
        role="dialog"
      >
        <button
          aria-label={isPhoto ? "关闭照片大图" : "关闭阅读层"}
          className="life-v8-dialog-close"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>
        {activeLayer.kind === "photo" ? (
          <figure>
            <Image
              alt={activeLayer.photo.caption}
              height={activeLayer.photo.height}
              priority
              sizes="94vw"
              src={activeLayer.photo.src}
              width={activeLayer.photo.width}
            />
            <figcaption>
              <p>{activeLayer.photo.caption}</p>
              <span>
                <time dateTime={activeLayer.photo.recordedAt}>
                  {formatFullDate(activeLayer.photo.recordedAt)} ·{" "}
                  {formatTime(activeLayer.photo.recordedAt)}
                </time>
                <i>{activeLayer.photo.place}</i>
              </span>
            </figcaption>
          </figure>
        ) : (
          <article>
            <time dateTime={activeLayer.sample.recordedAt}>
              {formatFullDate(activeLayer.sample.recordedAt)}
            </time>
            <p>{activeLayer.sample.text}</p>
          </article>
        )}
      </motion.section>
    </motion.div>
  );
}

export function LifeViewer() {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const historyPushedRef = useRef(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const closeLayer = useCallback(() => {
    setActiveLayer(null);
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    }
  }, []);
  useEffect(() => {
    const open = (event: MouseEvent) => {
      const button = (event.target as Element).closest<HTMLButtonElement>(
        ".life-v9-photo-button",
      );
      if (!button) return;
      const record = button.closest("article")!;
      const img = button.querySelector("img")!;
      triggerRef.current = button;
      setActiveLayer({
        kind: "photo",
        photo: {
          caption: record.querySelector("figcaption p")?.textContent ?? "",
          place: "",
          src: img.getAttribute("src")!,
          width: Number(img.getAttribute("width")),
          height: Number(img.getAttribute("height")),
          recordedAt: record.getAttribute("data-life-record")!,
        },
      });
      window.history.pushState(
        { milozpaceLifeLayer: true },
        "",
        window.location.href,
      );
      historyPushedRef.current = true;
    };
    document.addEventListener("click", open);
    return () => document.removeEventListener("click", open);
  }, []);
  useEffect(() => {
    if (!activeLayer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLayer();
    };
    const pop = () => {
      historyPushedRef.current = false;
      setActiveLayer(null);
    };
    document.addEventListener("keydown", key);
    window.addEventListener("popstate", pop);
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", key);
      window.removeEventListener("popstate", pop);
    };
  }, [activeLayer, closeLayer]);
  return (
    <AnimatePresence onExitComplete={() => triggerRef.current?.focus()}>
      {activeLayer && (
        <LifeTimelineLayer
          activeLayer={activeLayer}
          closeButtonRef={closeButtonRef}
          onClose={closeLayer}
          shouldReduceMotion={shouldReduceMotion}
        />
      )}
    </AnimatePresence>
  );
}

