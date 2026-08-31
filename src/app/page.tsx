import Image from "next/image";
import Link from "next/link";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "@/services/movieApi";
import MovieGrid from "@/components/MovieGrid";
import SectionHeading from "@/components/SectionHeading";
import { getMovieYear, posterUrl } from "@/utils/movieMeta";

export default async function Home() {
  const trending = await getTrendingMovies();
  const popular = await getPopularMovies();
  const topRated = await getTopRatedMovies();
  const upcoming = await getUpcomingMovies();
  const nowPlaying = await getNowPlayingMovies();

  const featuredMovie = trending.results[0];
  const featuredPoster = featuredMovie
    ? posterUrl(featuredMovie.poster_path)
    : null;
  const featuredYear = featuredMovie
    ? getMovieYear(featuredMovie.release_date)
    : null;

  return (
    <main>
      {featuredMovie ? (
        <section className="mb-14 border border-rule bg-paper-raised p-4 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Now screening
          </p>
          <div className="mt-4 grid items-start gap-8 md:grid-cols-[240px_1fr]">
            <Link href={`/movies/${featuredMovie.id}`} className="block">
              <div className="relative aspect-[2/3] overflow-hidden border border-rule bg-stamp">
                {featuredPoster ? (
                  <Image
                    src={featuredPoster}
                    alt={`${featuredMovie.title} poster`}
                    fill
                    priority
                    sizes="240px"
                    className="object-cover"
                  />
                ) : null}
              </div>
            </Link>

            <div className="flex min-h-full flex-col">
              <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
                {featuredMovie.title}
              </h1>
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                {[featuredYear, featuredMovie.vote_average.toFixed(1)]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {featuredMovie.overview}
              </p>
              <div className="mt-8">
                <Link
                  href={`/movies/${featuredMovie.id}`}
                  className="inline-block border border-burgundy bg-burgundy px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stamp hover:bg-burgundy-deep"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-12">
        <SectionHeading kicker="This week" title="Trending movies" />
        <MovieGrid movies={trending.results} />
      </section>

      <section className="mb-12">
        <SectionHeading kicker="Audience" title="Popular movies" />
        <MovieGrid movies={popular.results} />
      </section>

      <section className="mb-12">
        <SectionHeading kicker="Critics" title="Top rated movies" />
        <MovieGrid movies={topRated.results} />
      </section>

      <section className="mb-12">
        <SectionHeading kicker="Coming soon" title="Upcoming movies" />
        <MovieGrid movies={upcoming.results} />
      </section>

      <section>
        <SectionHeading kicker="In theatres" title="Now playing" />
        <MovieGrid movies={nowPlaying.results} />
      </section>
    </main>
  );
}
