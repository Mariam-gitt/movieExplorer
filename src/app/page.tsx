

import { getPopularMovies } from "@/services/movieApi";

export default async function Home() {
  const data = await getPopularMovies();

  return (
    <main>
      <h1>Popular Movies</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}