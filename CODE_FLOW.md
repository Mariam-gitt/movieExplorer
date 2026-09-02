# Code Flow — How Each Feature Actually Runs

This walks through, step by step, what actually happens in the code for
each feature — the order things run in, and which file hands off to
which. Written to be read top to bottom per feature.

---

## Favorite button (toggle + persistence)

1. `MovieCard.tsx` renders `<FavoriteButton movie={movie} />` as a
   **sibling** of `<Link>` (not nested inside it — see the fix notes).
2. Inside `FavoriteButton.tsx`, on first render, the hook
   `useSyncExternalStore(subscribeToFavorites, getFavoriteIds, () =>
   EMPTY_FAVORITES)` runs. This asks: "what's the favorites list *right
   now*, and please re-render me automatically whenever it changes."
3. `getFavoriteIds()` (in `utils/favorites.ts`) reads the raw JSON string
   out of `localStorage`, parses it into a number array, and caches it.
4. Back in `FavoriteButton`, `isFavorite = favorites.includes(movie.id)`
   decides whether the heart renders filled or outline-only.
5. **User clicks the heart** → `handleFavorite` runs →
   `event.stopPropagation()` (stops the click bubbling to any parent) →
   either `setFavoriteIds([...favorites, movie.id])` (add) or
   `setFavoriteIds(favorites.filter(id => id !== movie.id))` (remove).
6. `setFavoriteIds()` writes the new array to `localStorage` AND fires a
   custom `"favorites-changed"` browser event.
7. That event is what `subscribeToFavorites` was listening for back in
   step 2 — it fires, which tells `useSyncExternalStore` "go re-read the
   value," which re-runs `getFavoriteIds()`, which causes
   `FavoriteButton` (and every OTHER `FavoriteButton` / `FavoritesPreview`
   on the page) to re-render with the new state — all without any of them
   directly talking to each other.

## URL-based genre filtering + sorting

1. User visits `/genres` (or clicks a genre chip / changes the sort
   dropdown, both of which navigate to a new `/genres?genre=..&sort=..`
   URL).
2. `src/app/genres/page.tsx` is a **Server Component** — Next.js runs it
   on the server and hands it the current query string directly as the
   `searchParams` prop (no hook needed, since this code never runs in the
   browser at all).
3. `const params = await searchParams` unwraps it; `genreId` and `sort`
   are pulled out and converted from strings to the right types.
4. `discoverMovies({ genreId, sortBy: sort })` (in `services/movieApi.ts`)
   builds a query string for TMDB's `/discover/movie` endpoint and
   fetches it.
5. The results come back into `page.tsx`, which renders `<GenreChips>`,
   `<SortSelect>`, and `<MovieGrid movies={data.results}>`.
6. `GenreChips.tsx` needs NO client JS — every chip is a plain `<Link
   href="/genres?genre=28">`. Clicking it is a completely normal browser
   navigation, which re-runs this whole flow from step 2 with a new URL.
7. `SortSelect.tsx` DOES need client JS (`"use client"`), because a
   `<select onChange>` has no built-in way to navigate anywhere.
   `useSearchParams()` reads the CURRENT url (so the right option shows as
   selected); on change, it copies the existing params, overwrites just
   `sort`, and calls `router.push(...)` to write the new URL manually —
   which again re-runs the whole flow from step 2.

## Skeleton loading (`/genres/loading.tsx` as an example)

1. User navigates to `/genres?...`.
2. Next.js sees BOTH `page.tsx` and `loading.tsx` in the `src/app/genres/`
   folder. It automatically wraps `page.tsx` in a `<Suspense
   fallback={<Loading />}>`, without you writing that wrapping yourself.
3. While `page.tsx`'s `await discoverMovies(...)` (step 4 above) is still
   in flight, React shows `loading.tsx`'s output instead — the grey pulsing
   placeholder shapes.
4. The instant `discoverMovies(...)` resolves and `page.tsx` finishes
   rendering, React swaps `loading.tsx` out and the real page in.

## Share movie link

1. User is on `/movies/[id]`, clicks the "Share" button
   (`ShareButton.tsx`, a Client Component).
2. `handleShare()` runs. First: `if ("share" in navigator)` — checks
   whether this browser supports the native share sheet.
3. **If yes:** `await navigator.share({ title, url })` — `url` is read
   live from `window.location.href` at the moment of the click, so it's
   always exactly the page the user is currently on. The OS's native share
   sheet opens; this function's job is basically done at that point.
4. **If no (or it failed for some other reason):** falls through to
   `await navigator.clipboard.writeText(url)`. On success,
   `setCopied(true)` flips the button's own displayed text to "Copied!",
   and `setTimeout(() => setCopied(false), 2000)` schedules it to flip
   back after 2 seconds.

## Unit tests

1. `npm test` runs `vitest run`, which reads `vitest.config.mts` to learn:
   run in a fake browser (`jsdom`), understand JSX (`@vitejs/plugin-react`),
   and resolve the `@/...` import shortcut the same way the real app does.
2. `vitest.setup.ts` runs once before any test file, registering the
   extra `.toBeInTheDocument()`-style assertions.
3. For each `*.test.ts(x)` file under `src/__tests__/`:
   - `favorites.test.ts` calls the real `getFavoriteIds`/`setFavoriteIds`
     functions directly against jsdom's real (fake) `localStorage` — no
     rendering involved.
   - `FavoriteButton.test.tsx` calls `render(<FavoriteButton ... />)`,
     which mounts the component into jsdom's fake DOM; `fireEvent.click`
     simulates a real click; assertions check what's now visible/true in
     that fake DOM (the `aria-pressed` attribute, localStorage's contents)
     — never anything about the component's internals.
   - `ShareButton.test.tsx` first installs a fake
     `navigator.clipboard.writeText` (since jsdom doesn't implement the
     real one), renders the button, clicks it, then asserts the fake was
     called with the right URL and that "Copied!" eventually appears on
     screen (`waitFor`/`findByText`, since the click handler is `async`).
4. Vitest reports pass/fail per test, then per file, then an overall
   summary.
