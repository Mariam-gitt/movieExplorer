// Import TypeScript types that describe the data we receive from TMDB.
import type {
  Movie,
  MovieResponse,
  MovieCredits,
  MovieVideosResponse,
} from "@/types/movie";

// Store the base URL of the TMDB API in one constant.
const BASE_URL = "https://api.themoviedb.org/3";

// Store the TMDB API key in ONE constant, read from ONE env variable.
// Every function below uses this constant instead of reading
// process.env directly — so if the env var name ever changes again,
// this is the only line that needs editing.
const API_KEY = process.env.TMDB_API_KEY;

// Fetch popular movies from TMDB.
export async function getPopularMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }

  return response.json();
}

// Fetch movies that are currently trending.
export async function getTrendingMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
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
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch top rated movies");
  }

  return response.json();
}

// Search TMDB for movies matching the user's search query.
// "page" (new, for INFINITE SCROLLING) works exactly like discoverMovies'
// page option above: it defaults to 1, so every existing call site that
// only passes a query string keeps behaving exactly as before.
export async function searchMovies(
  query: string,
  page = 1
): Promise<MovieResponse> {
  const params = new URLSearchParams({
    api_key: API_KEY ?? "",
    query,
    page: String(page),
  });

  const response = await fetch(`${BASE_URL}/search/movie?${params.toString()}`);

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
    : `${BASE_URL}/movie/${id}?api_key=${API_KEY}`;

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
    `${BASE_URL}/movie/upcoming?api_key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch upcoming movies");
  }

  return response.json();
}

// Fetch movies that are currently playing.
export async function getNowPlayingMovies(): Promise<MovieResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`
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
    `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
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
    `${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch similar movies");
  }

  return response.json();
}

// Fetch movies filtered by genre and/or sorted a particular way, using
// TMDB's "discover" endpoint — this is a DIFFERENT endpoint from the plain
// category ones above (like getPopularMovies). "Discover" is what TMDB
// specifically built for combining filters together (genre, sort order,
// rating, year, etc.), instead of only returning one fixed list.
export async function discoverMovies(options: {
  // TMDB's numeric id for a genre (e.g. 28 = Action). Optional — if
  // omitted, movies from every genre are included.
  genreId?: number;
  // Which field TMDB should sort results by, in TMDB's own query format
  // (e.g. "popularity.desc", "vote_average.desc"). Defaults to popularity.
  sortBy?: string;
  // ADVANCED FILTERING (new): only include movies released ON OR AFTER
  // this year. Left undefined = no lower bound.
  yearFrom?: number;
  // ADVANCED FILTERING (new): only include movies released ON OR BEFORE
  // this year. Left undefined = no upper bound.
  yearTo?: number;
  // ADVANCED FILTERING (new): only include movies whose average rating
  // (out of 10) is at least this number. Left undefined = no minimum.
  minRating?: number;
  // INFINITE SCROLLING (new): which page of results to fetch. TMDB returns
  // 20 movies per page — "page 1" is the first 20, "page 2" is the next 20,
  // and so on. Defaults to 1 (the first page) so every existing caller that
  // doesn't know about pagination still works exactly like before.
  page?: number;
}): Promise<MovieResponse> {
  // URLSearchParams builds a query string ("key=value&key2=value2") for us,
  // so we don't have to manually glue strings together with "&" and "=".
  const params = new URLSearchParams({
    api_key: API_KEY ?? "",
    sort_by: options.sortBy ?? "popularity.desc",
    // TMDB ignores runtime-less/rating-less entries by default when sorting
    // by rating, but this threshold keeps obscure zero-vote titles (which
    // can appear to have a fake "10/10" rating from a single vote) out of
    // the "Top rated" sort.
    "vote_count.gte": "50",
    page: String(options.page ?? 1),
  });

  // Only add the genre filter to the query string if one was actually
  // passed in — an empty/undefined genreId means "show every genre".
  if (options.genreId != null) {
    params.set("with_genres", String(options.genreId));
  }

  // TMDB's discover endpoint accepts full dates ("gte"/"lte" = "greater
  // than or equal" / "less than or equal"), so a year like 2010 has to be
  // turned into "2010-01-01" (start of that year) or "2010-12-31" (end of
  // that year) to act as a proper year-range filter.
  if (options.yearFrom != null) {
    params.set("primary_release_date.gte", `${options.yearFrom}-01-01`);
  }
  if (options.yearTo != null) {
    params.set("primary_release_date.lte", `${options.yearTo}-12-31`);
  }
  // Overrides the flat "50" vote-count threshold above ONLY when the user
  // actually asked for a minimum rating, since a real minRating filter is a
  // stronger, more deliberate signal than the anti-fake-rating default.
  if (options.minRating != null) {
    params.set("vote_average.gte", String(options.minRating));
  }

  const response = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to discover movies");
  }

  return response.json();
}

// Fetch trailers/teasers/clips for a specific movie (used to find a YouTube
// trailer to embed on the movie details page).
export async function getMovieVideos(id: string): Promise<MovieVideosResponse> {
  const response = await fetch(
    `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie videos");
  }

  return response.json();
}