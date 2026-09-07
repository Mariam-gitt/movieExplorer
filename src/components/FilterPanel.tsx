"use client"; // Text inputs with onChange + router navigation both need the
// browser, so — like SortSelect.tsx right next to it — this has to be a
// Client Component.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

// ADVANCED FILTERING (new): lets the user narrow results down by release
// year range and a minimum rating, on top of the existing genre (GenreChips)
// and sort (SortSelect) controls. Like those two, this component's only
// job is to read/write the URL's query string — it doesn't fetch or filter
// any movies itself; the page that renders it (genres/page.tsx or
// search/page.tsx) is the one that actually reads these params back out
// and uses them.
export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // These two fields are read directly from the current URL every render,
  // so refreshing the page (or sharing the URL with someone else) always
  // shows the filter values that are ACTUALLY in effect — this is the
  // "URL is the single source of truth" pattern, same as SortSelect.
  const yearFrom = searchParams.get("yearFrom") ?? "";
  const yearTo = searchParams.get("yearTo") ?? "";
  const minRating = searchParams.get("minRating") ?? "";

  // Local, un-submitted draft values for the two year inputs. Typing a year
  // updates ONLY this local state on every keystroke (cheap, no navigation)
  // — the URL (and therefore the actual filtered results) only updates once
  // the user finishes typing, via the debounce effect below. Without this,
  // every single keystroke would trigger a full navigation + re-fetch.
  const [draftYearFrom, setDraftYearFrom] = useState(yearFrom);
  const [draftYearTo, setDraftYearTo] = useState(yearTo);

  // Pushes a new URL with the given params merged over the current ones —
  // shared by every control in this panel so they all follow the exact
  // same "keep everything else, change these keys" rule as SortSelect.
  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      // A null/empty value means "remove this filter" — e.g. clearing the
      // year field should drop "yearFrom" from the URL entirely, not leave
      // behind an empty "yearFrom=".
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  // Debounce: wait 500ms after the user STOPS typing before actually
  // navigating. Typing "2010" one keystroke at a time would otherwise fire
  // four separate navigations/re-fetches ("2", "20", "201", "2010") instead
  // of just one.
  function handleYearFromChange(value: string) {
    setDraftYearFrom(value);
    scheduleYearUpdate({ yearFrom: value || null });
  }

  function handleYearToChange(value: string) {
    setDraftYearTo(value);
    scheduleYearUpdate({ yearTo: value || null });
  }

  // useRef holds a mutable value ("the id of the pending timer") that
  // survives across re-renders WITHOUT itself triggering a re-render when
  // it changes — exactly what's needed here, since updating a countdown
  // timer's id has nothing to do with what's on screen.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleYearUpdate(update: Record<string, string | null>) {
    // Cancel any previous pending update — only the LAST keystroke within
    // the 500ms window should ever actually navigate.
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => updateParams(update), 500);
  }

  return (
    <div
      role="group"
      aria-label="Advanced filters"
      className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-rule bg-paper-raised p-4"
    >
      <label className="flex flex-col gap-1 text-sm font-semibold text-ink-soft">
        From year
        <input
          type="number"
          inputMode="numeric"
          placeholder="e.g. 2000"
          value={draftYearFrom}
          onChange={(event) => handleYearFromChange(event.target.value)}
          className="w-28 rounded-full border border-rule bg-paper px-3 py-1.5 text-sm text-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-ink-soft">
        To year
        <input
          type="number"
          inputMode="numeric"
          placeholder="e.g. 2024"
          value={draftYearTo}
          onChange={(event) => handleYearToChange(event.target.value)}
          className="w-28 rounded-full border border-rule bg-paper px-3 py-1.5 text-sm text-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-ink-soft">
        Minimum rating
        <select
          value={minRating}
          onChange={(event) =>
            updateParams({ minRating: event.target.value || null })
          }
          className="w-32 rounded-full border border-rule bg-paper px-3 py-1.5 text-sm text-ink"
        >
          <option value="">Any</option>
          <option value="5">5+</option>
          <option value="6">6+</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
          <option value="9">9+</option>
        </select>
      </label>

      {/* Only worth showing a "Clear" button once at least one filter (of
          the ones THIS panel controls) is actually active. */}
      {yearFrom || yearTo || minRating ? (
        <button
          type="button"
          onClick={() => {
            setDraftYearFrom("");
            setDraftYearTo("");
            updateParams({ yearFrom: null, yearTo: null, minRating: null });
          }}
          className="rounded-full border border-rule px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-burgundy hover:text-burgundy"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
