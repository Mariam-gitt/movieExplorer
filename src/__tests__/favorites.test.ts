// TESTING PURE LOGIC: this file tests favorites.ts directly, with no React
// component involved at all — it's the simplest kind of unit test, because
// these functions just take input and produce output (or read/write
// localStorage), with no rendering to worry about.
import { describe, it, expect, beforeEach } from "vitest";
import { getFavoriteIds, setFavoriteIds } from "@/utils/favorites";

// "describe" groups related tests together under one label, shown in the
// test output — purely organisational, doesn't affect whether tests pass.
describe("favorites storage", () => {
  // "beforeEach" runs before EVERY "it" block below. Without this, a
  // favorite saved in one test would still be sitting in localStorage
  // (jsdom's fake one) when the NEXT test runs, making tests depend on
  // each other's order — a classic source of flaky tests.
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty array when nothing has been saved yet", () => {
    expect(getFavoriteIds()).toEqual([]);
  });

  it("saves and then returns the ids you gave it", () => {
    setFavoriteIds([101, 202]);
    expect(getFavoriteIds()).toEqual([101, 202]);
  });

  it("overwrites the previous list rather than merging with it", () => {
    setFavoriteIds([1, 2, 3]);
    setFavoriteIds([9]);
    expect(getFavoriteIds()).toEqual([9]);
  });

  it("survives being read multiple times without changing", () => {
    setFavoriteIds([5, 6]);
    // Calling getFavoriteIds() twice in a row should give back the exact
    // same result both times — reading shouldn't have side effects.
    expect(getFavoriteIds()).toEqual([5, 6]);
    expect(getFavoriteIds()).toEqual([5, 6]);
  });
});
