import Link from "next/link";

import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const CATEGORY_TABS = [
  { href: "/#trending", label: "Trending" },
  { href: "/#popular", label: "Popular" },
  { href: "/#top-rated", label: "Top Rated" },
  { href: "/#upcoming", label: "Upcoming" },
  { href: "/#now-playing", label: "Now Playing" },
  { href: "/genres", label: "Genres" },
];

export default function Navbar() {
  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-rule">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6 md:pl-28">

        {/* Logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-sm font-bold text-stamp">
            M
          </span>

          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            Movie Explorer
          </span>
        </Link>

        {/* Movies dropdown */}
        <NavigationMenu className="shrink-0">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Movies
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                <div className="grid w-48 gap-1 p-2">
                  {CATEGORY_TABS.map((tab) => (
                    <NavigationMenuLink
                      key={tab.href}
                      href={tab.href}
                    >
                      {tab.label}
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Favorites */}
        <Link
          href="/favorites"
          className="shrink-0 rounded-full border border-rule bg-paper-raised px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold"
        >
          Favorites
        </Link>

        {/* Search */}
        <div className="ml-auto">
          <SearchBar />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}