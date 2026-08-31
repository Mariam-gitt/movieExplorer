import { searchMovies } from "@/services/movieApi";
import MovieGrid from "@/components/MovieGrid";
import SectionHeading from "@/components/SectionHeading";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q;

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

  if (data.results.length === 0) {
    return (
      <main>
        <SectionHeading
          kicker="No print"
          title={`Nothing found for “${query}”`}
        />
        <p className="max-w-xl text-lg text-ink-soft">
          That title is not in this programme. Check the spelling, or search for
          another film.
        </p>
      </main>
    );
  }

  return (
    <main>
      <SectionHeading
        kicker="Search results"
        title={`Titles matching “${query}”`}
      />
      <MovieGrid movies={data.results} />
    </main>
  );
}
