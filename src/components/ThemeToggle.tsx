"use client"; // Needs click handling + localStorage, so it must run in the browser.

import { useSyncExternalStore } from "react";

// The two explicit choices someone can make.
type Theme = "light" | "dark";

// Reads whatever <html data-theme="..."> is currently set to, falling back
// to the operating system's preference if no explicit choice has been made
// yet. This is the "current snapshot" useSyncExternalStore asks for.
function getSnapshot(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark" || attr === "light") return attr;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

// What to report during server rendering, where there's no `document` or
// `window` to read from yet — matches the light theme's default values.
function getServerSnapshot(): Theme {
  return "light";
}

// Tells React how to "listen" for this value changing. Two things can
// change it: the person clicking the toggle (we fire a plain "themechange"
// event for that, see applyTheme below), or their OS switching light/dark
// while this tab is open (the matchMedia "change" event covers that).
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener("themechange", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("themechange", onChange);
  };
}

function applyTheme(theme: Theme) {
  // Save the explicit choice so it survives a page reload...
  localStorage.setItem("theme", theme);
  // ...set the attribute the CSS in globals.css is watching for...
  document.documentElement.dataset.theme = theme;
  // ...and let every subscribed component (just this one, today) know to
  // re-check the current value.
  window.dispatchEvent(new Event("themechange"));
}

export default function ThemeToggle() {
  // Same pattern used for favorites: read a value that lives OUTSIDE React
  // (here: the <html> attribute + the OS setting) and stay automatically in
  // sync with it, without ever calling setState by hand.
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  function handleToggle() {
    applyTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={handleToggle}
      // aria-pressed + aria-label together tell screen readers this is a
      // toggle and which state it's currently in — same pattern as the
      // favorite heart button.
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule bg-paper-raised text-ink-soft transition hover:border-gold hover:text-gold"
    >
      {isDark ? (
        // Sun icon — shown while dark mode is active, meaning "tap to go light".
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // Moon icon — shown while light mode is active, meaning "tap to go dark".
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
