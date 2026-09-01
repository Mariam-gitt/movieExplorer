"use client"; // Needs localStorage + React state, so it has to run in the browser.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Movie } from "@/types/movie";
import { getMovieDetails } from "@/services/movieApi";
import {
  EMPTY_FAVORITES,
  getFavoriteIds,
  subscribeToFavorites,
} from "@/utils/favorites";
import { getMovieYear, posterUrl } from "@/utils/movieMeta";

// This mirrors the "Continue Watching" list from the reference design, but
// mapped onto a feature this app actually has: the user's saved Favorites.
// It's a compact row of thumbnails, and it simply doesn't render anything
// if the user hasn't favorited any movies yet.
export default function FavoritesPreview() {
  // Same pattern as FavoriteButton.tsx: read the favourites list from
  // localStorage and re-render automatically whenever it changes.
  const favoriteIds = useSyncExternalStore(
    subscribeToFavorites,
    getFavoriteIds,
    () => EMPTY_FAVORITES // what to show during server rendering (no favorites yet)
  );

  // "movies" starts as null (meaning "haven't loaded yet"); once the fetch
  // below finishes it becomes an actual array (which might be empty).
  const [movies, setMovies] = useState<Movie[] | null>(null);

  useEffect(() => {
    // Only keep the 6 most-recently-added favorites so this stays a short,
    // scannable row instead of a huge list.
    const idsToShow = favoriteIds.slice(-6).reverse();

    // Nothing to fetch — leave "movies" untouched here; the early return in
    // the render below already handles the "no favorites" case, so there's
    // no need to synchronously update state from inside this effect.
    if (idsToShow.length === 0) return;

    // "cancelled" guards against a React warning that happens if the
    // component unmounts (or favoriteIds changes again) before the network
    // request finishes — we simply skip updating state in that case.
    let cancelled = false;

    async function loadFavorites() {
      try {
        const favoriteMovies = await Promise.all(
          idsToShow.map((id) => getMovieDetails(id.toString()))
        );
        if (!cancelled) setMovies(favoriteMovies);
      } catch {
        // If TMDB is unreachable, fail quietly here — the rest of the
        // homepage still works, this row just won't appear.
        if (!cancelled) setMovies([]);
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  // Nothing saved, still loading, or the fetch came back empty — render
  // nothing rather than an empty, confusing box.
  if (favoriteIds.length === 0 || !movies || movies.length === 0) return null;

  return (
    <section aria-label="Your favorites" className="mb-10">
      <h2 className="mb-3 font-display text-lg font-bold text-ink">Your Favorites</h2>
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
              <p className="line-clamp-1 text-sm font-semibold text-ink">{movie.title}</p>
              <p className="text-xs text-ink-soft">{getMovieYear(movie.release_date) ?? "—"}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
