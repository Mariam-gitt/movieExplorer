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
import FavoriteButton from "@/components/FavoriteButton";
import FavoritesPreview from "@/components/FavoritesPreview";
import { getMovieYear, posterUrl, backdropUrl } from "@/utils/movieMeta";
import type { Movie, MovieResponse } from "@/types/movie";

// A small shape we normalise every category into, so the rest of this file
// doesn't need to care WHY a category is empty (no results vs. a network
// error) — it just checks "failed" and "results".
type CategoryResult = {
  results: Movie[];
  failed: boolean;
};

// Turns the outcome of one TMDB request into a CategoryResult. This is the
// key fix for "the sections don't show up": previously this page used plain
// `await`, so if EVEN ONE category's fetch failed (e.g. a missing/invalid
// TMDB API key), Next.js would throw and render the whole-page error screen
// instead of the homepage — hiding every section, not just the broken one.
function toCategoryResult(
  settled: PromiseSettledResult<MovieResponse>
): CategoryResult {
  if (settled.status === "fulfilled") {
    return { results: settled.value.results, failed: false };
  }
  // Log the real error to the server console so it's easy to diagnose
  // (e.g. "401 Unauthorized" means the API key env var is missing/wrong),
  // without crashing the page for visitors.
  console.error("Failed to load a movie category:", settled.reason);
  return { results: [], failed: true };
}

// Picks the first movie available across a priority list of categories, used
// to choose which movie to feature in the big hero banner even if the
// top-priority category (Trending) happens to have failed or been empty.
function pickFeatured(categories: CategoryResult[]): Movie | null {
  for (const category of categories) {
    if (category.results[0]) return category.results[0];
  }
  return null;
}

export default async function Home() {
  // Promise.allSettled runs all five requests IN PARALLEL (much faster than
  // one-by-one) and — unlike Promise.all — never rejects: it waits for every
  // promise to either succeed ("fulfilled") or fail ("rejected") and gives
  // us the outcome of each individually, so one bad request can't take the
  // other four down with it.
  const settledResults = await Promise.allSettled([
    getTrendingMovies(),
    getPopularMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getNowPlayingMovies(),
  ]);

  const [trending, popular, topRated, upcoming, nowPlaying] =
    settledResults.map(toCategoryResult);

  // The movie shown in the big hero banner: prefer Trending, then fall back
  // down the list so the hero still has something to show even if the
  // trending endpoint specifically is having a bad day.
  const featuredMovie = pickFeatured([trending, popular, topRated, nowPlaying]);
  const featuredBackdrop = featuredMovie
    ? backdropUrl(featuredMovie.backdrop_path)
    : null;
  const featuredPoster = featuredMovie
    ? posterUrl(featuredMovie.poster_path)
    : null;
  const featuredYear = featuredMovie
    ? getMovieYear(featuredMovie.release_date)
    : null;

  // A short list for the compact "Now Playing" column next to the hero,
  // mirroring the "New Trailer" list from the reference design.
  const nowPlayingPreview = nowPlaying.results.slice(0, 4);

  return (
    <main>
      {/* If every single category failed (e.g. the API key env var isn't
          set at all), show one clear, friendly explanation instead of five
          separate error boxes. */}
      {trending.failed &&
      popular.failed &&
      topRated.failed &&
      upcoming.failed &&
      nowPlaying.failed ? (
        <div className="mb-8 rounded-2xl border border-rule bg-paper-raised p-6">
          <p className="font-display text-xl font-bold text-ink">
            Movies couldn&apos;t be loaded
          </p>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            This usually means the TMDB API key isn&apos;t set. Add{" "}
            <code className="rounded bg-paper px-1.5 py-0.5 text-ink">
              NEXT_PUBLIC_TMDB_API_KEY
            </code>{" "}
            to a <code className="rounded bg-paper px-1.5 py-0.5 text-ink">.env.local</code> file
            at the project root, then restart the dev server.
          </p>
        </div>
      ) : null}

      {/* Top area: compact "Now Playing" list on the left, big hero card on
          the right — collapses to a single column on small screens. */}
      <div className="mb-10 grid gap-4 md:grid-cols-[260px_1fr]">
        {/* Compact list column — only rendered if we actually have data. */}
        {nowPlayingPreview.length > 0 ? (
          <div className="rounded-2xl border border-rule bg-paper-raised p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wide text-gold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              Now Playing
            </p>
            <ul className="space-y-3">
              {nowPlayingPreview.map((movie) => {
                const thumb = posterUrl(movie.poster_path, "w185");
                return (
                  <li key={movie.id}>
                    <Link
                      href={`/movies/${movie.id}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-stamp">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-ink group-hover:text-gold">
                          {movie.title}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {getMovieYear(movie.release_date) ?? "—"}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {/* Big hero card. Only rendered if we managed to find a movie to
            feature at all. */}
        {featuredMovie ? (
          <section className="relative overflow-hidden rounded-2xl border border-rule bg-ink">
            {/* Backdrop image, if TMDB gave us one, sitting behind everything. */}
            {featuredBackdrop ? (
              <Image
                src={featuredBackdrop}
                alt=""
                fill
                priority
                sizes="900px"
                className="object-cover opacity-60"
              />
            ) : null}
            {/* Dark gradient over the backdrop so white text stays readable
                no matter how bright the underlying image is. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            <div className="relative flex h-full flex-col justify-end gap-4 p-5 sm:p-8">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                🔥 Now Trending
              </span>
              <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {featuredMovie.title}
              </h1>
              <p className="text-sm font-semibold text-white/80">
                {[featuredYear, featuredMovie.vote_average.toFixed(1)]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
              <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {featuredMovie.overview}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Link
                  href={`/movies/${featuredMovie.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/90"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
                  </svg>
                  Watch
                </Link>
                {/* Reuses the same favorite toggle used on every card, just
                    sized up a little to sit comfortably next to the Watch
                    button. */}
                <span className="[&_button]:h-10 [&_button]:w-10 [&_svg]:h-5 [&_svg]:w-5">
                  <FavoriteButton movie={featuredMovie} />
                </span>
              </div>
            </div>

            {/* Tiny poster thumbnail tucked in the corner — a small nod to
                the poster-plus-backdrop layout in the reference design. */}
            {featuredPoster ? (
              <div className="absolute right-5 top-5 hidden h-24 w-16 overflow-hidden rounded-lg border-2 border-white/30 shadow-lg sm:block">
                <Image
                  src={featuredPoster}
                  alt={`${featuredMovie.title} poster`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* Your saved movies (if any) — renders nothing when the list is empty. */}
      <FavoritesPreview />

      {/* Each section below gets a matching "id" so the sidebar icons and
          navbar category tabs (which link to "/#trending" etc.) scroll
          straight to it. */}
      <CategorySection
        id="trending"
        kicker="This week"
        title="Trending movies"
        category={trending}
      />
      <CategorySection
        id="popular"
        kicker="Audience"
        title="Popular movies"
        category={popular}
      />
      <CategorySection
        id="top-rated"
        kicker="Critics"
        title="Top rated movies"
        category={topRated}
      />
      <CategorySection
        id="upcoming"
        kicker="Coming soon"
        title="Upcoming movies"
        category={upcoming}
      />
      <CategorySection
        id="now-playing"
        kicker="In theatres"
        title="Now playing"
        category={nowPlaying}
      />
    </main>
  );
}

// A small local component (only used on this page) that renders one section:
// a heading, then either the movie grid, an inline error notice, or nothing
// (if the category loaded fine but genuinely has zero results).
function CategorySection({
  id,
  kicker,
  title,
  category,
}: {
  id: string;
  kicker: string;
  title: string;
  category: CategoryResult;
}) {
  // "scroll-mt-24" adds top margin ONLY when this element is the target of
  // an anchor-link jump (like clicking a sidebar icon) — it stops the sticky
  // navbar from covering the top of the section when the browser scrolls to it.
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <SectionHeading kicker={kicker} title={title} />
      {category.failed ? (
        <p className="rounded-xl border border-rule bg-paper-raised p-4 text-sm text-ink-soft">
          Couldn&apos;t load this section right now. Check your TMDB API key and
          try refreshing the page.
        </p>
      ) : category.results.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing here yet.</p>
      ) : (
        <MovieGrid movies={category.results} />
      )}
    </section>
  );
}
