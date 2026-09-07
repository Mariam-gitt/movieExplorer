# New Features — Viva / Exam Prep Q&A

Companion to `NEW_FEATURES_CODE_FLOW.md`. Questions someone could reasonably
ask about this batch of changes, with short answers.

### General

**Q: Why did some features need a new API route (`/api/movies/discover`,
`/api/movies/search`) instead of just calling TMDB directly from the
browser?**
A: The existing code already had this pattern for `getMovieDetails()` (see
the comment in `movieApi.ts`: "use the API route to avoid CORS issues").
CORS is a browser security rule that blocks a page from freely calling a
different website's API. Rather than re-litigate whether every TMDB
endpoint truly has a CORS problem, the new client-side fetches (infinite
scroll's extra pages, search suggestions) follow the SAME already-proven
pattern: browser → our own `/api/...` route → TMDB. It also means the API
key is only ever used server-side in these new code paths.

**Q: Why do `SortSelect` and `FilterPanel` write to the URL instead of just
using `useState`?**
A: Two reasons. First, it's what "URL-based filter state" *means* — the
current filters have to be visible in the address bar so refreshing or
sharing the link reproduces the same view. Second, since `genres/page.tsx`
and `search/page.tsx` are Server Components that read `searchParams`,
putting the state in the URL is the only way for those two totally separate
client components (`SortSelect`, `FilterPanel`) to actually influence what
the server fetches — `useState` in one component can't be read by another
unrelated component or by the server.

### Recently viewed

**Q: Why is `RecordRecentlyViewed` its own separate component instead of a
`useEffect` directly inside `movies/[id]/page.tsx`?**
A: `movies/[id]/page.tsx` is a Server Component (it's `async` and does
`await getMovieDetails(id)` directly). Server Components can't use React
hooks like `useEffect` at all — hooks only exist in Client Components. So
the side effect ("save this id to localStorage") has to live in its own
small Client Component (`"use client"` at the top), which the Server
Component is still allowed to render as a child.

**Q: What happens if the user opens the same movie's details page twice?**
A: `recordMovieViewed()` uses `.filter((id) => id !== movieId)` to remove
any existing occurrence before adding it back at the front — so it moves to
the top instead of appearing twice in the list.

### SEO metadata

**Q: What's the difference between the `metadata` export in `layout.tsx`
and the `generateMetadata` function in `movies/[id]/page.tsx`?**
A: `metadata` is a **static object** — same title every time, evaluated
once. `generateMetadata` is an **async function** — Next.js calls it fresh
for every request, so it can `await getMovieDetails(id)` first and build a
title/description that's different for every single movie. Next.js
automatically merges a page's `generateMetadata` result on top of the
layout's static `metadata` — hence why the movie page's title doesn't need
to repeat "| Movie Explorer" itself (the layout's `title.template` already
adds that).

**Q: What happens to the page's metadata if TMDB is down when
`generateMetadata` runs?**
A: It's wrapped in try/catch and falls back to the generic "Movie Explorer"
title/description instead of crashing metadata generation (which would take
the whole page down with it).

### Advanced filtering / sort

**Q: Why does `/genres` filter movies differently from `/search`?**
A: They use two different TMDB endpoints. `/genres` calls TMDB's
`discover/movie` endpoint, which TMDB specifically built to accept filter
params like `vote_average.gte` and `primary_release_date.gte` — so
filtering happens **on TMDB's server**, before the data ever reaches this
app. `/search` calls TMDB's plain `search/movie` endpoint, which only
accepts a text query and has no filter/sort params at all — so this app has
to filter and sort the returned array itself, in `utils/movieMeta.ts`
(`filterMoviesByYearAndRating`, `sortMovies`).

**Q: Why does `FilterPanel`'s year input debounce, but the rating dropdown
doesn't?**
A: A `<select>` only fires `onChange` once per deliberate choice — there's
no "keystroke" to debounce. A text `<input>` fires `onChange` on every
single character typed, so navigating (and re-fetching) on every keystroke
while typing "2010" would fire four unnecessary requests instead of one.

### Infinite scrolling

**Q: How does the component know when to stop fetching more pages?**
A: Every TMDB response includes `total_pages`. After each fetch,
`InfiniteMovieGrid` checks `if (nextPage >= data.total_pages)` and sets
`finished = true`, which stops the `IntersectionObserver` from being
recreated and shows a "You've reached the end" message instead.

**Q: What is the `key={...}` prop doing on `<InfiniteMovieGrid>` in
`genres/page.tsx` / `search/page.tsx`?**
A: React uses `key` to decide whether to UPDATE an existing component
instance or throw it away and mount a fresh one. The key here is built from
the current genre/sort/filters — so changing any filter produces a
different key, which makes React discard the old `InfiniteMovieGrid`
(with all its previously-accumulated pages) and mount a brand new one
starting from the new page 1. Without this, switching from "Action" to
"Comedy" would just APPEND comedy movies onto the existing list of action
movies instead of replacing it.

**Q: Why use `IntersectionObserver` instead of listening to the `scroll`
event?**
A: `scroll` fires extremely frequently (dozens of times per second) and
requires manually calculating element positions on every single firing,
which is expensive. `IntersectionObserver` is a browser API built
specifically for "tell me when this element becomes visible", and the
browser handles the efficient part internally.

### Keyboard-friendly search

**Q: Why does pressing `/` sometimes NOT focus the search box?**
A: The listener explicitly ignores the keypress if the user is already
typing in some other text field (`isTypingElsewhere` check) — otherwise
typing a literal "/" character into, say, a filter's year input would get
hijacked into a global shortcut instead of typing the character.

**Q: What does `aria-activedescendant` actually do?**
A: It tells assistive technology (screen readers) which suggestion is
"active" WITHOUT moving actual keyboard focus away from the text input.
The user keeps typing/pressing arrow keys with focus still in the `<input>`
the whole time; `aria-activedescendant` is how a screen reader still
announces "Highlighted: Inception, 2010" as the user presses ArrowDown.

**Q: Why `onMouseDown` instead of `onClick` on each suggestion?**
A: The input's `onBlur` handler closes the dropdown. Clicking a suggestion
first fires the input's `blur` event (mouse-down moves focus away),
THEN would fire `onClick` on the suggestion — by which point the dropdown
would already be hidden. `onMouseDown` fires earlier, before blur, so
`event.preventDefault()` there stops the input from losing focus at all,
keeping the click's target suggestion clickable.
