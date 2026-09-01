"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import MovieGrid from "@/components/MovieGrid";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SectionHeading from "@/components/SectionHeading";
import type { Movie } from "@/types/movie";
import { getMovieDetails } from "@/services/movieApi";
import {
  EMPTY_FAVORITES,
  getFavoriteIds,
  subscribeToFavorites,
} from "@/utils/favorites";

export default function FavoritesPage() {
  const favoriteIds = useSyncExternalStore(
    subscribeToFavorites,
    getFavoriteIds,
    () => EMPTY_FAVORITES
  );
  const [movies, setMovies] = useState<Movie[] | null>(null);

  useEffect(() => {
    if (favoriteIds.length === 0) return;

    let cancelled = false;

    async function loadFavorites() {
      try {
        const favoriteMovies = await Promise.all(
          favoriteIds.map((id) => getMovieDetails(id.toString()))
        );
        if (!cancelled) setMovies(favoriteMovies);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        if (!cancelled) setMovies([]);
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  return (
    <main>
      <SectionHeading kicker="Your list" title="Favorites" />

      {favoriteIds.length === 0 ? (
        <p className="max-w-xl text-lg text-ink-soft">
          Nothing saved yet. Open a film and choose{" "}
          <span className="font-semibold text-ink">Save</span> on a card to keep
          it here.
        </p>
      ) : movies == null ? (
        <LoadingSkeleton label="Loading your favorites" />
      ) : (
        <MovieGrid movies={movies} />
      )}
    </main>
  );
}
