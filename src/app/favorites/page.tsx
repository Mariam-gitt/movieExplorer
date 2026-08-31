"use client";

import { useEffect, useState } from "react";
import MovieGrid from "@/components/MovieGrid";
import type { Movie } from "@/types/movie";
import { getMovieDetails } from "@/services/movieApi";

export default function FavoritesPage() {
  // const [movies, setMovies] = useState<Movie[]>([]);

  // Store the movies that we successfully fetch.
const [movies, setMovies] = useState<Movie[]>([]);

// Track whether we're still fetching the favorite movies.
const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedFavorites = localStorage.getItem("favorites");

//     if (!storedFavorites) return;

//     const favoriteIds: number[] = JSON.parse(storedFavorites);

//     // We'll fetch the movies here next.
//   }, []);

useEffect(() => {
  const storedFavorites = localStorage.getItem("favorites");

  if (!storedFavorites) {
    setLoading(false);
    return;
  }

  const favoriteIds: number[] = JSON.parse(storedFavorites);

  async function loadFavorites() {
    try {
      // Fetch all favorite movies.
      const favoriteMovies = await Promise.all(
        favoriteIds.map((id) => getMovieDetails(id.toString()))
      );

      // Store the fetched movies in React state.
      setMovies(favoriteMovies);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      // We are finished loading.
      setLoading(false);
    }
  }

  loadFavorites();
}, []);

//   return (
   
//   <main>
//     {/* Page heading. */}
//     <h1>My Favorites</h1>

//     {/* 
//       If there are no favorite movies, show a message.
//       Otherwise, display the movie grid.
//     */}
//     {movies.length === 0 ? (
//       <p>You haven't added any movies to your favorites yet.</p>
//     ) : (
//       <MovieGrid movies={movies} />
//     )}
//   </main>
// );

return (
  <main>
    {/* Page heading. */}
    <h1>My Favorites</h1>

    {/* Show a message while favorite movies are being fetched. */}
    {loading ? (
      <p>Loading your favorites...</p>
    ) : movies.length === 0 ? (
      <p>You haven't added any movies to your favorites yet.</p>
    ) : (
      <MovieGrid movies={movies} />
    )}
  </main>
);

}