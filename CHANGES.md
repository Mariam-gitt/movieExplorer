# What changed

## New theme
Swapped the old "vintage paper / burgundy" look for a light, rounded,
streaming-app style theme inspired by your reference screenshot: soft
off-white background, white rounded cards, pill-shaped buttons and nav
tabs, amber accent colour, a floating glass navbar, and a floating icon
sidebar. All colours live as named variables in `globals.css`, so most
other files didn't need colour-specific edits at all.

## New homepage layout
- Floating icon sidebar (`Sidebar.tsx`) with quick jumps to Trending,
  Popular, Upcoming, and Favorites.
- Redesigned navbar (`Navbar.tsx`) with rounded pill category tabs for
  Trending / Popular / Top Rated / Upcoming / Now Playing — both as
  desktop tabs and a scrollable row on mobile.
- New dark hero banner for the top trending movie, with a Watch button
  and a favorite toggle.
- New compact "Now Playing" list next to the hero.
- New "Your Favorites" row (`FavoritesPreview.tsx`) that only appears
  once you've actually saved something.
- Every category section — Trending, Popular, Top Rated, Upcoming, Now
  Playing — is still on the homepage like before, just restyled, and
  each one now has an anchor `id` so the tabs/sidebar can jump to it.

## The actual bug behind "there are no sections"
The homepage fetched five categories with plain `await`. If ONE of them
failed — most likely because `NEXT_PUBLIC_TMDB_API_KEY` isn't set in a
`.env.local` file — Next.js threw the whole page into its error screen,
hiding every section rather than just the broken one. This is now fixed
with `Promise.allSettled`, so working categories still render even if
one fails, and a clear inline message explains what to fix instead of a
blank/broken page.

## Setup reminder
This project needs a `.env.local` file at the project root (it's
git-ignored, so it won't be in the repo) containing:

```
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

Get a free key from https://www.themoviedb.org/settings/api, then
restart `npm run dev`.

## How to apply this
Copy each file in this package into your repo at the exact same path
(they're already laid out that way — `src/app/...`, `src/components/...`).
Two files are brand new (`FavoritesPreview.tsx`, `Sidebar.tsx`); the rest
overwrite existing files. Everything else in your project (types, API
service, search/favorites logic) is untouched.

See `QA_NOTES.md` for a walkthrough of the concepts used, in case you
get asked about this in a viva.
