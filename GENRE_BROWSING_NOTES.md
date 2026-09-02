# Genre Browsing + URL-Based Filter State — Notes / Possible Viva Questions

## What was built
A new page at `/genres` that lets you filter movies by genre and sort order,
where BOTH the selected genre and sort order live in the URL itself
(e.g. `/genres?genre=28&sort=vote_average.desc`) instead of in React state.

Files touched:
- `src/services/movieApi.ts` — added `discoverMovies()`, using TMDB's
  `/discover/movie` endpoint (different from the fixed-category endpoints
  like `getPopularMovies()` — "discover" is TMDB's endpoint built
  specifically for combining filters).
- `src/utils/movieMeta.ts` — exported the existing `GENRE_NAMES` map, and
  added `GENRE_LIST` (an array version of it, for `.map()`-ing over).
- `src/app/genres/page.tsx` — new page, a Server Component.
- `src/components/GenreChips.tsx` — new, genre filter buttons.
- `src/components/SortSelect.tsx` — new, sort-order dropdown.
- `src/components/Navbar.tsx` — added a "Genres" nav link.

## Why two different approaches for two similar-looking controls?

This is the most important thing to understand and explain clearly:

**GenreChips = plain `<Link>` elements, no "use client", no hooks.**
Each chip is just a link to a slightly different URL
(`/genres?genre=28`). Clicking a link IS navigation — you don't need
JavaScript to "make" a link navigate, that's what links do natively.
Next's `<Link>` just makes it fast (no full page reload) as a bonus.

**SortSelect = "use client" + `useRouter()` + `useSearchParams()`.**
A `<select>` dropdown has no built-in way to navigate anywhere when its
value changes — `onChange` is just a JavaScript event, not a link. So here
we DO need actual JavaScript: `useRouter().push(...)` to write the new URL
ourselves inside the event handler, and `useSearchParams()` to read the
current URL so the dropdown shows the right option already selected.

**Rule of thumb:** if a plain `<a>`/`<Link>` could do the job, use that —
no client JS needed. Reach for `useRouter`/`useSearchParams` only when the
interaction genuinely can't be expressed as a link (dropdowns, checkboxes
that should debounce, drag interactions, etc.).

## Why does the page component read `searchParams` as a PROP,
## not via `useSearchParams()`?

`src/app/genres/page.tsx` is a Server Component — no `"use client"` at the
top, and it's `async`. Server Components run on the server, before
anything is sent to the browser, and Next.js hands them the current URL's
query string directly as a `searchParams` prop. There's no need for (and
no way to use) a React hook there, because hooks like `useSearchParams()`
only work inside Client Components that are actually running in the
browser. Your own `src/app/search/page.tsx` already used this exact same
pattern — this feature just follows it.

## Why merge params instead of overwriting them?

In `SortSelect.tsx`:
```ts
const params = new URLSearchParams(searchParams.toString());
params.set("sort", event.target.value);
router.push(`/genres?${params.toString()}`);
```
If we instead wrote `router.push(`/genres?sort=${value}`)`, changing the
sort order would silently WIPE OUT any genre filter that was already
selected, because that new URL wouldn't mention `genre` at all. Copying
the existing params first, then only changing the one key we care about,
keeps every other filter intact — the same "keep everything else, change
one thing" idea used in `FavoriteButton.tsx` when adding/removing one
movie id from the favorites array without touching the rest of the list.

## Why convert `GENRE_NAMES` (object) into `GENRE_LIST` (array)?

`GENRE_NAMES` is a lookup table: "given an id, what's the name?" — good
for that one job (`GENRE_NAMES[28]` → `"Action"`), but you can't `.map()`
over a plain object to render one chip per genre. `GENRE_LIST` reshapes
the same data into an array of `{id, name}` objects specifically so
`GenreChips.tsx` can loop over it with `.map()`. Same underlying data,
shaped for a different purpose.

## Likely exam/viva questions

- Q: Why does clicking a genre chip not need `useRouter()`, but changing
  the sort dropdown does?
  A: A link (`<Link>`/`<a>`) is inherently a navigation element — clicking
  it changes the URL on its own. A `<select>`'s `onChange` is just a JS
  event with no built-in navigation behavior, so `router.push()` has to be
  called manually to make it change the URL.

- Q: What would happen if `SortSelect` used
  `router.push(\`/genres?sort=${value}\`)` instead of merging params?
  A: Any existing `?genre=` selection would be lost, because the new URL
  wouldn't include it — the genre filter would silently reset to "All"
  every time the sort order changed.

- Q: Why is `GenrePageProps.searchParams` typed as a `Promise`?
  A: In this version of Next.js (App Router), Server Component props like
  `searchParams` and `params` are resolved asynchronously, so the page
  component must `await` them before use, matching the existing
  `search/page.tsx` pattern in this project.

- Q: What does `discoverMovies` do differently from something like
  `getPopularMovies`?
  A: `getPopularMovies` always calls one fixed TMDB endpoint with no
  filters. `discoverMovies` calls TMDB's `/discover/movie` endpoint, built
  specifically to accept combinable filters (genre, sort order, etc.) via
  query parameters, and only adds the `with_genres` parameter when a
  genre was actually selected.
