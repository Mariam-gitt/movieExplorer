import Image from "next/image";
import MovieGrid from "@/components/MovieGrid";
import SectionHeading from "@/components/SectionHeading";
import TrailerButton from "@/components/TrailerButton";
import ShareButton from "@/components/ShareButton";
import {
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getSimilarMovies,
} from "@/services/movieApi";
import { backdropUrl, getMovieYear, posterUrl } from "@/utils/movieMeta";
import type { MovieCredits, MovieResponse, MovieVideosResponse } from "@/types/movie";

type MovieDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params;

  // The movie itself is essential — if this one fails, there's no page to
  // show at all, so it's allowed to throw straight to error.tsx as before.
  const movie = await getMovieDetails(id);

  // Credits, similar movies, and the trailer are all "nice to have" — none
  // of them should be able to take down the rest of the page if TMDB has a
  // hiccup on just one of those three endpoints. Promise.allSettled (the
  // same fix used on the homepage) runs all three in parallel and reports
  // each outcome separately instead of all-or-nothing.
  const [creditsResult, similarResult, videosResult] = await Promise.allSettled([
    getMovieCredits(id),
    getSimilarMovies(id),
    getMovieVideos(id),
  ]);

  const credits: MovieCredits =
    creditsResult.status === "fulfilled" ? creditsResult.value : { cast: [], crew: [] };
  const similar: MovieResponse =
    similarResult.status === "fulfilled"
      ? similarResult.value
      : { page: 1, results: [], total_pages: 0, total_results: 0 };
  const videos: MovieVideosResponse =
    videosResult.status === "fulfilled" ? videosResult.value : { id: movie.id, results: [] };

  // Prefer an official "Trailer", but fall back to any YouTube video TMDB
  // has for this movie (a Teaser, for instance) rather than showing nothing.
  const trailer =
    videos.results.find((video) => video.type === "Trailer" && video.site === "YouTube") ??
    videos.results.find((video) => video.site === "YouTube");

  const director = credits.crew.find(
    (person: { job: string }) => person.job === "Director"
  );
  const year = getMovieYear(movie.release_date);
  // "w780" is a wider TMDB image size than the w500 used on grid cards — the
  // hero poster is displayed much bigger here, so it needs a sharper source
  // image or it would look soft/blurry when stretched up.
  const poster = posterUrl(movie.poster_path, "w780");
  const backdrop = backdropUrl(movie.backdrop_path);
  const genreList = movie.genres ?? [];

  return (
    <main>
      {/* HERO: a tall, full-strength backdrop image with the poster
          overlapping its bottom edge — the negative margin ("-mt-28" etc.)
          on the row below is what pulls the poster up so it visually sits
          ON TOP of the backdrop instead of squeezed beside it. */}
      <section className="relative">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-rule bg-rule/40 sm:h-80 md:h-96">
          {backdrop ? (
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              sizes="1200px"
              className="object-cover object-top"
            />
          ) : null}
          {/* A gradient ONLY at the bottom of the backdrop (not over the
              whole image) — keeps the backdrop itself crisp and vivid, and
              only fades the strip where the poster/title overlap it. */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 to-transparent" />
        </div>

        {/* Poster: significantly larger now (up to 22rem / 352px wide on
            desktop) — a 4px "paper" border frames it like a picture mat,
            separating it from the backdrop behind it, and shadow-2xl lifts
            it visually off the page. */}
        <div className="relative z-10 -mt-28 flex flex-col items-center gap-5 px-2 sm:-mt-40 sm:flex-row sm:items-end sm:px-4 md:-mt-48">
          <div className="relative aspect-[2/3] w-56 shrink-0 overflow-hidden rounded-2xl border-4 border-paper-raised bg-stamp shadow-2xl sm:w-72 md:w-80">
            {poster ? (
              <Image
                src={poster}
                alt={`${movie.title} poster`}
                fill
                priority
                sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, 320px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-sm text-ink-soft">
                No poster
              </div>
            )}
          </div>

          {/* Title sits beside the poster on larger screens, below it on
              mobile. White text here because it overlaps the dark gradient
              at the bottom of the backdrop. */}
          <div className="pb-1 text-center sm:pb-3 sm:text-left">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl">
              {movie.title}
            </h1>
          </div>
        </div>
      </section>

      {/* The "glass window" panel: a frosted, translucent card (the same
          .glass-panel style used on the navbar/sidebar) holding the movie's
          metadata and the trailer button. Because it sits right below the
          backdrop with a slight negative margin, its blur genuinely shows a
          hint of the backdrop image through it — a literal glass window
          onto this movie, not just decoration. */}
      <div className="glass-panel relative z-10 -mt-2 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-rule px-5 py-4 shadow-lg shadow-black/5 sm:justify-start">
        {year ? <Pill>{year}</Pill> : null}
        <Pill>
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-gold" aria-hidden="true">
            <path
              d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z"
              fill="currentColor"
            />
          </svg>
          {movie.vote_average.toFixed(1)}
        </Pill>
        {movie.runtime ? <Pill>{movie.runtime} min</Pill> : null}
        {genreList.map((genre) => (
          <Pill key={genre.id}>{genre.name}</Pill>
        ))}
        {/* Share is always available; the trailer button only renders when
            TMDB actually has a YouTube trailer/teaser for this movie. */}
        <div className="ml-auto flex items-center gap-2">
          <ShareButton title={movie.title} />
          {trailer ? (
            <TrailerButton videoKey={trailer.key} movieTitle={movie.title} />
          ) : null}
        </div>
      </div>

      <section className="mt-8 grid gap-8 md:grid-cols-[1fr_260px]">
        <div>
          <p className="max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {movie.overview}
          </p>
        </div>

        {/* Extra facts in a side card, also given the glass treatment so it
            matches the panel above instead of reading as a plain box. */}
        <dl className="glass-panel grid gap-4 rounded-2xl border border-rule p-5 text-sm sm:grid-cols-2 md:grid-cols-1">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Director
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {director ? director.name : "Unknown"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Release date
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {movie.release_date || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Popularity
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {movie.popularity != null ? movie.popularity.toFixed(0) : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Cast strip: small circular avatars in a horizontally-scrolling
          row, deliberately NOT styled like the movie-poster cards, so it
          reads as "a list of people" rather than "more things to watch". */}
      <section className="mt-12">
        <SectionHeading kicker="Players" title="Cast" />
        {credits.cast.length === 0 ? (
          <p className="text-sm text-ink-soft">Cast information isn&apos;t available right now.</p>
        ) : (
          <ul className="flex gap-5 overflow-x-auto pb-2">
            {credits.cast.slice(0, 12).map((person) => (
              <li key={person.id} className="w-24 shrink-0 text-center">
                <div className="relative mx-auto mb-2 h-24 w-24 overflow-hidden rounded-full border border-rule bg-stamp">
                  {person.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-ink-soft">
                      No photo
                    </div>
                  )}
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-ink">
                  {person.name}
                </p>
                <p className="line-clamp-1 text-xs text-ink-soft">
                  {person.character}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <SectionHeading kicker="If you liked this screening" title="Similar movies" />
        {similar.results.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing similar to show right now.</p>
        ) : (
          <MovieGrid movies={similar.results.slice(0, 6)} />
        )}
      </section>
    </main>
  );
}

// A small local component (only used on this page) rendering one metadata
// chip — kept as a tiny function instead of repeating the same classes six
// times above.
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper-raised/70 px-3 py-1 text-xs font-semibold text-ink">
      {children}
    </span>
  );
}
