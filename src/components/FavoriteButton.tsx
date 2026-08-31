"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Movie } from "@/types/movie";
import {
  getFavoriteIds,
  setFavoriteIds,
  subscribeToFavorites,
} from "@/utils/favorites";

type FavoriteButtonProps = {
  movie: Movie;
};

export default function FavoriteButton({ movie }: FavoriteButtonProps) {
  const getServerSnapshot = useCallback(() => [] as number[], []);
  
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoriteIds,
    getServerSnapshot
  );
  const isFavorite = favorites.includes(movie.id);

  function handleFavorite() {
    if (isFavorite) {
      setFavoriteIds(favorites.filter((id) => id !== movie.id));
    } else {
      setFavoriteIds([...favorites, movie.id]);
    }
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Remove ${movie.title} from favorites`
          : `Add ${movie.title} to favorites`
      }
      className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft hover:text-burgundy"
    >
      {isFavorite ? "In favorites" : "Save"}
    </button>
  );
}
