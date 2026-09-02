import { discoverMovies } from "@/services/movieApi";
import MovieGrid from "@/components/MovieGrid";
import SectionHeading from "@/components/SectionHeading";
import GenreChips from "@/components/GenreChips";
import SortSelect from "@/components/SortSelect";
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
  }>;
};

export default async function GenresPage({ searchParams }: GenrePageProps) {
  const params = await searchParams;

  // The URL only ever stores strings ("?genre=28"), so we convert it back
  // to a number here. If it's missing or not a valid number, genreId ends
  // up undefined, which discoverMovies() treats as "no genre filter".
  const genreId = params.genre ? Number(params.genre) : undefined;
  const sort = params.sort;

  const genreName = genreId != null ? GENRE_NAMES[genreId] : undefined;

  const data = await discoverMovies({ genreId, sortBy: sort });

  return (
    <main>
      <SectionHeading
        kicker="Browse"
        title={genreName ? `${genreName} movies` : "Browse by genre"}
      />

      {/* Both controls read/write the SAME URL, so they always agree with
          each other — pick a genre, then change sort, and the genre chip
          stays selected because SortSelect copies the existing params
          instead of overwriting the whole query string. */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <GenreChips activeGenreId={genreId} sort={sort} />
        <SortSelect />
      </div>

      {data.results.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No movies found for this filter combination.
        </p>
      ) : (
        <MovieGrid movies={data.results} />
      )}
    </main>
  );
}
