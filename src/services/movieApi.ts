// Import TypeScript types that describe the data we receive from TMDB.
import type {
  Movie,
  MovieResponse,
  MovieCredits,
  MovieVideosResponse,
} from "@/types/movie";

// Store the base URL of the TMDB API in one constant.
const BASE_URL = "https://api.themoviedb.org/3";

// Fetch popular movies from TMDB.
export async function getPopularMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }

  return response.json();
}

// Fetch movies that are currently trending.
export async function getTrendingMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`API Error [${response.status}]: ${text}`);
    throw new Error(`Failed to fetch trending movies: ${response.status} ${text}`);
  }

  return response.json();
}

// Fetch top-rated movies from TMDB.
export async function getTopRatedMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch top rated movies");
  }

  return response.json();
}

// Search TMDB for movies matching the user's search query.
export async function searchMovies(
  query: string
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search movies");
  }

  return response.json();
}

// Fetch detailed information about one specific movie.
export async function getMovieDetails(
  id: string
): Promise<Movie> {
  // On client side, use the API route to avoid CORS issues
  const url = typeof window !== "undefined" 
    ? `/api/movies/${id}`
    : `${BASE_URL}/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    console.error(`API Error [${response.status}]: ${text}`);
    throw new Error(`Failed to fetch movie details: ${response.status} ${text}`);
  }

  return response.json();
}

// Fetch movies that are going to be released soon.
export async function getUpcomingMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/upcoming?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch upcoming movies");
  }

  return response.json();
}

// Fetch movies that are currently playing.
export async function getNowPlayingMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch now playing movies");
  }

  return response.json();
}

// Fetch the cast and crew for a specific movie.
export async function getMovieCredits(
  id: string
): Promise<MovieCredits> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie credits");
  }

  return response.json();
}

// Fetch movies that are similar to a specific movie.
export async function getSimilarMovies(
  id: string
): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/similar?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch similar movies");
  }

  return response.json();
}

// Fetch trailers/teasers/clips for a specific movie (used to find a YouTube
// trailer to embed on the movie details page).
export async function getMovieVideos(id: string): Promise<MovieVideosResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie videos");
  }

  return response.json();
}