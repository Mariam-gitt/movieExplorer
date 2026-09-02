import LoadingSkeleton from "@/components/LoadingSkeleton";

// FILE NAME MATTERS HERE: Next.js treats any file literally named
// "loading.tsx" inside a route folder (src/app/genres/) as special. It
// automatically wraps the matching "page.tsx" in a React <Suspense>
// boundary and shows THIS component as a placeholder for as long as that
// page's async work (the "await discoverMovies(...)" call in
// src/app/genres/page.tsx) hasn't finished yet — you never call or import
// this file yourself, Next.js does it for you based purely on the filename
// and folder location.
export default function Loading() {
  return (
    <main>
      {/* Two grey placeholder bars standing in for the "Browse by genre"
          heading and the row of genre chips + sort dropdown, so the page
          doesn't visually "jump" once the real content pops in. */}
      <div className="mb-5 h-8 w-56 animate-pulse rounded bg-rule/40" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-20 animate-pulse rounded-full bg-rule/30"
          />
        ))}
      </div>
      <LoadingSkeleton label="Loading movies" />
    </main>
  );
}
