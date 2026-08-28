import { getMovieDetails } from "@/services/movieApi";

type MovieDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params;

  const movie = await getMovieDetails(id);

  return (
    <main>
      <h1>{movie.title}</h1>

      <p>{movie.overview}</p>

      <p>⭐ {movie.vote_average.toFixed(1)}</p>

      <p>Release date: {movie.release_date}</p>
    </main>
  );
}