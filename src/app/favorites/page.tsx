"use client";

import { useEffect, useState } from "react";
import MovieGrid from "@/components/MovieGrid";
import type { Movie } from "@/types/movie";
import { getMovieDetails } from "@/services/movieApi";

export default function FavoritesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

//   useEffect(() => {
//     const storedFavorites = localStorage.getItem("favorites");

//     if (!storedFavorites) return;

//     const favoriteIds: number[] = JSON.parse(storedFavorites);

//     // We'll fetch the movies here next.
//   }, []);

useEffect(() => {
  const storedFavorites = localStorage.getItem("favorites");

  if (!storedFavorites) return;

  const favoriteIds: number[] = JSON.parse(storedFavorites);

  async function loadFavorites() {
    const favoriteMovies = await Promise.all(
      favoriteIds.map((id) => getMovieDetails(id.toString()))
    );

    setMovies(favoriteMovies);
  }

  loadFavorites();
}, []);

  return (
    <main>
      <h1>My Favorites</h1>

      <MovieGrid movies={movies} />
    </main>
  );
}