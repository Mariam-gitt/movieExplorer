"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main>
      <h1>Something went wrong.</h1>
      <p>We couldn&apos;t load the movies.</p>

      <button onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}