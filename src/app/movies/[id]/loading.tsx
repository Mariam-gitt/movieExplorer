import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <main>
      <div className="mb-8 h-40 animate-pulse border border-rule bg-rule/30 sm:h-56" />
      <div className="mb-10 grid gap-8 md:grid-cols-[240px_1fr]">
        <div className="aspect-[2/3] animate-pulse bg-rule/40" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 animate-pulse bg-rule/40" />
          <div className="h-4 w-full animate-pulse bg-rule/30" />
          <div className="h-4 w-5/6 animate-pulse bg-rule/30" />
        </div>
      </div>
      <LoadingSkeleton cards={6} label="Loading movie details" />
    </main>
  );
}
