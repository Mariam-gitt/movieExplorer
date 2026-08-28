"use client";

import { useState } from "react";
import type { Movie } from "@/types/movie";

type FavoriteButtonProps = {
  movie: Movie;
};

export default function FavoriteButton({
  movie,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  function handleFavorite() {
  const storedFavorites = localStorage.getItem("favorites");

  const favorites: number[] = storedFavorites
    ? JSON.parse(storedFavorites)
    : [];

  if (favorites.includes(movie.id)) {
    const updatedFavorites = favorites.filter(
      (id) => id !== movie.id
    );

    localStorage.setItem(
      "favorites",
      JSON.stringify(updatedFavorites)
    );

    setIsFavorite(false);
  } else {
    const updatedFavorites = [...favorites, movie.id];

    localStorage.setItem(
      "favorites",
      JSON.stringify(updatedFavorites)
    );

    setIsFavorite(true);
  }
  }

  return (
    <button onClick={handleFavorite}>
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}

