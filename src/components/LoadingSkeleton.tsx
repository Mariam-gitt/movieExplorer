// A "skeleton" is a greyed-out placeholder shape shown while real data is
// still loading, so the page doesn't feel empty/broken during the wait.
// "animate-pulse" (a built-in Tailwind animation) fades it in and out gently.
export default function LoadingSkeleton({
  cards = 10, // How many placeholder cards to draw.
  label = "Loading movies", // Announced to screen readers while this is visible.
}: {
  cards?: number;
  label?: string;
}) {
  return (
    // role="status" + aria-live="polite" tells assistive tech "something is
    // loading, announce it, but don't interrupt whatever the user is doing".
    <div role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {/* Array.from({length: cards}) makes an array of `cards` empty slots
            just so we can .map over it `cards` times — the "_" means "we
            don't actually need this value, just the index". */}
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-rule bg-paper-raised p-2"
          >
            <div className="aspect-[2/3] rounded-xl bg-rule/60" />
            <div className="mt-3 h-4 w-3/4 rounded bg-rule/60" />
            <div className="mt-2 h-3 w-1/2 rounded bg-rule/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// A bigger placeholder shape matching the hero banner's layout, shown while
// the homepage's first load is still in flight.
export function HeroSkeleton() {
  return (
    <div className="mb-10 grid animate-pulse gap-4 md:grid-cols-[260px_1fr]">
      <div className="hidden rounded-2xl border border-rule bg-paper-raised p-4 md:block">
        <div className="h-3 w-20 rounded bg-rule/50" />
        <div className="mt-4 space-y-3">
          <div className="h-16 rounded-lg bg-rule/40" />
          <div className="h-16 rounded-lg bg-rule/40" />
          <div className="h-16 rounded-lg bg-rule/40" />
        </div>
      </div>
      <div className="h-72 rounded-2xl bg-rule/40 sm:h-80" />
    </div>
  );
}
