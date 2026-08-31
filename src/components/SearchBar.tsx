"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex w-full max-w-md items-end gap-2"
    >
      <label className="block min-w-0 flex-1">
        <span className="sr-only">Search movies by title</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title…"
          className="w-full border-0 border-b border-rule bg-transparent px-0 py-2 text-base text-ink placeholder:text-ink-soft/70 focus:border-burgundy focus:ring-0"
        />
      </label>
      <button
        type="submit"
        className="shrink-0 border border-burgundy bg-burgundy px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-stamp hover:bg-burgundy-deep"
      >
        Search
      </button>
    </form>
  );
}
