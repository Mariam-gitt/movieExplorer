"use client"; // This component needs browser state (what the user is typing), the
// router, keyboard event listeners, and a debounce timer, so it must run
// in the browser, not just on the server.

import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Movie } from "@/types/movie";
import { getMovieYear, posterUrl } from "@/utils/movieMeta";
import Image from "next/image";

// KEYBOARD-FRIENDLY SEARCH (new): this component now follows the "combobox"
// accessibility pattern — a text input paired with a suggestions list that
// can be driven entirely from the keyboard, the same interaction model as
// a browser's own address bar autocomplete. The three pieces that make
// that true are: (1) global "/" shortcut to jump into the box without
// touching the mouse, (2) Up/Down/Enter/Escape handling while typing, and
// (3) the ARIA roles/attributes below that describe all of this to screen
// readers, not just sighted keyboard users.
export default function SearchBar() {
  // "query" holds whatever the user has typed so far; "setQuery" updates it.
  // React re-renders the input every time this changes, so it always shows
  // the latest characters the user typed.
  const [query, setQuery] = useState("");
  // The list of title suggestions fetched for the CURRENT query, and which
  // one (if any) is currently highlighted via the arrow keys.
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  // "router" lets us navigate to a different URL from JavaScript (instead of
  // waiting for a full page reload like a normal <a> tag would cause).
  const router = useRouter();

  // A real DOM reference to the <input>, needed so the global "/" shortcut
  // below can imperatively call .focus() on it — something React's normal
  // props-based approach can't do on its own.
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Holds the pending debounce timer id across renders without causing a
  // re-render itself whenever it's reassigned (see FilterPanel.tsx for the
  // same pattern, used there for year-filter typing instead of suggestions).
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // useId generates a stable, unique id per component INSTANCE — used to
  // wire the input's aria-controls/aria-activedescendant to the exact
  // listbox and option elements below, which is how a screen reader knows
  // which suggestion is "active" without that information being visible on
  // screen at all.
  const listboxId = useId();

  // GLOBAL "/" SHORTCUT: lets the user jump into the search box from
  // anywhere on the page without reaching for the mouse — the same pattern
  // sites like GitHub and Gmail use for their own search boxes.
  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      // Only trigger on a bare "/" — not "/" combined with Ctrl/Cmd/Alt,
      // which might be a browser or OS shortcut instead.
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      // If the user is ALREADY typing into some other text field (or this
      // one), a literal "/" character should be typed normally instead of
      // being hijacked as a shortcut.
      const target = event.target as HTMLElement;
      const isTypingElsewhere =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTypingElsewhere) return;

      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // DEBOUNCED SUGGESTIONS: fetches a short list of matching titles as the
  // user types, via the same /api/movies/search route InfiniteMovieGrid
  // uses for pagination — one endpoint serving two different features.
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = query.trim();

    debounceTimer.current = setTimeout(async () => {
      // Don't bother suggesting anything for a blank box or a single
      // character — one letter matches far too many titles to be useful.
      // This check lives INSIDE the timeout callback (not directly in the
      // effect body) so every state update here happens asynchronously,
      // which is what React's effect rules want — an effect should kick
      // off work, not synchronously set state itself.
      if (trimmed.length < 2) {
        setSuggestions([]);
        setActiveIndex(-1);
        return;
      }

      try {
        const response = await fetch(
          `/api/movies/search?q=${encodeURIComponent(trimmed)}`
        );
        if (!response.ok) return;
        const data = await response.json();
        setSuggestions((data.results ?? []).slice(0, 6));
        setActiveIndex(-1);
      } catch {
        // A failed suggestions fetch shouldn't disrupt typing or block a
        // full search submission — just show no suggestions this time.
        setSuggestions([]);
      }
      // 300ms is short enough to feel instant, but long enough that fast
      // typing doesn't fire a network request per keystroke.
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  function goToMovie(movie: Movie) {
    setIsOpen(false);
    setSuggestions([]);
    setQuery("");
    router.push(`/movies/${movie.id}`);
  }

  function handleSearch(event?: FormEvent) {
    // Stop the browser's default "reload the page and send a GET request"
    // behaviour for form submission — we want to navigate with the router instead.
    event?.preventDefault();
    // Ignore empty/whitespace-only searches.
    if (!query.trim()) return;
    setIsOpen(false);
    // encodeURIComponent makes the query safe to put inside a URL (turns
    // spaces and special characters into their escaped form).
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  // KEYBOARD NAVIGATION of the suggestions list — this is the heart of the
  // "keyboard-friendly search" feature. Without this handler, the
  // suggestions dropdown would only be usable with a mouse.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      // First Escape closes suggestions; if there are none open, it clears
      // the box entirely and gives up focus — two useful "get me out of
      // here" behaviours from one familiar key.
      if (isOpen || suggestions.length > 0) {
        setIsOpen(false);
        setActiveIndex(-1);
      } else {
        setQuery("");
        inputRef.current?.blur();
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      // "% suggestions.length" wraps back to 0 after the last item, so
      // holding ArrowDown cycles through the list forever instead of
      // getting stuck at the bottom.
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      );
    } else if (event.key === "Enter") {
      // If a suggestion is highlighted, Enter opens IT specifically;
      // otherwise Enter falls through to the form's own onSubmit (handled
      // by handleSearch above), which runs a full title search instead.
      if (activeIndex >= 0) {
        event.preventDefault();
        goToMovie(suggestions[activeIndex]);
      }
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="relative flex w-full max-w-md items-center gap-2 rounded-full border border-rule bg-paper-raised px-4 py-2 shadow-sm shadow-black/5 focus-within:border-gold"
    >
      {/* A small magnifying-glass icon, purely decorative (the real label is
          the sr-only <span> below), so it's marked aria-hidden. */}
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="m20 20-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <label className="block min-w-0 flex-1">
        {/* "sr-only" = visually hidden but still read aloud by screen readers,
            so people using assistive tech know what this field is for even
            though sighted users just see the placeholder text. */}
        <span className="sr-only">Search movies by title</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          // A short delay before closing on blur, so a click landing on a
          // suggestion (which briefly steals focus from the input first)
          // still has time to register before the list disappears.
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="Search movies, shows... (press / to focus)"
          // ARIA COMBOBOX PATTERN: these five attributes are what let a
          // screen reader announce this as "a text box with a related
          // suggestions list", and tell it exactly which suggestion (if
          // any) is currently highlighted — all without any of that
          // relationship being visible on screen.
          role="combobox"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          className="w-full border-0 bg-transparent p-0 text-sm text-ink placeholder:text-ink-soft/70 focus:ring-0 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-burgundy px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-stamp transition hover:bg-burgundy-deep"
      >
        Search
      </button>

      {/* The suggestions dropdown — a "listbox" of "option"s, per the ARIA
          combobox pattern started on the <input> above. Only rendered at
          all once there's something to show, so it never leaves an empty,
          confusing box hovering under the search field. */}
      {isOpen && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-96 overflow-y-auto rounded-2xl border border-rule bg-paper-raised p-2 shadow-lg shadow-black/10"
        >
          {suggestions.map((movie, index) => {
            const isActive = index === activeIndex;
            const poster = posterUrl(movie.poster_path, "w92");
            return (
              <li
                key={movie.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isActive}
                // onMouseDown (not onClick) fires BEFORE the input's onBlur
                // above, so clicking a suggestion navigates instead of the
                // list closing out from under the click first.
                onMouseDown={(event) => {
                  event.preventDefault();
                  goToMovie(movie);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left ${
                  isActive ? "bg-burgundy/10" : "hover:bg-paper"
                }`}
              >
                <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-stamp">
                  {poster ? (
                    <Image src={poster} alt="" fill sizes="36px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold text-ink">
                    {movie.title}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {getMovieYear(movie.release_date) ?? "—"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
}
