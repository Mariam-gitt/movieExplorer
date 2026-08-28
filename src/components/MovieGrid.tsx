import type { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";

type MovieGridProps = {
  movies: Movie[];
};

export default function MovieGrid({ movies }: MovieGridProps) {
  return (
    <section>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </section>
  );
}