import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This config tells Vitest (the test runner) HOW to run our tests: using
// React's plugin (so it understands JSX in our .tsx files), in a fake
// "jsdom" browser environment (since our components use browser-only
// things like localStorage, clicking, etc. — Node.js alone has none of
// that), and how to resolve the "@/..." import shortcut our source files
// already use everywhere (e.g. "@/utils/favorites").
export default defineConfig({
  plugins: [react()],
  test: {
    // "jsdom" is a JavaScript library that fakes an entire browser (DOM,
    // window, localStorage, etc.) inside Node.js, purely for tests — no
    // real browser window ever opens.
    environment: "jsdom",
    // Runs once before EVERY test file, to register extra assertion
    // helpers like .toBeInTheDocument() (see vitest.setup.ts).
    setupFiles: "./vitest.setup.ts",
    globals: true, // lets us write `describe`/`it`/`expect` without importing them each time
  },
  resolve: {
    alias: {
      // Mirrors the "@/*" path alias already configured in tsconfig.json,
      // so test files can import components the exact same way the app's
      // own source files do.
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
