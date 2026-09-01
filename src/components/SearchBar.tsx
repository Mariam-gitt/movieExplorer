"use client"; // This component needs browser state (what the user is typing) and
// the router, so it must run in the browser, not just on the server.

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  // "query" holds whatever the user has typed so far; "setQuery" updates it.
  // React re-renders the input every time this changes, so it always shows
  // the latest characters the user typed.
  const [query, setQuery] = useState("");
  // "router" lets us navigate to a different URL from JavaScript (instead of
  // waiting for a full page reload like a normal <a> tag would cause).
  const router = useRouter();

  function handleSearch(event?: FormEvent) {
    // Stop the browser's default "reload the page and send a GET request"
    // behaviour for form submission — we want to navigate with the router instead.
    event?.preventDefault();
    // Ignore empty/whitespace-only searches.
    if (!query.trim()) return;
    // encodeURIComponent makes the query safe to put inside a URL (turns
    // spaces and special characters into their escaped form).
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-rule bg-paper-raised px-4 py-2 shadow-sm shadow-black/5 focus-within:border-gold"
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
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies, shows..."
          className="w-full border-0 bg-transparent p-0 text-sm text-ink placeholder:text-ink-soft/70 focus:ring-0 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-burgundy px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-stamp transition hover:bg-burgundy-deep"
      >
        Search
      </button>
    </form>
  );
}
