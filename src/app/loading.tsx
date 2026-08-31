import LoadingSkeleton, { HeroSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <main>
      <HeroSkeleton />
      <p className="mb-5 font-display text-3xl">Setting the programme…</p>
      <LoadingSkeleton />
    </main>
  );
}
