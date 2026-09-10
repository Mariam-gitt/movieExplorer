// This is a Next.js "Route Handler" — a server-only file that responds to
// HTTP requests at /api/movies/discover, the same way movies/[id]/route.ts
// already does for a single movie. It exists so that CLIENT components
// (code that runs in the browser, like InfiniteMovieGrid.tsx) have a
// same-origin URL to call instead of talking to TMDB directly — this keeps
// the app consistent with the existing getMovieDetails() pattern and avoids
// any browser CORS (Cross-Origin Resource Sharing — a browser security rule
// that blocks a page from freely calling a DIFFERENT website's API) issues.
import type { NextRequest } from "next/server";
import { discoverMovies } from "@/services/movieApi";

// NextRequest is just a normal Request with a few extra Next.js-specific
// conveniences added (like the already-parsed ".nextUrl" used below).
export async function GET(request: NextRequest) {
  // "searchParams" is the parsed "?key=value" part of the incoming request
  // URL — e.g. a request to /api/movies/discover?genre=28&page=2 gives us
  // genre="28" and page="2" here.
  const searchParams = request.nextUrl.searchParams;

  // Every value read from a URL is always a string (or null if missing),
  // so numeric fields have to be explicitly converted with Number(...)
  // before being handed to discoverMovies(), which expects real numbers.
  const genre = searchParams.get("genre");
  const sort = searchParams.get("sort");
  const yearFrom = searchParams.get("yearFrom");
  const yearTo = searchParams.get("yearTo");
  const minRating = searchParams.get("minRating");
  const page = searchParams.get("page");


  try {
    // Re-use the exact same discoverMovies() helper the server-rendered
    // /genres page already calls — one source of truth for how the TMDB
    // "discover" query gets built, whether it's called from the server
    // (first page, in genres/page.tsx) or from here (extra pages, called
    // by the browser once the user scrolls near the bottom).
    const data = await discoverMovies({
      genreId: genre ? Number(genre) : undefined,
      sortBy: sort ?? undefined,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      page: page ? Number(page) : undefined,
    });

    // Response.json(...) is a shortcut that sets the "Content-Type:
    // application/json" header for us and serializes the object to a JSON
    // string body — exactly what the browser's fetch() on the other end
    // expects to receive back.
    return Response.json(data);
  } catch (error) {
    // Log the real error server-side (visible in the terminal running
    // `next dev`/`next start`), but don't leak internal error details to
    // the browser — just a generic failure status.
    console.error("Failed to discover movies (API route):", error);
    return new Response("Failed to discover movies", { status: 502 });
  }
}
