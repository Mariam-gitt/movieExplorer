const STORAGE_KEY = "favorites";
const CHANGE_EVENT = "favorites-changed";
export const EMPTY_FAVORITES = Object.freeze([] as number[]);

let cachedRaw: string | null = null;
let cachedIds: number[] = [];

export function getFavoriteIds(): number[] {
  if (typeof window === "undefined") return cachedIds;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedIds;

  cachedRaw = raw;
  try {
    cachedIds = raw ? JSON.parse(raw) : [];
  } catch {
    cachedIds = [];
  }
  return cachedIds;
}

export function subscribeToFavorites(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function setFavoriteIds(ids: number[]) {
  const raw = JSON.stringify(ids);
  cachedRaw = raw;
  cachedIds = ids;
  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
