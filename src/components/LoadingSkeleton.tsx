export default function LoadingSkeleton({
  cards = 10,
  label = "Loading movies",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse border border-rule bg-paper-raised p-2"
          >
            <div className="aspect-[2/3] bg-rule/40" />
            <div className="mt-3 h-4 w-3/4 bg-rule/50" />
            <div className="mt-2 h-3 w-1/2 bg-rule/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="mb-12 animate-pulse border border-rule bg-paper-raised p-4 sm:p-6">
      <div className="h-3 w-32 bg-rule/40" />
      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="aspect-[2/3] bg-rule/40" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 bg-rule/50" />
          <div className="h-4 w-full bg-rule/30" />
          <div className="h-4 w-5/6 bg-rule/30" />
        </div>
      </div>
    </div>
  );
}
