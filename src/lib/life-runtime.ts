// Local timeline renderer and entrance behavior extracted from the frozen runtime source.
export type LifeEntranceMode = "play" | "defer" | "static";

export type LifeImageVariant = {
  src: string;
  width: number;
  height: number;
  mimeType: string;
};

export type LifeImage = {
  assetId: string;
  alt: string;
  variants: LifeImageVariant[];
};

export type LifeRuntimePost = {
  id: string;
  body: string;
  displayDate: string;
  createdAt: string;
  updatedAt: string;
  kind: "photo" | "text";
  image?: LifeImage;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function largestVariant(image: LifeImage): LifeImageVariant {
  return [...image.variants].sort(
    (left, right) => right.width * right.height - left.width * left.height,
  )[0];
}

function variantSrcset(image: LifeImage): string {
  return [...image.variants]
    .sort((left, right) => left.width - right.width)
    .map((variant) => `${variant.src} ${variant.width}w`)
    .join(", ");
}

function cloneTemplate<T extends Element>(
  template: Element | null,
  scope: string,
): T {
  if (!template) {
    throw new Error(`Life runtime cannot find the frozen ${scope} template`);
  }
  const clone = template.cloneNode(true) as T;
  clone.removeAttribute("style");
  return clone;
}

function buildThoughtRecord(
  template: Element | null,
  post: LifeRuntimePost,
): Element {
  const record = cloneTemplate<Element>(template, "thought record");
  const instant = shanghaiInstant(post.createdAt);
  record.setAttribute("data-fragment-id", post.id);
  record.setAttribute("data-life-fragment", "thought");
  record.setAttribute("data-life-record", instant.iso);
  const body = record.querySelector(".life-v9-record-body p");
  if (body) body.textContent = post.body;
  const time = record.querySelector(".life-v9-entry-meta time");
  if (time) {
    time.setAttribute("datetime", instant.iso);
    time.textContent = `${instant.monthDay} · ${instant.time}`;
  }
  return record;
}

function buildPhotoRecord(
  template: Element | null,
  post: LifeRuntimePost,
): Element {
  const record = cloneTemplate<Element>(template, "photo record");
  const instant = shanghaiInstant(post.createdAt);
  const image = post.image as LifeImage;
  const variant = largestVariant(image);
  const orientation =
    variant.width >= variant.height ? "landscape" : "portrait";
  record.classList.remove(
    "life-v9-photo--portrait",
    "life-v9-photo--landscape",
  );
  record.classList.add(`life-v9-photo--${orientation}`);
  record.setAttribute("data-fragment-id", post.id);
  record.setAttribute("data-life-fragment", "photo");
  record.setAttribute("data-life-record", instant.iso);
  const button = record.querySelector("button.life-v9-photo-button");
  if (button) {
    button.setAttribute("data-photo-open", post.id);
    button.setAttribute("aria-label", `查看照片大图：${image.alt}`);
  }
  const img = record.querySelector("img");
  if (img) {
    img.setAttribute("src", variant.src);
    img.setAttribute("srcset", variantSrcset(image));
    img.setAttribute("alt", image.alt);
    img.setAttribute("width", String(variant.width));
    img.setAttribute("height", String(variant.height));
    img.removeAttribute("data-nimg");
    img.removeAttribute("style");
  }
  const caption = record.querySelector("figcaption p");
  if (caption) caption.textContent = post.body;
  const time = record.querySelector("figcaption time");
  if (time) {
    time.setAttribute("datetime", instant.iso);
    time.textContent = `${instant.monthDay} · ${instant.time}`;
  }
  // The public contract carries no place; drop the frozen placeholder.
  record.querySelector("figcaption i")?.remove();
  return record;
}

function buildMonthGroup(template: Element | null, monthKey: string): Element {
  const group = cloneTemplate<Element>(template, "month group");
  group.setAttribute("data-life-month", monthKey);
  const time = group.querySelector("time");
  if (time) {
    const monthIndex = Number(monthKey.slice(5, 7)) - 1;
    const year = monthKey.slice(0, 4);
    time.setAttribute("datetime", monthKey);
    time.textContent = `${MONTH_NAMES[monthIndex]} ${year}`;
  }
  return group;
}

/**
 * Rebuilds the Life stream by cloning the frozen templates, grouped by
 * Shanghai month. The decorative rail is preserved untouched.
 */
export function renderLifeTimeline(
  document: Document,
  posts: LifeRuntimePost[],
  options: { entrance?: LifeEntranceMode } = {},
): void {
  const stream = document.querySelector("section.life-v9-stream");
  if (!stream) return;
  const thoughtTemplate = stream.querySelector("article.life-v9-thought");
  const photoTemplate = stream.querySelector("article.life-v9-photo");
  const monthTemplate = stream.querySelector(".life-v9-month");

  const replacement = document.createDocumentFragment();
  const rail = stream.querySelector(".life-v9-rail");
  if (rail) replacement.append(rail.cloneNode(true));

  const groups = new Map<string, Element[]>();
  for (const post of posts) {
    const monthKey = shanghaiInstant(post.createdAt).monthKey;
    const records = groups.get(monthKey) ?? [];
    records.push(
      post.kind === "photo"
        ? buildPhotoRecord(photoTemplate, post)
        : buildThoughtRecord(thoughtTemplate, post),
    );
    groups.set(monthKey, records);
  }

  for (const [monthKey, records] of groups) {
    replacement.append(buildMonthGroup(monthTemplate, monthKey));
    const container = document.createElement("div");
    container.className = "life-v9-records";
    container.append(...records);
    replacement.append(container);
  }

  stream.removeAttribute("data-life-applied-revision");
  stream.replaceChildren(replacement);
  bindTimelineAnimations(stream, options.entrance ?? "play");
  const count = document.querySelector("[data-life-record-count]");
  if (count) count.textContent = String(posts.length);
}

/* ------------------------------------------------------------------ */
/* Timeline animation ownership. The frozen page's entrance behaviour */
/* is owned by React/Framer Motion, which cloneNode cannot copy. When */
/* the runtime replaces the stream it must re-bind the same initial   */
/* states, timings and viewport triggers on the cloned nodes so a     */
/* dynamically updated timeline looks exactly like the frozen one.    */
/* ------------------------------------------------------------------ */

const RAIL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type TimelineBinding = {
  animations: Animation[];
  observers: IntersectionObserver[];
  /**
   * Present on "defer" bindings: arms the parked entrance at reveal by
   * playing every animation and attaching the viewport observers.
   */
  arm?: () => void;
  deferred?: boolean;
};

const timelineBindings = new WeakMap<Element, TimelineBinding>();

function prefersReducedMotion(): boolean {
  const media = (
    globalThis as { matchMedia?: (query: string) => { matches: boolean } }
  ).matchMedia;
  return (
    typeof media === "function" &&
    media("(prefers-reduced-motion: reduce)").matches
  );
}

function canAnimate(element: Element | null): element is Element & {
  animate: (
    keyframes: Keyframe[],
    options?: KeyframeAnimationOptions,
  ) => Animation;
} {
  return Boolean(
    element &&
    typeof (element as Element & { animate?: unknown }).animate === "function",
  );
}

/**
 * Cancels every animation and disconnects every viewport observer that was
 * bound to the stream, so a newer rebuild never leaves stale behaviour on
 * old nodes or double-binds the current ones.
 */
export function disposeTimelineAnimations(stream: Element): void {
  const previous = timelineBindings.get(stream);
  if (!previous) return;
  for (const animation of previous.animations) {
    animation.cancel();
  }
  for (const observer of previous.observers) {
    observer.disconnect();
  }
  timelineBindings.delete(stream);
}

/**
 * Restores the frozen entrance behaviour on the rebuilt stream nodes:
 * the rail grows from scaleY(0), month labels fade in, their dots spring
 * from scale(0.6), and records slide in when they enter the viewport with
 * the frozen staggered delay for the first two. Under
 * `prefers-reduced-motion: reduce` no animation is created and the CSS
 * final state is left alone.
 *
 * With `mode: "defer"` every animation is created paused and the record
 * observers stay unattached; `startLifeEntrance` arms them once the page
 * gate opens. With `mode: "static"` no entrance behaviour is bound at all —
 * post-ready updates must never replay the full timeline.
 */
function bindTimelineAnimations(
  stream: Element,
  mode: LifeEntranceMode = "play",
): void {
  disposeTimelineAnimations(stream);
  if (mode === "static") return;
  if (prefersReducedMotion()) return;
  if (typeof IntersectionObserver === "undefined") return;

  const animations: Animation[] = [];
  const observers: IntersectionObserver[] = [];
  const binding: TimelineBinding = { animations, observers };
  timelineBindings.set(stream, binding);

  const railLine = stream.querySelector(".life-v9-rail-line");
  if (canAnimate(railLine)) {
    const animation = railLine.animate(
      [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
      { delay: 260, duration: 720, easing: RAIL_EASE, fill: "both" },
    );
    if (mode === "defer") animation.pause();
    animations.push(animation);
  }

  const months = [...stream.querySelectorAll(".life-v9-month")];
  for (const month of months) {
    if (canAnimate(month)) {
      const animation = month.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 250,
        fill: "both",
      });
      if (mode === "defer") animation.pause();
      animations.push(animation);
    }
    const dot = month.querySelector("span");
    if (canAnimate(dot)) {
      const animation = dot.animate(
        [{ transform: "scale(0.6)" }, { transform: "scale(1)" }],
        {
          delay: 930,
          duration: 600,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          fill: "both",
        },
      );
      if (mode === "defer") animation.pause();
      animations.push(animation);
    }
  }

  const records = [...stream.querySelectorAll(".life-v9-record")];
  if (records.length === 0) return;
  const recordAnimations = new Map<Element, Animation>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        recordAnimations.get(entry.target)?.play();
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.18 },
  );
  observers.push(observer);
  records.forEach((record, index) => {
    if (!canAnimate(record)) return;
    const animation = record.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      {
        duration: 480,
        delay: index < 2 ? 1020 + index * 80 : 0,
        easing: RAIL_EASE,
        fill: "both",
      },
    );
    animations.push(animation);
    recordAnimations.set(record, animation);
    animation.pause();
    if (mode === "play") observer.observe(record);
  });

  if (mode === "defer") {
    binding.deferred = true;
    binding.arm = () => {
      for (const animation of animations) animation.play();
      for (const record of records) observer.observe(record);
    };
  }
}

/**
 * Arms the parked first-round entrance at reveal: every animation starts
 * from zero and the viewport observers attach, all in the same task in
 * which the page gate opens.
 */
export function startLifeEntrance(document: Document): void {
  const stream = document.querySelector("section.life-v9-stream");
  if (!stream) return;
  const binding = timelineBindings.get(stream);
  if (!binding?.deferred) return;
  binding.deferred = false;
  binding.arm?.();
}

type ShanghaiInstant = {
  iso: string;
  monthKey: string;
  monthIndex: number;
  year: number;
  monthDay: string;
  time: string;
  dateLabel: string;
};

function shanghaiInstant(isoDateTime: string): ShanghaiInstant {
  const shifted = new Date(
    new Date(isoDateTime).getTime() + 8 * 60 * 60 * 1000,
  );
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  const hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    iso: `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+08:00`,
    monthKey: `${year}-${pad(month)}`,
    monthIndex: month - 1,
    year,
    monthDay: `${pad(month)}.${pad(day)}`,
    time: `${pad(hours)}:${pad(minutes)}`,
    dateLabel: `${year}.${pad(month)}.${pad(day)}`,
  };
}
