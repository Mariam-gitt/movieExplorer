export default function SectionHeading({
  kicker, // Small label above the title, e.g. "This week" — optional context.
  title, // The big heading text, e.g. "Trending movies".
}: {
  kicker?: string;
  title: string;
}) {
  return (
    // "header" here is a semantic tag meaning "the intro area of a section",
    // it doesn't do anything visual by itself.
    <header className="mb-5 flex items-end justify-between gap-4">
      <div>
        {/* Only render the kicker row if one was actually passed in. */}
        {kicker ? (
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wide text-gold uppercase">
            {/* A tiny dot bullet, purely decorative flourish next to the kicker text. */}
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            {kicker}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
    </header>
  );
}
