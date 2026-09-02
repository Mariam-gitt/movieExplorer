import Link from "next/link";
// The search input + submit button (unchanged logic, still a client component
// because it needs to track what the user is typing).
import SearchBar from "./SearchBar";
// The light/dark switch button.
import ThemeToggle from "./ThemeToggle";

// One entry in the row of pill-shaped category tabs under the logo. Each
// "href" is an anchor link ("#trending") that jumps to the matching
// <section id="trending"> on the homepage (see src/app/page.tsx).
const CATEGORY_TABS = [
  { href: "/#trending", label: "Trending" },
  { href: "/#popular", label: "Popular" },
  { href: "/#top-rated", label: "Top Rated" },
  { href: "/#upcoming", label: "Upcoming" },
  { href: "/#now-playing", label: "Now Playing" },
  // Unlike the tabs above (anchor links "#trending" that jump around within
  // the homepage), this one is a real route to a different page entirely:
  // src/app/genres/page.tsx.
  { href: "/genres", label: "Genres" },
];

export default function Navbar() {
  return (
    // "sticky top-0" keeps the navbar pinned to the top of the viewport while
    // the rest of the page scrolls underneath it. "z-30" makes sure it stays
    // above the movie cards. "glass-panel" gives it the frosted-glass look
    // defined in globals.css.
    <header className="glass-panel sticky top-0 z-30 border-b border-rule">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:pl-28 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Clicking the logo/name always takes you back to the homepage. */}
          <Link href="/" className="group flex items-center gap-2">
            {/* A small solid circle standing in for a proper logo mark — keeps
                the header visually anchored without needing an image asset. */}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-stamp">
              M
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              Movie Explorer
            </span>
          </Link>

          {/* Pill-style category tabs, styled to look like rounded "chips" —
              this directly answers the request for Trending/Popular/Upcoming
              etc. as clickable options near the top of the screen. */}
          <nav
            aria-label="Movie categories"
            className="hidden items-center gap-1 rounded-full border border-rule bg-paper-raised p-1 text-sm font-semibold lg:flex"
          >
            {CATEGORY_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-full px-3.5 py-1.5 text-ink-soft transition hover:bg-paper hover:text-ink"
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Favorites is a real page (not just an anchor), so it's kept
              separate from the anchor-link tabs above. */}
          <div className="flex items-center gap-2">
            <Link
              href="/favorites"
              className="rounded-full border border-rule bg-paper-raised px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold"
            >
              Favorites
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <SearchBar />

        {/* On small screens the pill tabs above are hidden (no room), so we
            repeat them here as a horizontally-scrollable row instead of
            losing the navigation entirely. */}
        <nav
          aria-label="Movie categories"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm font-semibold lg:hidden"
        >
          {CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="shrink-0 rounded-full border border-rule bg-paper-raised px-3.5 py-1.5 text-ink-soft transition hover:text-ink"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
