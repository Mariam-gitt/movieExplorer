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

### Important code

```ts
export function recordMovieViewed(movieId: number) {
   const current = getRecentlyViewedIds();

   // Put the newest movie first and remove an older duplicate.
   const next = [movieId, ...current.filter((id) => id !== movieId)].slice(0, 20);

   localStorage.setItem("recently-viewed", JSON.stringify(next));

   // Tell components in this tab to read the new list immediately.
   window.dispatchEvent(new Event("recently-viewed-changed"));
}
```

**Simple logic:** When a movie page opens, its id goes to the front of the
list. If the id was already there, it is moved instead of duplicated. Only
the latest 20 ids are kept. The browser event tells the visible lists to
refresh.

The only change: it used to hardcode `router.push('/genres?...')`. It now
calls `usePathname()` and pushes to whatever page it's actually rendered on
— which is what let the exact same component be reused, unmodified, on the
`/search` page too.
## 4. Advanced filtering (year range + minimum rating)

(`filterMoviesByYearAndRating`), `services/movieApi.ts` (`discoverMovies`
gained `yearFrom`/`yearTo`/`minRating` options).

Two different filtering strategies exist, depending on which TMDB endpoint
a page uses:
- **`/genres` (uses TMDB's `discover` endpoint):** TMDB itself supports
  `primary_release_date.gte`/`.lte` and `vote_average.gte` query params, so

### Important code

```ts
export async function generateMetadata({ params }: PageProps) {
   const movie = await getMovieDetails(params.id);

   return {
      title: movie.title,
      description: movie.overview,
      openGraph: {
         title: movie.title,
         description: movie.overview,
         images: movie.poster_path ? [posterUrl(movie.poster_path)] : [],
      },
   };
}
```

**Simple logic:** Next.js runs `generateMetadata` on the server before the
page is sent. It fetches the movie, then uses the title, summary, and poster
to build the browser tab title and social-media preview.
  `discoverMovies()` just adds them to the request. TMDB does the filtering
  — the app never sees unfiltered results at all.
- **`/search` (uses TMDB's plain `search/movie` endpoint):** this endpoint
  has NO filter params at all — it can only search by title. So
  `search/page.tsx` fetches results normally, then calls
  `filterMoviesByYearAndRating()` and `sortMovies()` itself, in plain
  JavaScript, on the array TMDB already returned.

`FilterPanel` itself doesn't know or care which strategy is in play — like

### Important code

```tsx
const pathname = usePathname();
const searchParams = useSearchParams();
const router = useRouter();

function changeSort(value: string) {
   const params = new URLSearchParams(searchParams.toString());
   params.set("sort", value);
   router.push(`${pathname}?${params.toString()}`);
}
```

**Simple logic:** The component finds the page it is currently on, keeps the
existing URL filters, changes only `sort`, and navigates to the new URL. This
lets one dropdown work on both genres and search pages.
`SortSelect`, its only job is reading/writing the URL's `yearFrom`/`yearTo`/
`minRating` params (with a 500ms debounce on the year inputs, so each
keystroke doesn't trigger a navigation).

## 5. URL-based search/filter state

Not a separate file — this is the *pattern* every control above already
follows: `GenreChips`, `SortSelect`, and `FilterPanel` all read the current
value from `useSearchParams()` and write new values via
params first. This means:
- Refreshing the page shows the exact same filtered/sorted view.
- Sharing a `/genres?genre=28&sort=vote_average.desc&minRating=7` link
- The page components (`genres/page.tsx`, `search/page.tsx`) read these same
  params server-side (as the `searchParams` prop) to run the actual
  TMDB query — the URL is the single source of truth on both ends.

## 6. Infinite scrolling

**Files:** `components/InfiniteMovieGrid.tsx` (new),
`app/api/movies/discover/route.ts`, `app/api/movies/search/route.ts` (new
API routes), `services/movieApi.ts` (`page` param added to `discoverMovies`

### Important code

```ts
export function filterMoviesByYearAndRating(
   movies: Movie[],
   filters: { yearFrom?: number; yearTo?: number; minRating?: number }
) {
   return movies.filter((movie) => {
      const year = movie.release_date
         ? Number(movie.release_date.slice(0, 4))
         : null;

      // A movie must pass every active condition.
      if (filters.yearFrom != null && (year == null || year < filters.yearFrom)) {
         return false;
      }
      if (filters.yearTo != null && (year == null || year > filters.yearTo)) {
         return false;
      }
      if (filters.minRating != null && movie.vote_average < filters.minRating) {
         return false;
      }
      return true;
   });
}
```

**Simple logic:** Each movie is checked against the filters. A movie is kept
only when its year and rating satisfy all active rules. Missing release dates
cannot pass an active year filter because there is no year to compare.

For the genres page, TMDB performs this work through query parameters:

```ts
if (options.yearFrom != null) {
   params.set("primary_release_date.gte", `${options.yearFrom}-01-01`);
}
if (options.yearTo != null) {
   params.set("primary_release_date.lte", `${options.yearTo}-12-31`);
}
if (options.minRating != null) {
   params.set("vote_average.gte", String(options.minRating));
}
```

**Simple logic:** The app sends the filters to TMDB for discover requests.
For normal searches, TMDB cannot filter by year or rating, so the app filters
the returned array itself.
and `searchMovies`).

Flow:
1. The server-rendered page (`genres/page.tsx` or `search/page.tsx`) fetches
   **page 1** as before and renders it immediately — no loading spinner for
   the first screenful.
2. That page 1 array, plus the total page count TMDB reported, is passed
   the grid and watches it with an `IntersectionObserver` — a browser API
   listening to every `scroll` event manually.
4. When the sentinel becomes visible (with a 400px head start, so loading

### Important code

```tsx
function updateParams(updates: Record<string, string | null>) {
   const params = new URLSearchParams(searchParams.toString());

   for (const [key, value] of Object.entries(updates)) {
      // Empty values remove a filter instead of creating "filter=".
      if (!value) params.delete(key);
      else params.set(key, value);
   }

   router.push(`${pathname}?${params.toString()}`);
}
```

**Simple logic:** The URL stores the selected filters. Controls change the
URL, and the page reads the URL to fetch the matching movies. Refreshing or
sharing the link therefore keeps the same results.
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

### Important code

```tsx
const loadNextPage = useCallback(async () => {
  const nextPage = page + 1;
  const response = await fetch(
    `${endpoint}?${queryString}&page=${nextPage}`
  );
  const data: MovieResponse = await response.json();

  // Add the new page after the movies already shown.
  setMovies((current) => [...current, ...data.results]);
  setPage(nextPage);
}, [endpoint, page, queryString]);

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && !loading && !finished) {
      loadNextPage();
    }
  });

  if (sentinelRef.current) observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [finished, loading, loadNextPage]);
```

**Simple logic:** A small invisible element sits below the movie cards. When
the user gets near it, the browser calls `loadNextPage`. The next page is
fetched and appended, so the old cards stay on screen. The observer stops
when all TMDB pages have been loaded.

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

### Important code

```tsx
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
   if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setHighlighted((current) => (current + 1) % suggestions.length);
   }

   if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setHighlighted((current) =>
         current <= 0 ? suggestions.length - 1 : current - 1
      );
   }

   if (event.key === "Enter") {
      const selected = suggestions[highlighted];
      if (selected) router.push(`/movies/${selected.id}`);
      else router.push(`/search?q=${encodeURIComponent(query)}`);
   }

   if (event.key === "Escape") setSuggestions([]);
}
```

**Simple logic:** The arrow keys choose a suggestion, Enter opens the chosen
movie, and Escape closes the list. If no suggestion is selected, Enter runs a
normal text search. The ARIA attributes give the same state to screen-reader
users.

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
