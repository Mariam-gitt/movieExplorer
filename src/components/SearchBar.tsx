"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch() {
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search movies..."
      />

      <button onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}