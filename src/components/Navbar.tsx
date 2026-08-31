import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="border-b border-rule bg-paper-raised/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Link href="/" className="group block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Screening notes
            </p>
            <h1 className="font-display text-3xl leading-none text-ink sm:text-4xl">
              Movie Explorer
            </h1>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-5 text-sm font-semibold uppercase tracking-[0.16em]">
            <Link href="/" className="text-ink-soft hover:text-burgundy">
              Home
            </Link>
            <Link href="/favorites" className="text-ink-soft hover:text-burgundy">
              Favorites
            </Link>
          </nav>
        </div>

        <SearchBar />
      </div>
    </header>
  );
}
