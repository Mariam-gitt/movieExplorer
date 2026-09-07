# New Features — Code Flow

This file explains, feature by feature, how the new code fits together and
which files are involved. Pair it with `NEW_FEATURES_QA.md` for viva-style
questions and answers about the same code.

**Status:** 6 of the 7 requested features are implemented, tested (`tsc`,
`eslint`, `vitest` all pass), and working. **E2E tests were NOT added** —
see the note at the very bottom for why, and what to do instead.

---

## 1. Recently viewed movies

**Files:** `utils/recentlyViewed.ts`, `components/RecordRecentlyViewed.tsx`,
`components/RecentlyViewedPreview.tsx`, `app/recently-viewed/page.tsx`.

Flow:
1. `RecordRecentlyViewed` is rendered inside `movies/[id]/page.tsx` (the movie
   details page) and given the current `movieId` as a prop.
2. It's a Client Component with a `useEffect` — on mount (and whenever
   `movieId` changes, e.g. clicking from one "Similar movies" card straight
   into another), it calls `recordMovieViewed(movieId)`.
3. `recordMovieViewed` reads the current list from `localStorage`, moves the
   id to the front (or adds it), trims it to 20 entries, saves it back, and
   fires a custom `recently-viewed-changed` browser event.
4. `RecentlyViewedPreview` (on the homepage) and the `/recently-viewed` page
   both use `useSyncExternalStore` subscribed to that event, so both update
   instantly the moment a new movie is recorded — no polling, no manual
   refresh.

This is a **deliberate structural copy** of how `utils/favorites.ts` /
`FavoriteButton.tsx` / `FavoritesPreview.tsx` already worked — same
localStorage + custom-event pattern, just a different key and no "on/off
toggle" (viewing is automatic, not something the user clicks).

## 2. SEO metadata

**Files:** `app/layout.tsx`, `app/movies/[id]/page.tsx`, `app/genres/page.tsx`,
`app/search/page.tsx`.

- `layout.tsx` now sets a `title.template` ("%s | Movie Explorer") and a
  default `openGraph`/`metadataBase`. Every other page's title is
  automatically wrapped with that suffix.
- `movies/[id]/page.tsx`, `genres/page.tsx`, and `search/page.tsx` each
  export an **async `generateMetadata` function**. Next.js calls this on the
  server, separately from the page component itself, before sending HTML to
  the browser — so the `<title>` and `<meta description>` tags are already
  correct in the very first HTML response (good for both SEO crawlers and
  the "flash of wrong title" problem).
- The movie details page's metadata also sets `openGraph.images` to the
  movie's poster, so pasting a movie link into WhatsApp/Slack/Twitter shows
  a real preview card instead of a bare link.

## 3. Sort by rating / release date / popularity

**File:** `components/SortSelect.tsx` (already existed for `/genres`,
generalized here).

The only change: it used to hardcode `router.push('/genres?...')`. It now
calls `usePathname()` and pushes to whatever page it's actually rendered on
— which is what let the exact same component be reused, unmodified, on the
`/search` page too.

## 4. Advanced filtering (year range + minimum rating)

**File:** `components/FilterPanel.tsx` (new), `utils/movieMeta.ts`
(`filterMoviesByYearAndRating`), `services/movieApi.ts` (`discoverMovies`
gained `yearFrom`/`yearTo`/`minRating` options).

Two different filtering strategies exist, depending on which TMDB endpoint
a page uses:

- **`/genres` (uses TMDB's `discover` endpoint):** TMDB itself supports
  `primary_release_date.gte`/`.lte` and `vote_average.gte` query params, so
  `discoverMovies()` just adds them to the request. TMDB does the filtering
  — the app never sees unfiltered results at all.
- **`/search` (uses TMDB's plain `search/movie` endpoint):** this endpoint
  has NO filter params at all — it can only search by title. So
  `search/page.tsx` fetches results normally, then calls
  `filterMoviesByYearAndRating()` and `sortMovies()` itself, in plain
  JavaScript, on the array TMDB already returned.

`FilterPanel` itself doesn't know or care which strategy is in play — like
`SortSelect`, its only job is reading/writing the URL's `yearFrom`/`yearTo`/
`minRating` params (with a 500ms debounce on the year inputs, so each
keystroke doesn't trigger a navigation).

## 5. URL-based search/filter state

Not a separate file — this is the *pattern* every control above already
follows: `GenreChips`, `SortSelect`, and `FilterPanel` all read the current
value from `useSearchParams()` and write new values via
`router.push(pathname + '?' + newParams)`, always copying the existing
params first. This means:
- Refreshing the page shows the exact same filtered/sorted view.
- Sharing a `/genres?genre=28&sort=vote_average.desc&minRating=7` link
  reproduces that exact view for anyone else.
- The page components (`genres/page.tsx`, `search/page.tsx`) read these same
  params server-side (as the `searchParams` prop) to run the actual
  TMDB query — the URL is the single source of truth on both ends.

## 6. Infinite scrolling

**Files:** `components/InfiniteMovieGrid.tsx` (new),
`app/api/movies/discover/route.ts`, `app/api/movies/search/route.ts` (new
API routes), `services/movieApi.ts` (`page` param added to `discoverMovies`
and `searchMovies`).

Flow:
1. The server-rendered page (`genres/page.tsx` or `search/page.tsx`) fetches
   **page 1** as before and renders it immediately — no loading spinner for
   the first screenful.
2. That page 1 array, plus the total page count TMDB reported, is passed
   into `<InfiniteMovieGrid>` as props.
3. `InfiniteMovieGrid` places an invisible `<div>` ("sentinel") right after
   the grid and watches it with an `IntersectionObserver` — a browser API
   that reports when an element scrolls into view, far cheaper than
   listening to every `scroll` event manually.
4. When the sentinel becomes visible (with a 400px head start, so loading
   finishes before the user notices a gap), it `fetch()`es the next page
   from a **same-origin API route** (`/api/movies/discover` or
   `/api/movies/search`) — never directly from the browser to TMDB, keeping
   the same pattern the existing `getMovieDetails()` already used for CORS
   reasons.
5. New results are appended to the existing array (never replacing it), so
   already-visible cards never move or flicker.
6. Each page (`genres`/`search`) gives `InfiniteMovieGrid` a `key` built
   from the current filters/sort/query — changing any filter mounts a
   *brand new* `InfiniteMovieGrid` instance instead of appending onto
   results from the previous filter selection.

## 7. Keyboard-friendly search

**File:** `components/SearchBar.tsx` (rewritten).

Three separate keyboard behaviours, all in one component:

1. **Global `/` shortcut** — a `window`-level `keydown` listener (added in a
   `useEffect`) focuses the search input when `/` is pressed anywhere on the
   page, as long as the user isn't already typing somewhere else.
2. **Suggestions dropdown** — as the user types, a debounced (300ms) fetch
   to `/api/movies/search` returns up to 6 matching titles, shown in a
   dropdown below the input.
3. **Arrow-key navigation** — `ArrowDown`/`ArrowUp` move a highlighted index
   through the suggestions (wrapping around both ends), `Enter` opens the
   highlighted suggestion (or runs a normal search if nothing's
   highlighted), and `Escape` closes the dropdown (or clears the box if it's
   already closed).

The whole thing follows the **ARIA "combobox" pattern** — `role="combobox"`
on the input, `role="listbox"`/`role="option"` on the dropdown, and
`aria-activedescendant` pointing at whichever option is highlighted — so a
screen reader announces the same information a sighted keyboard user sees.

---

## What was NOT done: E2E tests

Playwright (or Cypress) needs to download real browser binaries the first
time it's installed, from a CDN that isn't reachable from the sandbox this
was built in — so any E2E test file written here couldn't actually be run
or verified before handing it to you, and I didn't want to hand you tests
I hadn't confirmed pass. Rather than ship untested "maybe it works" test
files as if they were done, I'm flagging this honestly as the one feature
left. If you want, next time I can still write the Playwright config +
test files for you to run locally with `npx playwright install` — just ask.
