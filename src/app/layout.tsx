// "Metadata" is Next.js's type for page title/description used in the browser tab and SEO.
import type { Metadata } from "next";
// next/font/google downloads and self-hosts Google Fonts at build time (faster + more
// private than linking to Google's servers directly). Plus_Jakarta_Sans is a bold,
// rounded font for headings; Inter is a clean, highly-readable font for body text.
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
// The global stylesheet with all of our theme colours (see globals.css).
import "./globals.css";
// The top navigation bar (logo, search, category tabs).
import Navbar from "@/components/Navbar";
// The floating icon rail on the left edge of the screen (desktop only).
import Sidebar from "@/components/Sidebar";

// Load the display font and expose it as the CSS variable "--font-display".
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  // Only fetch the weights we actually use, to keep the page fast.
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

// Load the body font and expose it as the CSS variable "--font-body".
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// This object is read by Next.js to fill in the <title> and <meta description> tags.
export const metadata: Metadata = {
  title: "Movie Explorer",
  description: "Discover your next favorite movie.",
};

// The RootLayout wraps EVERY page in the app — it's the one place the navbar,
// sidebar and fonts only need to be set up once instead of on every page.
export default function RootLayout({
  children, // "children" is whatever page component Next.js is currently rendering (e.g. the homepage).
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Attach both font CSS variables to the <html> tag so they're available everywhere below.
    // The theme script may set `data-theme` before hydration, so React should ignore that
    // expected server/client mismatch instead of treating it as an error.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* This tiny script runs BEFORE the page paints anything (it's a
            plain <script>, not a React component, so there's no waiting for
            hydration). It reads whatever theme was saved last time and
            applies it immediately — without this, a returning visitor who
            chose dark mode would see a flash of the light theme for a
            split second before ThemeToggle.tsx catches up. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                var saved = localStorage.getItem("theme");
                if (saved === "dark" || saved === "light") {
                  document.documentElement.dataset.theme = saved;
                }
              } catch (e) {
                // localStorage can throw in some private-browsing modes —
                // if that happens, just fall back to the OS theme setting.
              }
            })();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        {/* The sidebar is positioned "fixed" (floats over the page) by its own styles,
            it doesn't take up space in this flow — see Sidebar.tsx. */}
        <Sidebar />
        {/* md:pl-24 pushes the main content right on medium+ screens so it doesn't sit
            underneath the floating sidebar; on small/mobile screens there's no sidebar,
            so no left padding is needed. */}
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 md:pl-28">
          {children}
        </div>
      </body>
    </html>
  );
}
