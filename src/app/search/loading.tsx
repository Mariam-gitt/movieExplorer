import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <main>
      <p className="mb-6 font-display text-3xl">Searching the programme…</p>
      <LoadingSkeleton label="Searching for movies" />
    </main>
  );
}
