import type { Movie, MovieResponse } from "@/types/movie";

const BASE_URL = "https://api.themoviedb.org/3";

export async function getPopularMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${process.env.TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }

  return response.json();
}

export async function getTrendingMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }

  return response.json();
}

export async function getTopRatedMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${process.env.TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch top rated movies");
  }

  return response.json();
}

export async function searchMovies(
  query: string
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search movies");
  }

  return response.json();
}

export async function getMovieDetails(
  id: string
): Promise<Movie> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return response.json();
}