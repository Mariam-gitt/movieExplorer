# Q&A prep — movieExplorer theme redesign

These are the concepts a viva/exam question is most likely to poke at,
based on what actually changed in this update. Answers are short and in
plain language — expand in your own words if asked to elaborate.

---

**Q: What was actually broken before this change, and how did you find it?**
The homepage (`page.tsx`) fetched five TMDB endpoints with plain `await`,
one after another. If even ONE of them failed (e.g. the TMDB API key env
var was missing or wrong), that `await` threw an error. Because nothing
caught it, Next.js's error boundary (`error.tsx`) took over and replaced
the ENTIRE page — so every section disappeared, not just the broken one.
I confirmed this by running a production build with the movie API
blocked: all five categories failed, and the page still rendered
successfully with a friendly message instead of crashing.

**Q: How did you fix it?**
By switching from `await` one-by-one to `Promise.allSettled([...])`.
`Promise.allSettled` runs all the requests at the same time and — unlike
`Promise.all` — never rejects. It waits for every promise and reports
back whether EACH ONE succeeded (`fulfilled`) or failed (`rejected`)
individually. I turned each outcome into a small `{ results, failed }`
object, so the page can render four working sections and one "couldn't
load this section" message instead of nothing at all.

**Q: What's the difference between `Promise.all` and `Promise.allSettled`?**
`Promise.all` rejects as soon as ANY one promise rejects — you lose all
the successful results too. `Promise.allSettled` always resolves, and
gives you the status of every promise individually, so partial failure
doesn't wipe out partial success.

**Q: What does `"use client"` mean, and why do only some files have it?**
Next.js's App Router renders components on the SERVER by default (faster
initial load, smaller JS bundle sent to the browser). `"use client"` at
the top of a file opts THAT component (and its children) into running in
the browser instead, which is required whenever you need things the
server doesn't have: `useState`, click handlers, `localStorage`, browser
`window`/`navigation`. `SearchBar.tsx`, `FavoriteButton.tsx`, and
`FavoritesPreview.tsx` all need it; `Navbar.tsx`, `Sidebar.tsx`,
`MovieCard.tsx`, and `page.tsx` don't, because they only render static
markup and links.

**Q: What is `useSyncExternalStore` for, and why not just `useState`?**
Favorites live in `localStorage`, which is OUTSIDE React's normal state
system. `useSyncExternalStore` is React's official hook for reading a
value that lives outside React while staying correctly in sync with it —
it re-renders the component automatically whenever the favorites list
changes, even if the change happened in a different component (or a
different browser tab, via the `storage` event). Plain `useState` has no
way to "listen" for an external change like that.

**Q: Why does `FavoriteButton` use `onClickCapture` with
`stopPropagation`?**
The heart icon sits INSIDE a `<Link>` (the poster is clickable to open
the movie's detail page). Without stopping the click from "bubbling up"
to the `<Link>`, tapping the heart would ALSO trigger navigation to the
detail page. `stopPropagation()` stops the click event from reaching the
parent `<Link>`, so tapping the heart only toggles the favorite.

**Q: How do the sidebar/navbar links jump to a specific section
("#trending", "#popular"...) ?**
Each `<section>` on the homepage has a matching `id` attribute (e.g.
`id="trending"`). A link ending in `#trending` is a "fragment" or "hash"
link — the browser scrolls straight to the element with that `id` on the
page, no JavaScript required. `scroll-mt-24` (a Tailwind class) adds
invisible top margin ONLY when the element is the target of one of these
jumps, so the sticky navbar doesn't cover the section's heading when the
browser lands on it.

**Q: What are the CSS "theme tokens" in `globals.css`, and why use them
instead of hard-coded colors like `#ffffff`?**
They're named CSS variables (`--paper`, `--ink`, `--gold`, etc.) that
stand in for actual colour values. Every component uses the NAME (via
Tailwind classes like `bg-paper` or `text-gold`), never the raw hex code.
That means the whole app's colour scheme can be changed by editing a
handful of lines in one file — which is exactly what this update did to
switch from the old "vintage paper" theme to the new light
streaming-app theme, without touching most component files at all.

**Q: How does dark mode work here, and did you have to write separate
components for it?**
No separate components. `@media (prefers-color-scheme: dark)` in
`globals.css` re-defines the SAME variable names with different values
when the user's operating system is set to dark mode. Every component
that already uses `bg-paper` or `text-ink` gets the dark palette
automatically — the component code itself never mentions "dark mode".

**Q: What's `Number.isFinite(movie.vote_average)` checking for in
`MovieCard.tsx`?**
Some movies (very new ones) can come back from TMDB with a rating of
`0` or a missing/`NaN` value. `.toFixed(1)` on `NaN` prints the string
`"NaN"` on screen, which looks broken. `Number.isFinite` confirms the
value is a real, usable number before formatting it; otherwise the UI
shows a dash (`–`) instead.

**Q: What does the `group` / `group-hover:` Tailwind pattern do in
`MovieCard.tsx`?**
Normally `hover:` only affects the exact element being hovered. Adding
the class `group` to a PARENT element lets any CHILD use
`group-hover:...` to react to the mouse hovering the parent instead of
itself — that's how hovering anywhere on the card (not just the tiny
play button) makes the play icon fade in and the poster zoom slightly.

**Q: Why is the play-button icon inside `<span aria-hidden="true">`?**
It's purely decorative — it doesn't add any information a screen reader
user needs, because the same "this opens the movie" meaning is already
carried by the surrounding `<Link>` and the movie title. `aria-hidden`
tells assistive tech to skip over it, so screen readers don't announce a
meaningless "graphic" that adds noise without adding information.

**Q: What is `next/font/google` doing, and why did the sandbox build
fail because of it?**
`next/font/google` downloads Google Fonts (here, Plus Jakarta Sans and
Inter) at BUILD time and self-hosts them alongside your app, rather than
linking to Google's servers from the browser — faster loading and no
data sent to Google on every visit. It does need internet access at
BUILD time to fetch the font files. The build only failed in this
sandboxed environment because outbound access to `fonts.googleapis.com`
was blocked there; on a normal machine with regular internet access this
works exactly like the original project's fonts did.

**Q: Why does `FavoritesPreview.tsx` avoid calling `setMovies(...)`
directly at the top of its `useEffect`?**
React (and this project's ESLint rules) discourage calling `setState`
SYNCHRONOUSLY inside an effect body, because it can trigger an extra,
avoidable re-render right after the one that just ran. The fix was to
simply not touch state at all when there's nothing to fetch — the "no
favorites yet" case is instead handled directly in the render logic
(`if (favoriteIds.length === 0) return null;`), and `setMovies` is only
ever called inside the `async` function after a real fetch completes.

---

## How the changes were verified before packaging

- `npx tsc --noEmit` — zero TypeScript errors.
- `npx eslint .` — zero lint errors (one was found and fixed along the
  way: a synchronous `setState` inside an effect in
  `FavoritesPreview.tsx`).
- `npm run build` — a full production build was run with the movie API
  deliberately blocked, to prove the "one failed category shouldn't
  crash the whole page" fix actually works. It did: the homepage still
  built and rendered, showing the friendly fallback message instead of
  the old whole-page crash.
- Every changed file was diffed against `origin/main` before packaging,
  so only genuinely modified/new files are included below.
