import SearchBar from "./SearchBar";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <h1>Movie Explorer</h1>
      <Link href="/">Home</Link>
<Link href="/favorites">Favorites ❤️</Link>

      <SearchBar />
    </nav>
  );
}