import type { Metadata } from "next";
import { searchMovies } from "@/services/movieApi";
import SectionHeading from "@/components/SectionHeading";
// SORT + ADVANCED FILTERING (new): the same two controls already used on
// /genres, reused here — both just read/write URL params, so they work on
// any page without modification (see the "usePathname" comment inside
// SortSelect.tsx for why that reuse is now possible).
import SortSelect from "@/components/SortSelect";
import FilterPanel from "@/components/FilterPanel";
// INFINITE SCROLLING (new): same component /genres uses.
import InfiniteMovieGrid from "@/components/InfiniteMovieGrid";
import { filterMoviesByYearAndRating, sortMovies } from "@/utils/movieMeta";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    yearFrom?: string;
    yearTo?: string;
    minRating?: string;
  }>;
};

// SEO METADATA (new): the browser tab (and any search engine result) now
// shows the actual searched title, e.g. "Titles matching “batman”", instead
// of every /search URL sharing one generic title no matter what was typed.
export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: params.q ? `Results for “${params.q}”` : "Search movies",
    description: params.q
      ? `Movies matching “${params.q}”, filterable by year and rating.`
      : "Search the full TMDB movie catalogue by title.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q;
  const sort = params.sort;
  const yearFrom = params.yearFrom ? Number(params.yearFrom) : undefined;
  const yearTo = params.yearTo ? Number(params.yearTo) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;

  if (!query) {
    return (
      <main>
        <SectionHeading kicker="Catalogue" title="Search movies" />
        <p className="max-w-xl text-lg text-ink-soft">
          Enter a title in the masthead to look up a film. Try a specific name
          rather than a genre.
        </p>
      </main>
    );
  }

  const data = await searchMovies(query);

  // TMDB's plain search endpoint (unlike "discover", which /genres uses)
  // has no built-in year/rating/sort query params at all — it can only
  // search by title. So this page applies the SAME filtering/sorting logic
  // itself, in plain JavaScript, on the results TMDB already sent back.
  const clientFilter = { yearFrom, yearTo, minRating };
  const filteredResults = filterMoviesByYearAndRating(data.results, clientFilter);
  const sortedResults = sortMovies(filteredResults, sort);

  if (sortedResults.length === 0) {
    return (
      <main>
        <SectionHeading
          kicker="No print"
          title={`Nothing found for “${query}”`}
        />
        <p className="max-w-xl text-lg text-ink-soft">
          That title is not in this programme, or nothing matched your
          current filters. Check the spelling, or clear a filter and try
          again.
        </p>
      </main>
    );
  }

  // Every param InfiniteMovieGrid needs to ask /api/movies/search for page
  // 2, 3, 4... of THIS exact query — built once here as plain strings.
  const infiniteScrollParams: Record<string, string> = { q: query };

  return (
    <main>
      <SectionHeading
        kicker="Search results"
        title={`Titles matching “${query}”`}
      />

      <div className="mb-2 flex flex-wrap items-center justify-end gap-4">
        <SortSelect />
      </div>
      <FilterPanel />

      {/* Same "key" trick as /genres: a new query, sort, or filter value
          changes this string, which makes React mount a FRESH
          InfiniteMovieGrid instead of appending onto results from the
          previous search/filter combination. */}
      <InfiniteMovieGrid
        key={`${query}-${sort ?? ""}-${yearFrom ?? ""}-${yearTo ?? ""}-${minRating ?? ""}`}
        initialMovies={sortedResults}
        initialPage={data.page}
        totalPages={data.total_pages}
        endpoint="/api/movies/search"
        queryParams={infiniteScrollParams}
        clientFilter={clientFilter}
        clientSort={sort}
      />
    </main>
  );
}
