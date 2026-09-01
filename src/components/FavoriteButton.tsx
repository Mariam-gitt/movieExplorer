"use client"; // Needs browser storage (localStorage) and click handling, so it
// must be a client component.

import { useSyncExternalStore, type MouseEvent } from "react";
import type { Movie } from "@/types/movie";
import {
  EMPTY_FAVORITES,
  getFavoriteIds,
  setFavoriteIds,
  subscribeToFavorites,
} from "@/utils/favorites";

type FavoriteButtonProps = {
  movie: Movie;
};

export default function FavoriteButton({ movie }: FavoriteButtonProps) {
  // useSyncExternalStore is React's official way to read a value that lives
  // OUTSIDE React (here: localStorage, via the favorites.ts helper) and stay
  // in sync with it — it automatically re-renders this component whenever
  // the favorites list changes anywhere in the app (even in another tab).
  //
  // The server snapshot must stay stable across renders. Creating a fresh
  // array each time would make React think the external value changed and
  // trigger the infinite loop warning.
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoriteIds,
    () => EMPTY_FAVORITES
  );
  // Is THIS movie's id currently in the favorites list?
  const isFavorite = favorites.includes(movie.id);

  function handleFavorite(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();

    if (isFavorite) {
      // Remove this movie's id, keep everything else.
      setFavoriteIds(favorites.filter((id) => id !== movie.id));
    } else {
      // Add this movie's id to the end of the list.
      setFavoriteIds([...favorites, movie.id]);
    }
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      // Prevent the card link from also firing when the heart is clicked while
      // still letting this button's own click handler run.
      // aria-pressed tells screen readers this is a toggle button and what
      // state it's currently in (like a checkbox, but for a button).
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Remove ${movie.title} from favorites`
          : `Add ${movie.title} to favorites`
      }
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
    >
      {/* One SVG heart, drawn either filled (favorite) or outline-only (not
          favorite) by switching the "fill" attribute based on isFavorite. */}
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 11c-2.5 4.65-9.5 9-9.5 9Z"
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
