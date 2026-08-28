import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types/movie";
import FavoriteButton from "./FavoriteButton";

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  return (

          <article>

    <Link href={`/movies/${movie.id}`}>
        {movie.poster_path && (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={200}
            height={300}
          />
        )}

        <h2>{movie.title}</h2>
  
        <p>⭐ {movie.vote_average.toFixed(1)}</p>
        
    </Link>

    
    <FavoriteButton movie={movie} />
      </article>
  );
}



