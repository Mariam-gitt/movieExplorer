// Same idea as api/movies/discover/route.ts: a thin server-side proxy in
// front of TMDB's search endpoint, so browser code (the keyboard-friendly
// search suggestions dropdown, and infinite scroll on the /search page) has
// a same-origin URL to call instead of hitting TMDB directly.
import type { NextRequest } from "next/server";
import { searchMovies } from "@/services/movieApi";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const page = searchParams.get("page");

  // A missing/empty "q" isn't a server error — it's just an invalid
  // request, so this uses "400 Bad Request" (the browser's fault) instead
  // of "500 Internal Server Error" (our fault).
  if (!query || !query.trim()) {
    return new Response("Missing required 'q' query parameter", { status: 400 });
  }

  try {
    const data = await searchMovies(query, page ? Number(page) : undefined);
    return Response.json(data);
  } catch (error) {
    console.error("Failed to search movies (API route):", error);
    return new Response("Failed to search movies", { status: 502 });
  }
}
