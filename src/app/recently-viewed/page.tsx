"use client"; // Reads localStorage via the recentlyViewed store, and has a
// "Clear history" button with an onClick — both need the browser, so this
// whole page is a Client Component (unlike most other pages in this app,
// which are Server Components that fetch data on the server first).

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Movie } from "@/types/movie";
import { getMovieDetails } from "@/services/movieApi";
import {
  EMPTY_RECENTLY_VIEWED,
  clearRecentlyViewed,
  getRecentlyViewedIds,
  subscribeToRecentlyViewed,
} from "@/utils/recentlyViewed";
import SectionHeading from "@/components/SectionHeading";
import MovieGrid from "@/components/MovieGrid";

export default function RecentlyViewedPage() {
  // Same useSyncExternalStore pattern as RecentlyViewedPreview.tsx — this
  // page and that homepage row both stay in sync automatically because
  // they both read from the exact same underlying localStorage list.
  const recentIds = useSyncExternalStore(
    subscribeToRecentlyViewed,
    getRecentlyViewedIds,
    () => EMPTY_RECENTLY_VIEWED
  );

  const [movies, setMovies] = useState<Movie[] | null>(null);

  useEffect(() => {
    // Nothing to fetch. Note there's no setMovies([]) here: the render
    // below already shows the "no history" message whenever
    // recentIds.length === 0, before it ever looks at "movies" — so
    // there's nothing left to synchronize from inside this effect for that
    // case.
    if (recentIds.length === 0) return;

    let cancelled = false;

    async function loadAll() {
      try {
        const fetched = await Promise.all(
          recentIds.map((id) => getMovieDetails(id.toString()))
        );
        if (!cancelled) setMovies(fetched);
      } catch {
        if (!cancelled) setMovies([]);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
    // recentIds is an array, and arrays are compared by REFERENCE (not
    // contents) in a dependency list — but getRecentlyViewedIds() always
    // hands back the SAME cached array reference until the underlying data
    // genuinely changes (see utils/recentlyViewed.ts), so this still only
    // re-runs when the list actually changes, not on every render.
  }, [recentIds]);

  return (
    <main>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <SectionHeading kicker="Your history" title="Recently viewed" />
        {recentIds.length > 0 ? (
          <button
            type="button"
            onClick={() => clearRecentlyViewed()}
            className="rounded-full border border-rule bg-paper-raised px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-burgundy hover:text-burgundy"
          >
            Clear history
          </button>
        ) : null}
      </div>

      {recentIds.length === 0 ? (
        <p className="max-w-xl text-lg text-ink-soft">
          You haven&apos;t viewed any movies yet. Open a movie&apos;s details
          page and it will show up here.
        </p>
      ) : !movies ? (
        // "movies" is still null while the Promise.all() above is in
        // flight — a short, plain loading message is enough here since this
        // list is usually small and loads quickly.
        <p className="text-sm text-ink-soft">Loading your history…</p>
      ) : movies.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Couldn&apos;t load your recently viewed movies right now.
        </p>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </main>
  );
}
