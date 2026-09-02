import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/types/movie";
import FavoriteButton from "./FavoriteButton";
import { getMovieGenre, getMovieYear, posterUrl } from "@/utils/movieMeta";

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard({ movie }: MovieCardProps) {
  const year = getMovieYear(movie.release_date);
  const genre = getMovieGenre(movie);
  const poster = posterUrl(movie.poster_path);
  // Number.isFinite guards against NaN/undefined ratings (e.g. a brand new
  // movie with no votes yet) so we show a dash instead of "NaN".
  const rating = Number.isFinite(movie.vote_average)
    ? movie.vote_average.toFixed(1)
    : "–";

  return (
    <article className="movie-card group flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-paper-raised shadow-sm shadow-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10">
      <div className="relative aspect-[2/3] overflow-hidden bg-stamp">
        <Link href={`/movies/${movie.id}`} className="block h-full w-full">
          {poster ? (
            <Image
              src={poster}
              alt={`${movie.title} poster`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-ink-soft">
              No poster
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

          {genre ? (
            <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {genre}
            </span>
          ) : null}

          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-gold" aria-hidden="true">
              <path
                d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z"
                fill="currentColor"
              />
            </svg>
            {rating}
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
              </svg>
            </span>
          </span>
        </Link>

        <div className="absolute right-2 top-2 z-20">
          <FavoriteButton movie={movie} />
        </div>
      </div>

      <Link href={`/movies/${movie.id}`} className="flex min-h-0 flex-1 flex-col gap-1 px-3 pb-3 pt-3">
        <h2 className="line-clamp-1 font-display text-base font-bold leading-snug text-ink">
          {movie.title}
        </h2>
        <p className="text-xs font-medium text-ink-soft">
          {[year].filter(Boolean).join("  ·  ")}
        </p>
      </Link>
    </article>
  );
}
