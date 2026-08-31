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
  const rating = Number.isFinite(movie.vote_average)
    ? movie.vote_average.toFixed(1)
    : "–";

  return (
    <article className="group flex h-full flex-col border border-rule bg-paper-raised p-2 shadow-[3px_3px_0_0_color-mix(in_oklab,var(--ink)_12%,transparent)] transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/movies/${movie.id}`} className="flex min-h-0 flex-1 flex-col">
        <div className="relative aspect-[2/3] overflow-hidden bg-stamp">
          {poster ? (
            <Image
              src={poster}
              alt={`${movie.title} poster`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition duration-300 group-hover:contrast-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-ink-soft">
              No poster
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-1 pb-1 pt-3">
          <h2 className="font-display text-lg leading-snug text-ink">
            {movie.title}
          </h2>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {[year, rating !== "–" ? rating : null, genre]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
          <span className="mt-auto pt-1 text-sm font-semibold text-burgundy underline decoration-rule underline-offset-4 group-hover:decoration-burgundy">
            View details
          </span>
        </div>
      </Link>

      <div className="flex justify-end border-t border-rule/70 px-1 py-2">
        <FavoriteButton movie={movie} />
      </div>
    </article>
  );
}
