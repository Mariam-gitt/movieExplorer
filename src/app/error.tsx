"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="rounded-2xl border border-rule bg-paper-raised p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
        Interrupted
      </p>
      <h1 className="mt-2 font-display text-4xl">The programme did not load</h1>
      <p className="mt-4 max-w-lg text-lg text-ink-soft">
        Movies could not be fetched. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-burgundy px-5 py-2.5 text-sm font-bold text-stamp transition hover:bg-burgundy-deep"
      >
        Try again
      </button>
    </main>
  );
}
