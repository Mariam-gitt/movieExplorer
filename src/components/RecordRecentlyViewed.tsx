"use client"; // Needs localStorage (see utils/recentlyViewed.ts), which only
// exists in the browser, so this must be a Client Component.

import { useEffect } from "react";
import { recordMovieViewed } from "@/utils/recentlyViewed";

type RecordRecentlyViewedProps = {
  // PROP FLOW: parent (movies/[id]/page.tsx, a Server Component) -> child
  // (this component). The parent already fetched the full movie and just
  // hands this component the one number it actually needs.
  movieId: number;
};

// This component renders NOTHING visible — its only job is a side effect:
// "the user is looking at this movie's details page right now, so save its
// id to the recently-viewed list". Splitting it out as its own tiny
// component (instead of putting a useEffect directly in the movie details
// page) is what lets the details page stay a Server Component — Server
// Components can't use hooks like useEffect at all, but they CAN render a
// small Client Component like this one inside themselves.
export default function RecordRecentlyViewed({
  movieId,
}: RecordRecentlyViewedProps) {
  // The empty dependency behaviour here is intentional: this effect should
  // re-run whenever movieId changes (e.g. the user clicks from one movie's
  // "Similar movies" row straight into another movie's details page,
  // without a full page reload) — so movieId IS listed as a dependency.
  useEffect(() => {
    recordMovieViewed(movieId);
  }, [movieId]);

  // Returning null means "render no DOM at all" — valid for any React
  // component, and exactly what an invisible, effect-only component wants.
  return null;
}
