// This component is a Server Component (no "use client" at the top) because it
// only renders links — it doesn't need any interactivity/state, so it can be
// rendered once on the server and shipped as plain HTML (faster than client JS).
import Link from "next/link";

// One row in the icon rail: a link, an SVG icon, and a label used for
// accessibility (screen readers) and the hover tooltip.
type SidebarLink = {
  href: string; // Where the link goes. "/#trending" means "go to the homepage, then
  // jump straight to the element with id='trending'" — that's what the "#" (hash) does.
  label: string; // Human-readable name, read aloud by screen readers.
  icon: React.ReactNode; // The little picture shown for this link.
};

// Reusable little house icon, drawn by hand with SVG paths so we don't need to
// install an extra icon library just for a handful of shapes.
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Flame icon — pairs with the "Trending" quick-link, matching the 🔥 badge
// used on the trending section/hero elsewhere in the app.
function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3c1 2.5-1.5 3.5-1.5 6 0 1.5 1 2.5 2.5 2.5S15 10 15 8.5c1.5 1.5 2 3.5 2 5.5a5 5 0 1 1-10 0c0-3 1.5-5 2-7 .2 1 .8 1.5 1.5 1.5C11.5 8.5 11 5.5 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Star icon — pairs with "Popular" (audience-favourite = highly rated in spirit).
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Calendar icon — pairs with "Upcoming" (movies with future release dates).
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Heart icon (outline) — pairs with "Favorites".
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 11c-2.5 4.65-9.5 9-9.5 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The actual list of icons shown in the rail, top to bottom. Each href either
// points at the homepage (with an "#anchor" to auto-scroll to that section) or
// at a real page route like "/favorites".
const LINKS: SidebarLink[] = [
  { href: "/", label: "Home", icon: <HomeIcon /> },
  { href: "/#trending", label: "Trending", icon: <FlameIcon /> },
  { href: "/#popular", label: "Popular", icon: <StarIcon /> },
  { href: "/#upcoming", label: "Upcoming", icon: <CalendarIcon /> },
  { href: "/favorites", label: "Favorites", icon: <HeartIcon /> },
];

export default function Sidebar() {
  return (
    // "nav" tells assistive tech this block is a navigation landmark.
    // fixed + left-4 + top-1/2 + -translate-y-1/2 = pinned to the middle of the
    // left edge of the viewport, regardless of scroll position.
    // "hidden md:flex" means: invisible on small/mobile screens (there's no
    // room for a floating rail there), shown as a flex column from the medium
    // breakpoint (tablets) upward.
    <nav
      aria-label="Quick sections"
      className="glass-panel fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-rule p-2 shadow-lg shadow-black/5 md:flex"
    >
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          // "title" shows a native browser tooltip on hover; "aria-label" is what
          // a screen reader announces (icons alone have no readable text).
          title={link.label}
          aria-label={link.label}
          className="group flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition hover:bg-gold/15 hover:text-gold"
        >
          {link.icon}
        </Link>
      ))}
    </nav>
  );
}
