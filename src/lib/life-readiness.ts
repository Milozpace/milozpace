// Frozen first-paint timing, with local content as the readiness work.
const READY_BUDGET_MS = 2000;
const MIN_LOADER_VISIBLE_MS = 900;
export type FirstRoundOutcome = "live" | "snapshot" | "timeout";

export type FirstRoundGate = {
  /**
   * False once the absolute budget expired: late first-round results must
   * never commit immediately after the fallback reveal.
   */
  shouldCommit: () => boolean;
  /** Resolves with the first-round outcome; used to time the page reveal. */
  settle: Promise<FirstRoundOutcome>;
};

function defaultNavigationStartTime(): number {
  const perf = (globalThis as { performance?: Performance }).performance;
  const origin = perf?.timeOrigin;
  if (typeof origin === "number" && origin > 0) return origin;
  if (perf && typeof perf.now === "function") return Date.now() - perf.now();
  return Date.now();
}

/**
 * Epoch ms at which the unified loading label actually became visible. The
 * label renders with the first paint of the static HTML, so the first-paint
 * timestamp is the honest anchor for its minimum beat; navigationStart would
 * let slow HTML delivery eat into it. Falls back to navigationStart when the
 * browser exposes no paint timing (tests, older engines).
 */
function defaultLoaderAppearedAt(navigationStart: number): number {
  const perf = (globalThis as { performance?: Performance }).performance;
  if (perf && typeof perf.getEntriesByType === "function") {
    const paints = perf.getEntriesByType("paint");
    const first =
      paints.find((entry) => entry.name === "first-paint") ?? paints[0];
    if (first && first.startTime >= 0) return navigationStart + first.startTime;
  }
  return navigationStart;
}

/**
 * Opens the first-round gate around the initial runtime pass. The outcome is
 * whatever finishes first: the work (live data applied) or the absolute
 * deadline counted from navigationStart. After the deadline the gate expires
 * and `shouldCommit()` turns false so stale first-round results are dropped
 * instead of visibly swapping the already-revealed page.
 *
 * The outcome is additionally held until the loading label has been visible
 * for `minVisibleMs` — counted from when the label actually appeared (first
 * paint of the static HTML, overridable), so fast loads still play one full
 * beat of the label instead of flashing it. Slower loads are unaffected: the
 * commit budget itself is not extended by this floor: `shouldCommit()` keeps
 * expiring at the original navigationStart deadline, and the timeout outcome
 * always lands past the floor because the budget is wider than it.
 */
export function beginFirstRound(options: {
  work: Promise<unknown>;
  budgetMs?: number;
  /** Epoch ms of navigationStart; defaults to performance.timeOrigin. */
  navigationStart?: number;
  now?: () => number;
  /** Shortest loader visibility; defaults to MIN_LOADER_VISIBLE_MS. */
  minVisibleMs?: number;
  /** Epoch ms when the loader appeared; defaults to the first paint. */
  loaderAppearedAt?: number;
}): FirstRoundGate {
  const budgetMs = options.budgetMs ?? READY_BUDGET_MS;
  const now = options.now ?? (() => Date.now());
  const start = options.navigationStart ?? defaultNavigationStartTime();
  const deadline = start + budgetMs;
  const loaderAppearedAt =
    options.loaderAppearedAt ?? defaultLoaderAppearedAt(start);
  const minVisibleAt =
    loaderAppearedAt +
    Math.max(0, options.minVisibleMs ?? MIN_LOADER_VISIBLE_MS);

  let expired = now() >= deadline;
  let settled = false;
  let resolveOutcome!: (outcome: FirstRoundOutcome) => void;
  const settle = new Promise<FirstRoundOutcome>((resolve) => {
    resolveOutcome = resolve;
  });

  const finish = (outcome: FirstRoundOutcome) => {
    if (settled) return;
    // First finish wins even while the outcome itself is parked until the
    // loader has had its minimum beat on screen.
    settled = true;
    const wait = Math.max(0, minVisibleAt - now());
    if (wait > 0) setTimeout(() => resolveOutcome(outcome), wait);
    else resolveOutcome(outcome);
  };

  if (expired) {
    finish("timeout");
  } else {
    setTimeout(() => {
      expired = true;
      finish("timeout");
    }, deadline - now());
  }

  void options.work.then(
    () => finish("live"),
    () => finish("snapshot"),
  );

  return {
    shouldCommit: () => !expired,
    settle,
  };
}

/* ------------------------------------------------------------------ */
/* First-entrance coordination. First-round renders park their        */
/* entrance animations until the gate opens, so every visible         */
/* animation starts at (or after) the reveal — never while the page   */
/* is still hidden behind the readiness gate.                         */
/* ------------------------------------------------------------------ */
