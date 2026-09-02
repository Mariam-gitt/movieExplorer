// TESTING A COMPONENT'S BEHAVIOR, NOT ITS INTERNALS: React Testing Library
// deliberately doesn't let you reach into a component's state directly.
// Instead, you render it like a real browser would, find things on screen
// the way a USER would (by their visible text or accessible label), and
// interact with them the way a user would (clicking). This test doesn't
// know or care that FavoriteButton uses useSyncExternalStore internally —
// it only checks what a person clicking the heart would actually see.
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FavoriteButton from "@/components/FavoriteButton";
import type { Movie } from "@/types/movie";

// A minimal fake movie object — only the fields FavoriteButton actually
// reads (movie.id and movie.title) need real values; TypeScript still
// requires the rest of the Movie type's fields to be present, so we fill
// them with harmless placeholders.
const sampleMovie: Movie = {
  id: 42,
  title: "Test Movie",
  overview: "",
  poster_path: null,
  backdrop_path: null,
  release_date: "2024-01-01",
  vote_average: 7.5,
};

describe("FavoriteButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts unpressed when the movie isn't already a favorite", () => {
    render(<FavoriteButton movie={sampleMovie} />);
    // getByRole finds the element the way a screen reader would — by its
    // ARIA role ("button") and, here, its accessible name (aria-label).
    const button = screen.getByRole("button", {
      name: /add test movie to favorites/i,
    });
    // aria-pressed="false" is how FavoriteButton marks "not currently a
    // favorite" — toBeInTheDocument()/this attribute check comes from the
    // jest-dom matchers registered in vitest.setup.ts.
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("becomes pressed after one click, and saves it to storage", () => {
    render(<FavoriteButton movie={sampleMovie} />);
    const button = screen.getByRole("button", {
      name: /add test movie to favorites/i,
    });

    // fireEvent.click simulates a real mouse click on the element.
    fireEvent.click(button);

    // After clicking, the SAME button should now report itself as pressed,
    // and its accessible name should have flipped to the "remove" phrasing.
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /remove test movie from favorites/i })
    ).toBeInTheDocument();

    // Also check the actual side effect: the movie's id really did get
    // written to localStorage, not just the button's visual state.
    expect(JSON.parse(localStorage.getItem("favorites") ?? "[]")).toEqual([42]);
  });

  it("removes the movie again on a second click (toggle behavior)", () => {
    render(<FavoriteButton movie={sampleMovie} />);
    const button = screen.getByRole("button", {
      name: /add test movie to favorites/i,
    });

    fireEvent.click(button); // add
    fireEvent.click(button); // remove again

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(JSON.parse(localStorage.getItem("favorites") ?? "[]")).toEqual([]);
  });
});
