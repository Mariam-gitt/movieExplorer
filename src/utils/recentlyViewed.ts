// This file mirrors utils/favorites.ts almost exactly — same localStorage +
// custom-event pattern — just for a different list (movies the user has
// OPENED recently, instead of movies they've starred). Keeping the two
// files structurally identical makes it easy to compare them side by side
// when studying how the pattern works.

// The localStorage key this feature is saved under (favorites.ts uses its
// own separate key, "favorites", so the two lists never collide).
const STORAGE_KEY = "recently-viewed";
// A custom browser event name used to announce "the list changed" to any
// component using useSyncExternalStore below — see the comment on
// subscribeToRecentlyViewed() for why this is needed.
const CHANGE_EVENT = "recently-viewed-changed";
// The most recently viewed movies are capped at this many entries so
// localStorage doesn't grow forever and the "Recently viewed" row on the
// homepage stays short and scannable.
const MAX_ENTRIES = 20;

// Object.freeze makes this array read-only at runtime (attempting to
// .push() into it would silently fail in non-strict mode, or throw in
// strict mode) — it's used as a safe, stable "empty" placeholder so React
// never sees a brand-new empty array on every render (which would look
// like "the data changed" even when it didn't).
export const EMPTY_RECENTLY_VIEWED = Object.freeze([] as number[]);

// A tiny in-memory cache so repeated reads (e.g. React re-rendering several
// times in a row) don't re-parse the same JSON string from localStorage
// every single time — only when the raw string actually changes.
let cachedRaw: string | null = null;
let cachedIds: number[] = [];

// Reads the current list of recently-viewed movie ids, most-recently-viewed
// FIRST (index 0). Returns numbers only — this file doesn't store WHEN a
// movie was viewed, just the order, which is all the UI needs.
export function getRecentlyViewedIds(): number[] {
  // "typeof window === 'undefined'" is true when this code runs on the
  // SERVER (localStorage doesn't exist there at all) — e.g. during Next.js
  // server-side rendering. Returning the last-known cache avoids a crash.
  if (typeof window === "undefined") return cachedIds;

  const raw = localStorage.getItem(STORAGE_KEY);
  // If the raw string hasn't changed since last time, skip re-parsing it
  // and hand back the same cached array reference (this also helps
  // useSyncExternalStore avoid unnecessary re-renders, since it compares
  // the returned value by reference).
  if (raw === cachedRaw) return cachedIds;

  cachedRaw = raw;
  try {
    cachedIds = raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupted/unexpected localStorage content shouldn't crash the app —
    // just treat it as "nothing recorded yet".
    cachedIds = [];
  }
  return cachedIds;
}

// Lets a React component (via useSyncExternalStore) be told whenever the
// recently-viewed list changes — even from ANOTHER browser tab. The native
// "storage" event only fires in OTHER tabs, not the tab that made the
// change, which is why recordMovieViewed() below also fires a custom
// CHANGE_EVENT to cover updates made in the SAME tab.
export function subscribeToRecentlyViewed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  // React calls this returned function to clean up the listeners when the
  // component unmounts, preventing memory leaks.
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

// Records that the user just viewed a movie. If it's already in the list,
// it's moved to the front (most-recent) instead of appearing twice; the
// list is then trimmed to MAX_ENTRIES so it can't grow without bound.
export function recordMovieViewed(movieId: number) {
  const current = getRecentlyViewedIds();
  // Build a new array: the viewed movie first, then every OTHER id from the
  // current list (the .filter() removes movieId from wherever it used to
  // be, so it doesn't appear twice after being moved to the front).
  const next = [movieId, ...current.filter((id) => id !== movieId)].slice(
    0,
    MAX_ENTRIES
  );

  const raw = JSON.stringify(next);
  // Update the cache immediately so a getRecentlyViewedIds() call made
  // right after this one (before the CHANGE_EVENT listeners even run)
  // already sees the new list.
  cachedRaw = raw;
  cachedIds = next;
  localStorage.setItem(STORAGE_KEY, raw);
  // Tell every subscribed component in THIS tab to re-read the list.
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Wipes the entire recently-viewed history — used by the "Clear history"
// button on the /recently-viewed page.
export function clearRecentlyViewed() {
  cachedRaw = "[]";
  cachedIds = [];
  localStorage.setItem(STORAGE_KEY, "[]");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
