import Link from "next/link";
import { GENRE_LIST } from "@/utils/movieMeta";

type GenreChipsProps = {
  // Which genre id is currently selected, or undefined for "All".
  activeGenreId?: number;
  // The current sort value, so switching genres doesn't accidentally reset
  // the user's chosen sort order back to the default.
  sort?: string;
};

// NOTE ON APPROACH: this component needs no "use client", no useState, and
// no onClick handlers at all. Every chip is just a plain <Link> pointing to
// a slightly different URL (?genre=28 vs ?genre=12). Clicking a normal link
// IS how you "navigate" in the URL-as-source-of-truth pattern — you don't
// always need router.push()/useRouter() in JavaScript; sometimes an <a>
// tag already does the whole job, and Next.js's <Link> makes that
// navigation fast (no full page reload) automatically.
export default function GenreChips({ activeGenreId, sort }: GenreChipsProps) {
  // Rebuilds the query string for one chip, keeping "sort" if one is set.
  function chipHref(genreId?: number) {
    const params = new URLSearchParams();
    if (genreId != null) params.set("genre", String(genreId));
    if (sort) params.set("sort", sort);
    const query = params.toString();
    return query ? `/genres?${query}` : "/genres";
  }

  return (
    <div
      role="list"
      aria-label="Filter by genre"
      className="mb-6 flex flex-wrap gap-2"
    >
      {/* The "All" chip clears the genre filter entirely (no ?genre= param
          at all), while keeping whatever sort was already chosen. */}
      <Link
        href={chipHref(undefined)}
        role="listitem"
        aria-current={activeGenreId == null ? "true" : undefined}
        className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
          activeGenreId == null
            ? "border-burgundy bg-burgundy text-stamp"
            : "border-rule bg-paper-raised text-ink-soft hover:text-ink"
        }`}
      >
        All
      </Link>

      {GENRE_LIST.map((genre) => {
        const isActive = genre.id === activeGenreId;
        return (
          <Link
            key={genre.id}
            href={chipHref(genre.id)}
            role="listitem"
            // aria-current tells assistive tech which chip is the
            // "currently selected" one, similar to how a browser tab strip
            // marks the active tab — same idea as aria-pressed on the
            // favorite button, just the version meant for a group of
            // mutually-exclusive options instead of a single on/off toggle.
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
              isActive
                ? "border-burgundy bg-burgundy text-stamp"
                : "border-rule bg-paper-raised text-ink-soft hover:text-ink"
            }`}
          >
            {genre.name}
          </Link>
        );
      })}
    </div>
  );
}
