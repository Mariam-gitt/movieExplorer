import type { Metadata } from "next";
import { discoverMovies } from "@/services/movieApi";
import SectionHeading from "@/components/SectionHeading";
import GenreChips from "@/components/GenreChips";
import SortSelect from "@/components/SortSelect";
// ADVANCED FILTERING (new): year-range + minimum-rating controls, alongside
// the existing genre chips and sort dropdown.
import FilterPanel from "@/components/FilterPanel";
// INFINITE SCROLLING (new): replaces the plain MovieGrid — renders the
// first page immediately (server-rendered, exactly as before) and then
// fetches more pages itself as the user scrolls.
import InfiniteMovieGrid from "@/components/InfiniteMovieGrid";
import { GENRE_NAMES } from "@/utils/movieMeta";

// Just like src/app/search/page.tsx, Next.js hands this Server Component
// its query-string values directly as a prop called "searchParams" — no
// hook needed, because this whole function runs on the server BEFORE
// anything is sent to the browser. It's a Promise because Next.js 15
// resolves it asynchronously alongside the rest of the page's data.
type GenrePageProps = {
  searchParams: Promise<{
    genre?: string;
    sort?: string;
    // ADVANCED FILTERING (new) — all arrive as strings, same as every other
    // URL search param, and get converted to numbers below.
    yearFrom?: string;
    yearTo?: string;
    minRating?: string;
  }>;
};

// SEO METADATA (new): gives each genre its own browser-tab title —
// "Action movies | Movie Explorer" instead of every /genres URL sharing the
// exact same generic title regardless of which genre is selected.
export async function generateMetadata({
  searchParams,
}: GenrePageProps): Promise<Metadata> {
  const params = await searchParams;
  const genreId = params.genre ? Number(params.genre) : undefined;
  const genreName = genreId != null ? GENRE_NAMES[genreId] : undefined;

  return {
    title: genreName ? `${genreName} movies` : "Browse by genre",
    description: genreName
      ? `Browse ${genreName.toLowerCase()} movies, filterable by year and rating.`
      : "Browse the full movie catalogue by genre, release year, and rating.",
  };
}

export default async function GenresPage({ searchParams }: GenrePageProps) {
  const params = await searchParams;

  // The URL only ever stores strings ("?genre=28"), so we convert it back
  // to a number here. If it's missing or not a valid number, genreId ends
  // up undefined, which discoverMovies() treats as "no genre filter".
  const genreId = params.genre ? Number(params.genre) : undefined;
  const sort = params.sort;
  const yearFrom = params.yearFrom ? Number(params.yearFrom) : undefined;
  const yearTo = params.yearTo ? Number(params.yearTo) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;

  const genreName = genreId != null ? GENRE_NAMES[genreId] : undefined;

  const data = await discoverMovies({ genreId, sortBy: sort, yearFrom, yearTo, minRating });

  // Everything InfiniteMovieGrid needs to ask the /api/movies/discover
  // route for page 2, 3, 4... — built once here (as plain strings, since
  // that's what ends up in a URL) rather than inside the client component,
  // keeping "how does a discover query get built" defined in ONE place per
  // concept (URL params here, TMDB params inside discoverMovies itself).
  const infiniteScrollParams: Record<string, string> = {};
  if (genreId != null) infiniteScrollParams.genre = String(genreId);
  if (sort) infiniteScrollParams.sort = sort;
  if (yearFrom != null) infiniteScrollParams.yearFrom = String(yearFrom);
  if (yearTo != null) infiniteScrollParams.yearTo = String(yearTo);
  if (minRating != null) infiniteScrollParams.minRating = String(minRating);

  return (
    <main>
      <SectionHeading
        kicker="Browse"
        title={genreName ? `${genreName} movies` : "Browse by genre"}
      />

      {/* All three controls read/write the SAME URL, so they always agree
          with each other — pick a genre, then change sort or a filter, and
          the other choices stay selected because each control copies the
          existing params instead of overwriting the whole query string. */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <GenreChips activeGenreId={genreId} sort={sort} />
        <SortSelect />
      </div>
      <FilterPanel />

      {data.results.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No movies found for this filter combination.
        </p>
      ) : (
        // The "key" prop here is doing important work: whenever the genre,
        // sort, or any filter changes, this whole search-param string
        // changes too, which makes React treat it as a BRAND NEW component
        // instance instead of updating the existing one — resetting
        // InfiniteMovieGrid's internal accumulated list back to just this
        // fresh page 1, instead of appending onto stale results from the
        // PREVIOUS filter selection.
        <InfiniteMovieGrid
          key={new URLSearchParams(infiniteScrollParams).toString()}
          initialMovies={data.results}
          initialPage={data.page}
          totalPages={data.total_pages}
          endpoint="/api/movies/discover"
          queryParams={infiniteScrollParams}
        />
      )}
    </main>
  );
}
