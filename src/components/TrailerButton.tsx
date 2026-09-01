"use client"; // Needs click handling + keyboard events + state, so it must run in the browser.

import { useEffect, useState } from "react";

type TrailerButtonProps = {
  videoKey: string; // The YouTube video id (used to build the embed URL).
  movieTitle: string;
};

export default function TrailerButton({ videoKey, movieTitle }: TrailerButtonProps) {
  // Whether the trailer modal is currently open.
  const [isOpen, setIsOpen] = useState(false);

  // Close the modal if the person presses Escape, and stop the page behind
  // it from scrolling while the modal is open — both are things a normal
  // <a href="youtube.com"> link would never need to worry about, but a
  // custom modal has to handle itself.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    // Remember whatever the body's overflow was before we changed it, so
    // closing the modal restores the page exactly as it was.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2.5 text-sm font-bold text-stamp transition hover:bg-burgundy-deep"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
        </svg>
        Watch Trailer
      </button>

      {isOpen ? (
        // role="dialog" + aria-modal tell assistive tech this covers the
        // rest of the page and traps focus/attention until closed.
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${movieTitle} trailer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          // Clicking the dark overlay (but not the video itself) closes the modal.
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl"
            // Stop a click INSIDE the video panel from bubbling up to the
            // overlay's onClick above (which would immediately close it).
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close trailer"
              className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* aspect-video keeps a 16:9 box no matter the screen width,
                which is the shape every YouTube embed expects. */}
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
                title={`${movieTitle} trailer`}
                className="h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
