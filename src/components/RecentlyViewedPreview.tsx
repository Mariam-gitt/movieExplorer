"use client"; // Needs localStorage + React state, so it has to run in the browser.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Movie } from "@/types/movie";
import { getMovieDetails } from "@/services/movieApi";
import {
  EMPTY_RECENTLY_VIEWED,
  getRecentlyViewedIds,
  subscribeToRecentlyViewed,
} from "@/utils/recentlyViewed";
import { getMovieYear, posterUrl } from "@/utils/movieMeta";

// This is FavoritesPreview.tsx's twin: same shape, same
// useSyncExternalStore + useEffect combo, just pointed at the
// recently-viewed store instead of the favorites store, and it links to
// "/recently-viewed" for the full history instead of "/favorites".
export default function RecentlyViewedPreview() {
  // useSyncExternalStore is the React hook specifically designed for
  // reading a value that lives OUTSIDE React (here: localStorage) and
  // re-rendering automatically whenever that outside value changes. Its
  // three arguments are: (1) how to SUBSCRIBE to changes, (2) how to READ
  // the current value in the browser, (3) how to read a value on the
  // SERVER (where localStorage doesn't exist) so server-rendered HTML
  // doesn't mismatch what the browser renders first.
  const recentIds = useSyncExternalStore(
    subscribeToRecentlyViewed,
    getRecentlyViewedIds,
    () => EMPTY_RECENTLY_VIEWED
  );

  // "movies" starts as null (meaning "haven't loaded yet"); once the fetch
  // below finishes it becomes an actual array (which might be empty).
  const [movies, setMovies] = useState<Movie[] | null>(null);

  useEffect(() => {
    // Only show the 8 most recent entries in this compact preview row — the
    // full, untrimmed history is available on the dedicated page.
    const idsToShow = recentIds.slice(0, 8);

    // Nothing to fetch. Note there's no setMovies([]) here: the render
    // below already returns null whenever recentIds.length === 0,
    // regardless of "movies" — so there's nothing left to synchronize by
    // setting state from inside this effect for that case (calling
    // setState synchronously in an effect body, rather than from inside an
    // async callback, is what triggers React's "avoid cascading renders"
    // warning).
    if (idsToShow.length === 0) return;

    // Guards against a "set state on an unmounted component" warning if
    // recentIds changes again (or the component unmounts) before this
    // batch of fetches finishes.
    let cancelled = false;

    async function loadRecentlyViewed() {
      try {
        // Fetch full movie details for every id IN PARALLEL (Promise.all),
        // which is much faster than awaiting them one at a time in a loop.
        const recentMovies = await Promise.all(
          idsToShow.map((id) => getMovieDetails(id.toString()))
        );
        if (!cancelled) setMovies(recentMovies);
      } catch {
        // If TMDB is briefly unreachable, fail quietly — the rest of the
        // homepage still works, this row just won't appear this time.
        if (!cancelled) setMovies([]);
      }
    }

    loadRecentlyViewed();

    return () => {
      cancelled = true;
    };
  }, [recentIds]);

  // Nothing recorded yet, still loading, or the fetch came back empty —
  // render nothing rather than an empty, confusing box.
  if (recentIds.length === 0 || !movies || movies.length === 0) return null;

  return (
    <section aria-label="Recently viewed movies" className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">
          Recently Viewed
        </h2>
        {/* Only worth linking to the full history page if there's more
            hiding beyond this 8-item preview row. */}
        {recentIds.length > 8 ? (
          <Link
            href="/recently-viewed"
            className="text-sm font-semibold text-gold hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="flex w-56 shrink-0 items-center gap-3 rounded-xl border border-rule bg-paper-raised p-2 transition hover:border-gold"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-stamp">
              {posterUrl(movie.poster_path, "w185") ? (
                <Image
                  src={posterUrl(movie.poster_path, "w185")!}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
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
          </Link>
        ))}
      </div>
    </section>
  );
}
