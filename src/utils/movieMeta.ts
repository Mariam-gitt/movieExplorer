import type { Movie } from "@/types/movie";

// "export" here (added for the genre-browsing feature) means other files
// can now import GENRE_NAMES directly too, not just the helper functions
// below that already used it internally.
export const GENRE_NAMES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Turns the GENRE_NAMES object above into an array of {id, name} pairs,
// sorted alphabetically by name. Components that need to LIST every genre
// (like genre-filter chips) want an array to .map() over — an object with
// numeric keys isn't convenient for that, even though it's great for the
// "look up one genre's name by id" job GENRE_NAMES was originally for.
export const GENRE_LIST: { id: number; name: string }[] = Object.entries(
  GENRE_NAMES
)
  .map(([id, name]) => ({ id: Number(id), name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function getMovieYear(releaseDate?: string) {
  if (!releaseDate) return null;
  const year = releaseDate.slice(0, 4);
  return year || null;
}

export function getMovieGenre(movie: Movie) {
  if (movie.genres?.[0]?.name) return movie.genres[0].name;
  if (movie.genre_ids?.[0] != null) {
    return GENRE_NAMES[movie.genre_ids[0]] ?? null;
  }
  return null;
}

export function posterUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ADVANCED FILTERING / SORT (new) — used specifically for TMDB's plain
// SEARCH endpoint, which (unlike "discover") has no built-in support for
// year-range, minimum-rating, or sort-order query params. discoverMovies()
// in movieApi.ts asks TMDB to do this filtering/sorting itself, so pages
// using it never need these helpers; the /search page, which can only use
// TMDB's basic search-by-title endpoint, applies these functions itself
// AFTER fetching, to get the same filter/sort options on search results.
export function filterMoviesByYearAndRating(
  movies: Movie[],
  filters: { yearFrom?: number; yearTo?: number; minRating?: number }
): Movie[] {
  return movies.filter((movie) => {
    const year = getMovieYear(movie.release_date);
    const yearNumber = year ? Number(year) : null;

    // A movie with no known release year fails a year-range filter (there's
    // nothing to compare against), but should still pass through untouched
    // when NO year filter is active at all.
    if (filters.yearFrom != null) {
      if (yearNumber == null || yearNumber < filters.yearFrom) return false;
    }
    if (filters.yearTo != null) {
      if (yearNumber == null || yearNumber > filters.yearTo) return false;
    }
    if (filters.minRating != null) {
      if (movie.vote_average < filters.minRating) return false;
    }
    return true;
  });
}

// Mirrors the "value" strings used by SortSelect.tsx (e.g.
// "vote_average.desc") so the exact same dropdown options work whether the
// sorting happens on TMDB's server (discoverMovies) or here, in the
// browser/server, on an already-fetched array (search results).
export function sortMovies(movies: Movie[], sortBy?: string): Movie[] {
  if (!sortBy) return movies;

  // .slice() copies the array first — sorting IN PLACE would mutate the
  // array the caller passed in, which could cause confusing bugs if they
  // still hold a reference to the original, unsorted array elsewhere.
  const sorted = movies.slice();

  switch (sortBy) {
    case "vote_average.desc":
      return sorted.sort((a, b) => b.vote_average - a.vote_average);
    case "primary_release_date.desc":
      return sorted.sort((a, b) =>
        (b.release_date || "").localeCompare(a.release_date || "")
      );
    case "primary_release_date.asc":
      return sorted.sort((a, b) =>
        (a.release_date || "").localeCompare(b.release_date || "")
      );
    case "popularity.desc":
      return sorted.sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
      );
    default:
      return sorted;
  }
}
