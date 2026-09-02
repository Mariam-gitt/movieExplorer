"use client"; // A <select onChange> needs to run JS in the browser, so
// (unlike GenreChips, which was plain <Link>s) this one has to be a client
// component.

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "vote_average.desc", label: "Highest rated" },
  { value: "primary_release_date.desc", label: "Newest first" },
  { value: "primary_release_date.asc", label: "Oldest first" },
];

export default function SortSelect() {
  // useRouter gives us .push(), which is how we WRITE a new URL — this is
  // the "navigate/push a new URL" step from earlier. Clicking a genre chip
  // did this job with a plain <Link>; a <select>'s onChange event has no
  // built-in way to navigate, so here we have to call it ourselves.
  const router = useRouter();
  // useSearchParams gives us READ access to the current URL's query string
  // — this is how the component knows which option should show as already
  // selected when the page first loads (e.g. after a refresh).
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? SORT_OPTIONS[0].value;

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // Copy the EXISTING params (so we don't lose ?genre=28 if one is set)
    // and only overwrite the "sort" key. This is the same "keep everything
    // else, change one thing" pattern as the favorites list update in
    // FavoriteButton.tsx — just applied to URL params instead of an array.
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", event.target.value);
    router.push(`/genres?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      Sort by
      <select
        value={currentSort}
        onChange={handleChange}
        className="rounded-full border border-rule bg-paper-raised px-3 py-1.5 text-sm font-semibold text-ink"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
