export default function SectionHeading({
  kicker,
  title,
}: {
  kicker?: string;
  title: string;
}) {
  return (
    <header className="mb-5 flex items-end justify-between gap-4 border-b border-rule pb-2">
      <div>
        {kicker ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            {kicker}
          </p>
        ) : null}
        <h2 className="font-display text-3xl text-ink">{title}</h2>
      </div>
    </header>
  );
}
