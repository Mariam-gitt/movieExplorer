"use client"; // Needs the browser's navigator.share/clipboard APIs and a
// bit of temporary UI state ("Copied!"), so this must run in the browser.

import { useState } from "react";

type ShareButtonProps = {
  // The movie's title, used as the shared content's headline. We don't
  // need the URL as a prop — we read it live from the browser at click
  // time via window.location.href instead (see handleShare below), so
  // this component works correctly no matter which movie page it's on.
  title: string;
};

export default function ShareButton({ title }: ShareButtonProps) {
  // Tracks whether we should currently show "Copied!" instead of "Share".
  // Starts false; flips to true for 2 seconds after a successful copy.
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    // FEATURE DETECTION: not every browser implements navigator.share
    // (most desktop browsers don't; most mobile browsers do). Checking
    // "share" in navigator first means we never call a function that
    // might not exist — calling a missing method would throw a
    // TypeError and crash this handler instead of falling back gracefully.
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        // navigator.share() opens the operating system's native share
        // sheet (the same one you'd see sharing a photo or a link from
        // any other app) pre-filled with this title and URL.
        await navigator.share({ title, url });
        return; // Successfully handed off to the OS share sheet — done.
      } catch (error) {
        // If the user closes the share sheet without picking anything,
        // the browser rejects this promise with an "AbortError" — that's
        // not a real failure, just a change of mind, so we quietly stop
        // here instead of falling through to the clipboard fallback below.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        // Any OTHER error (share genuinely failed) falls through to the
        // clipboard fallback below, so the user still gets something useful.
      }
    }

    // FALLBACK: either navigator.share doesn't exist on this browser, or
    // it existed but failed for some reason — copy the link to the
    // clipboard instead, which works almost everywhere.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // setTimeout schedules code to run once, after a delay (in
      // milliseconds) — here, it flips the button's label back to
      // "Share" 2 seconds after showing "Copied!", so the confirmation
      // doesn't stay on screen forever.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail too (e.g. permissions denied) — fail
      // quietly rather than showing a scary error for a "nice to have"
      // feature; the user can still copy the URL from the address bar.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-raised/70 px-3 py-1 text-xs font-semibold text-ink transition hover:border-gold"
    >
      {/* One SVG icon, swapped based on "copied" state: a share/branch icon
          normally, a checkmark once the link has been copied. */}
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
        {copied ? (
          <path
            d="M5 12.5 10 17l9-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .09 1.94L8.83 9.09a3 3 0 1 0 0 5.82l6.26 3.15A3 3 0 1 0 15.83 16l-6.26-3.15a3 3 0 0 0 0-1.7l6.26-3.15A2.98 2.98 0 0 0 18 8Z"
            fill="currentColor"
          />
        )}
      </svg>
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
