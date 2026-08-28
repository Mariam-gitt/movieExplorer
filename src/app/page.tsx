
import {
  getPopularMovies,
  getTrendingMovies,
  getTopRatedMovies,
} from "@/services/movieApi";

import MovieGrid from "@/components/MovieGrid";

export default async function Home() {
  const popular = await getPopularMovies();
  const trending = await getTrendingMovies();
  const topRated = await getTopRatedMovies();

  return (
    <main>
      <section>
        <h1>Trending Movies</h1>
        <MovieGrid movies={trending.results} />
      </section>

      <section>
        <h1>Popular Movies</h1>
        <MovieGrid movies={popular.results} />
      </section>

      <section>
        <h1>Top Rated Movies</h1>
        <MovieGrid movies={topRated.results} />
      </section>
    </main>
  );
}