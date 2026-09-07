"use client"; // IntersectionObserver, useState/useEffect/useRef, and
// fetch-on-scroll all need the browser — this can't be a Server Component.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Movie, MovieResponse } from "@/types/movie";
import MovieGrid from "./MovieGrid";
import { filterMoviesByYearAndRating, sortMovies } from "@/utils/movieMeta";

// INFINITE SCROLLING (new): this component takes the FIRST page of results
// (already fetched on the server by the page that renders it — e.g.
// genres/page.tsx) and transparently fetches MORE pages from a same-origin
// API route as the user scrolls near the bottom, appending them to the
// grid. The page using this component never has to think about scrolling
// at all — it just hands over page 1 and the URL to ask for more.
type InfiniteMovieGridProps = {
  // PROP FLOW: parent (a Server Component page) -> child (this component).
  // "initialMovies" is page 1, already rendered on the server — this means
  // the very first screenful of movies appears immediately, with zero
  // client-side loading spinner, exactly like before this feature existed.
  initialMovies: Movie[];
  // Which page number "initialMovies" represents (normally 1).
  initialPage: number;
  // How many pages TMDB says exist in total for this exact query — once
  // the component has fetched up to this page, it knows to stop.
  totalPages: number;
  // The same-origin API route to call for additional pages — e.g.
  // "/api/movies/discover" or "/api/movies/search". This component doesn't
  // know or care which one; it just appends "&page=N" and fetches it.
  endpoint: string;
  // Every OTHER query param that endpoint needs on every page request
  // (e.g. { genre: "28", sort: "popularity.desc" } for discover, or
  // { q: "batman" } for search). Kept as plain strings because that's what
  // ends up in a URL anyway.
  queryParams: Record<string, string>;
  // ADVANCED FILTERING / SORT for endpoints that DON'T support these
  // server-side (TMDB's plain search endpoint, unlike "discover", ignores
  // year/rating/sort params entirely). Optional and unused by the genres
  // page, since discoverMovies() already asks TMDB to filter/sort for us
  // there — passing these here would just be redundant (though harmless)
  // work in that case.
  clientFilter?: { yearFrom?: number; yearTo?: number; minRating?: number };
  clientSort?: string;
};

export default function InfiniteMovieGrid({
  initialMovies,
  initialPage,
  totalPages,
  endpoint,
  queryParams,
  clientFilter,
  clientSort,
}: InfiniteMovieGridProps) {
  // The full, ever-growing list of movies shown so far: starts as exactly
  // what the server already rendered, then gets more appended to it.
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  // Once true, no more fetches are attempted — either every page has been
  // loaded, or the last fetch failed and we don't want to retry forever in
  // a loop.
  const [finished, setFinished] = useState(page >= totalPages);
  const [loadError, setLoadError] = useState(false);

  // "sentinelRef" points at an empty <div> placed at the very bottom of the
  // grid. IntersectionObserver (below) watches THIS element specifically —
  // the moment it scrolls into view, that's the browser's way of saying
  // "the user has scrolled almost to the bottom", which is the cue to fetch
  // the next page.
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // useMemo turns the queryParams OBJECT into a stable, comparable STRING.
  // Without this, a brand new object reference from the parent on every
  // render would make the loadNextPage callback below "change" every
  // render even when the actual param values didn't — which would then
  // retrigger the IntersectionObserver effect unnecessarily.
  const queryString = useMemo(
    () => new URLSearchParams(queryParams).toString(),
    [queryParams]
  );

  // useCallback keeps this exact function reference stable across renders
  // (as long as its dependencies don't change), which the observer effect
  // below relies on to avoid re-creating the IntersectionObserver on every
  // single render.
  const loadNextPage = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `${endpoint}?${queryString}&page=${nextPage}`
      );
      if (!response.ok) throw new Error("Failed to load more movies");

      const data: MovieResponse = await response.json();
      // For endpoints that can't filter/sort server-side (search), apply
      // the same filtering this page's initial results already went
      // through, so a movie outside the chosen year/rating range never
      // sneaks into the grid just because it came from a LATER page.
      const newResults = clientFilter
        ? filterMoviesByYearAndRating(data.results, clientFilter)
        : data.results;

      // Append rather than replace — this is what makes it "infinite
      // scroll" instead of "infinite reload": everything already on screen
      // stays exactly where it is, and new cards are added after it.
      setMovies((current) => {
        const combined = [...current, ...newResults];
        // Sorting has to happen across the WHOLE combined list (not just
        // the new page) — otherwise "Highest rated" would only be correct
        // within each individual page of 20, not across the full list.
        return clientSort ? sortMovies(combined, clientSort) : combined;
      });
      setPage(nextPage);
      if (nextPage >= data.total_pages) setFinished(true);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, queryString, clientFilter, clientSort]);

  useEffect(() => {
    // If there's nothing left to fetch, don't even set up an observer.
    if (finished) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // IntersectionObserver is a browser API that efficiently watches
    // whether a given element is currently visible in the viewport,
    // WITHOUT the performance cost of manually checking scroll position on
    // every single scroll event (which fires extremely often).
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting;
        // The three guard conditions here prevent: fetching while a fetch
        // is already in flight (isVisible && !loading), fetching again
        // right after an error until something changes (!loadError), and
        // fetching past the last page (checked separately via "finished").
        if (isVisible && !loading && !loadError) {
          loadNextPage();
        }
      },
      {
        // "rootMargin: 400px" starts loading the NEXT page while the
        // sentinel is still 400px BELOW the visible viewport — this means
        // new movies usually finish loading before the user actually
        // scrolls far enough to see the empty space, instead of them
        // watching a loading spinner appear then disappear.
        rootMargin: "400px",
      }
    );

    observer.observe(sentinel);
    // Cleanup: stop observing when this effect re-runs or the component
    // unmounts, so old observers don't pile up and keep firing.
    return () => observer.disconnect();
  }, [finished, loading, loadError, loadNextPage]);

  return (
    <>
      <MovieGrid movies={movies} />

      {/* This div has no size/visible content of its own — it exists ONLY
          as a target for the IntersectionObserver above. Placing it right
          after the grid means "it becomes visible" happens right as the
          user nears the actual bottom of the loaded movies. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />

      {loading ? (
        <p className="py-6 text-center text-sm text-ink-soft">
          Loading more movies…
        </p>
      ) : null}

      {loadError ? (
        <div className="py-6 text-center">
          <p className="mb-2 text-sm text-ink-soft">
            Couldn&apos;t load more movies.
          </p>
          <button
            type="button"
            onClick={loadNextPage}
            className="rounded-full border border-rule bg-paper-raised px-4 py-1.5 text-sm font-semibold text-ink transition hover:border-gold"
          >
            Try again
          </button>
        </div>
      ) : null}

      {finished && movies.length > 0 && !loadError ? (
        <p className="py-6 text-center text-sm text-ink-soft">
          You&apos;ve reached the end of the list.
        </p>
      ) : null}
    </>
  );
}
