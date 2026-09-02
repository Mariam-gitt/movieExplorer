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
