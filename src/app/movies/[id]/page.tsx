import Image from "next/image";
import MovieGrid from "@/components/MovieGrid";
import SectionHeading from "@/components/SectionHeading";
import {
  getMovieCredits,
  getMovieDetails,
  getSimilarMovies,
} from "@/services/movieApi";
import { backdropUrl, getMovieYear, posterUrl } from "@/utils/movieMeta";

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
  const credits = await getMovieCredits(id);
  const similar = await getSimilarMovies(id);

  const director = credits.crew.find(
    (person: { job: string }) => person.job === "Director"
  );
  const year = getMovieYear(movie.release_date);
  const poster = posterUrl(movie.poster_path);
  const backdrop = backdropUrl(movie.backdrop_path);
  const genres = movie.genres?.map((genre) => genre.name).join(" · ");

  return (
    <main>
      {backdrop ? (
        <div className="relative mb-8 h-40 overflow-hidden border border-rule sm:h-56">
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            sizes="1200px"
            className="object-cover object-top opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper to-transparent" />
        </div>
      ) : null}

      <section className="grid gap-8 md:grid-cols-[240px_1fr]">
        <div className="relative aspect-[2/3] overflow-hidden border border-rule bg-stamp">
          {poster ? (
            <Image
              src={poster}
              alt={`${movie.title} poster`}
              fill
              sizes="240px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-soft">
              No poster
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Program note
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {movie.title}
          </h1>
          <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {[year, genres].filter(Boolean).join("  ·  ")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {movie.overview}
          </p>

          <dl className="mt-8 grid gap-3 border-y border-rule py-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink-soft">
                Rating
              </dt>
              <dd className="mt-1 font-display text-2xl">
                {movie.vote_average.toFixed(1)}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink-soft">
                Runtime
              </dt>
              <dd className="mt-1">{movie.runtime ? `${movie.runtime} min` : "—"}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink-soft">
                Release date
              </dt>
              <dd className="mt-1">{movie.release_date || "—"}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.14em] text-ink-soft">
                Popularity
              </dt>
              <dd className="mt-1">
                {movie.popularity != null ? movie.popularity.toFixed(0) : "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="uppercase tracking-[0.14em] text-ink-soft">
                Director
              </dt>
              <dd className="mt-1">{director ? director.name : "Unknown"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading kicker="Players" title="Cast" />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {credits.cast.slice(0, 10).map((person) => (
            <li
              key={person.id}
              className="border border-rule bg-paper-raised p-2"
            >
              <div className="relative mb-2 aspect-[2/3] overflow-hidden bg-stamp">
                {person.profile_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                    alt={person.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink-soft">
                    No photo
                  </div>
                )}
              </div>
              <p className="font-display text-base leading-snug">{person.name}</p>
              <p className="text-sm text-ink-soft">as {person.character}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeading kicker="If you liked this screening" title="Similar movies" />
        <MovieGrid movies={similar.results.slice(0, 6)} />
      </section>
    </main>
  );
}
