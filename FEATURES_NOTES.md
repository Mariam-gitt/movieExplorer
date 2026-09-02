# Favorite Fix (Real) + Skeleton Loading + Share Link + Unit Tests — Notes

## 1. The REAL favorite button fix

Last time I fixed one bug (an invisible overlay stealing clicks). The
button was STILL unreliable because of a second, deeper bug: it was a
`<button>` nested inside a `<Link>` (which renders as an `<a>` tag).

**HTML rule:** interactive elements cannot be nested inside other
interactive elements. A `<button>` inside an `<a>` is invalid markup. Every
browser "fixes" this invalid nesting differently under the hood, which is
exactly why the bug felt inconsistent/unpredictable rather than
"completely broken."

**The fix:** moved `<FavoriteButton>` OUT of `<Link>` entirely, so it's now
a sibling, not a child. It still visually sits in the same top-right
corner (via `absolute right-2 top-2` on a parent that's `relative`) — only
its place in the HTML tree changed, not where it appears on screen.

**Rule of thumb going forward:** never put a `<button>`, another `<a>`, or
anything else clickable inside a `<Link>`/`<a>`. If you need something
clickable to visually sit "on top of" a link (like this heart, or a
"bookmark" icon on a card), make it a **sibling**, positioned with CSS —
not a child.

## 2. Skeleton loading — the concept

Your project already had skeletons for the homepage, search, and movie
details pages (via Next.js's special `loading.tsx` file convention) — I
only added the missing one for `/genres`.

**How `loading.tsx` works:** Next.js treats ANY file literally named
`loading.tsx` inside a route folder as special. It automatically wraps
that folder's `page.tsx` in a React `<Suspense>` boundary, and shows the
`loading.tsx` component for as long as the page's `async` work (its
`await fetch(...)` calls) hasn't resolved yet. You never import or call
`loading.tsx` yourself — Next.js wires it up purely from the filename and
folder location.

**Why a shimmering grey box instead of a spinner?** A skeleton mimics the
*shape* of the real content (a poster-sized rectangle, a title-sized bar)
so the page doesn't visually "jump" once the real data arrives — your eye
already knows roughly where everything will land.

## 3. Share movie link — the concept

Two browser APIs, used together:

- **`navigator.share()`** — the Web Share API. Calling it opens the
  device's native share sheet (the same one you get sharing a photo from
  any other app). Mobile browsers support it well; most desktop browsers
  don't.
- **`navigator.clipboard.writeText()`** — copies text to the clipboard.
  Works almost everywhere.

**Feature detection:** `"share" in navigator` checks whether
`navigator.share` exists BEFORE calling it. Calling a method that doesn't
exist would throw an error and crash the click handler; checking first
lets us fall back to the clipboard instead. This pattern — "check if a
capability exists, use it if so, otherwise fall back" — is called
**progressive enhancement**, and it's everywhere in real frontend code.

**Why read the URL at click time (`window.location.href`) instead of
passing it in as a prop?** It's simpler and can't go stale — whatever page
you're on when you click Share is exactly the link that gets shared, with
zero risk of it being wrong.

## 4. Unit tests — the concept

**Vitest** is the test *runner* — it finds files matching `*.test.ts(x)`,
runs them, and reports pass/fail. **React Testing Library** is a separate
library for testing React components specifically, built around one core
idea: **test behavior, not implementation.**

That means: instead of reaching into a component and checking its
internal state variables, you render it like a real browser would, find
elements the way a *user* (or a screen reader) would — by visible text or
accessible label, via `getByRole` — and interact with them the way a user
would, via `fireEvent.click(...)`. This is deliberate: it means your tests
don't break just because you refactored *how* a component works
internally, only if it actually stopped *behaving* correctly.

Four kinds of tests you now have, each demonstrating a different skill:

1. **Pure logic** (`favorites.test.ts`) — no rendering at all, just
   function in, value out. The simplest kind of test to write.
2. **Component + interaction** (`FavoriteButton.test.tsx`) — render, find
   by role, click, assert the visible result changed.
3. **Mocking a browser API** (`ShareButton.test.tsx`) — jsdom (the fake
   browser tests run in) doesn't implement `navigator.clipboard` for real,
   so the test installs a fake version (`vi.fn()`), checks the component
   called it correctly, then cleans up after itself.
4. **Async assertions** (`waitFor`, `findByText` in `ShareButton.test.tsx`)
   — for code that doesn't finish instantly (like `await
   navigator.clipboard.writeText(...)`), these helpers retry a check until
   it passes or times out, instead of checking too early and failing.

**Running them:** `npm test` (runs once and exits — good for CI). For
active development, `npx vitest` (no `run`) instead watches files and
re-runs automatically as you edit.

## Likely exam/viva questions

- Q: Why was the favorite button unreliable even after the first fix?
  A: A `<button>` was nested inside an `<a>` (via Next's `<Link>`), which
  is invalid HTML — interactive elements can't nest inside other
  interactive elements, and browsers handle that inconsistently.

- Q: How does Next.js know to show `loading.tsx` instead of `page.tsx`?
  A: By file naming convention — any `loading.tsx` in a route folder is
  automatically wrapped around that folder's `page.tsx` as a
  `<Suspense>` fallback, with no manual wiring needed.

- Q: Why check `"share" in navigator` before calling `navigator.share()`?
  A: Not every browser implements it; calling a nonexistent method throws
  an error, so checking first lets the code fall back to clipboard
  copying gracefully instead of crashing.

- Q: What's the difference between testing "implementation" vs
  "behavior"?
  A: Implementation testing checks internal details (state variable
  names, which function got called). Behavior testing (what React Testing
  Library encourages) checks what a real user would actually observe —
  what's on screen, what happens after a click — so tests stay valid even
  after internal refactors.
