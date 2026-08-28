import { searchMovies } from "@/services/movieApi";
import MovieGrid from "@/components/MovieGrid";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q;

  if (!query) {
    return (
      <main>
        <h1>Search Movies</h1>
        <p>Enter a movie name to search.</p>
      </main>
    );
  }

  const data = await searchMovies(query);

  if (data.results.length === 0) {
    return (
      <main>
        <h1>Search results for &quot;{query}&quot;</h1>
        <p>No movies found.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Search results for &quot;{query}&quot;</h1>
      <MovieGrid movies={data.results} />
    </main>
  );
}