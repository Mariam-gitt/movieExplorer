# 🎬 Movie Explorer

A modern, full-featured web application for exploring movies, discovering new favorites, and managing your personal collection. Built with **Next.js 16**, **React 19**, and **TypeScript** for a lightning-fast, type-safe user experience.

**Live Demo:** [movie-explorer-chi-eight.vercel.app](https://movie-explorer-chi-eight.vercel.app)

---

## ✨ Key Features

- 🎥 **Browse & Discover** - Explore trending movies and search by title
- 🎞️ **Genre Filtering** - Filter movies by genre with dynamic URL-based sorting
- ❤️ **Favorites** - Persistent favorites storage with real-time sync across the app
- 📱 **Share** - Native share functionality with clipboard fallback
- ⚡ **Skeleton Loading** - Smooth loading states with skeleton screens
- 🧪 **Fully Tested** - Comprehensive unit tests with Vitest + React Testing Library
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- ♿ **Accessible** - Built with WCAG accessibility standards

---

## 🏗️ Architecture Overview

### System Components

The application follows a **Client-Server** architecture with **Server-Side Rendering (SSR)**:

- **Browser (Frontend)** - React components rendering UI
- **Next.js Server** - Handles Server Components, API routing, and data fetching
- **TMDB API** - External movie data source
- **Browser Storage** - localStorage for favorites persistence
- **URL State** - Query parameters for filtering and sorting

### Component Hierarchy

```
App Root (layout.tsx)
│
├── Home Page (/)
│   └── MovieGrid → [MovieCard + FavoriteButton]
│
├── Search Page (/search)
│   ├── SearchInput
│   └── MovieGrid → [MovieCard + FavoriteButton]
│
├── Genres Page (/genres)
│   ├── GenreChips (filter by genre)
│   ├── SortSelect (dropdown sort options)
│   ├── loading.tsx (skeleton fallback)
│   └── MovieGrid → [MovieCard + FavoriteButton]
│
└── Movie Details Page (/movies/[id])
    ├── MovieHeader (title, rating, overview)
    ├── ShareButton
    ├── FavoriteButton
    ├── loading.tsx (skeleton fallback)
    └── Additional details
```

### Directory Structure

```
src/
├── app/                          # Next.js 16 App Router (file-based routes)
│   ├── page.tsx                  # Home page (Server Component)
│   ├── layout.tsx                # Root layout wrapper
│   │
│   ├── search/
│   │   └── page.tsx              # Search page (Server Component)
│   │
│   ├── genres/
│   │   ├── page.tsx              # Genre browse page (Server Component)
│   │   └── loading.tsx           # Skeleton loader (auto-wrapped by Next.js)
│   │
│   └── movies/
│       └── [id]/
│           ├── page.tsx          # Movie details page (Server Component)
│           └── loading.tsx       # Skeleton loader
│
├── components/                   # Reusable React components
│   ├── MovieCard.tsx             # Movie card display (Client Component)
│   ├── MovieGrid.tsx             # Grid layout for movies (Client Component)
│   ├── FavoriteButton.tsx        # Favorite toggle button (Client Component)
│   ├── ShareButton.tsx           # Share functionality (Client Component)
│   ├── GenreChips.tsx            # Genre filter chips (Server Component)
│   ├── SortSelect.tsx            # Sort dropdown (Client Component)
│   └── ...other components
│
├── services/
│   └── movieApi.ts               # TMDB API integration & data fetching
│
├── utils/
│   └── favorites.ts              # localStorage helpers & favorites logic
│
└── __tests__/                    # Unit tests
    ├── favorites.test.ts         # Pure logic tests
    ├── FavoriteButton.test.tsx   # Component interaction tests
    └── ShareButton.test.tsx      # Browser API tests
```

---

## 📊 Data Flow & Key Features

### Feature 1: Favorites (Toggle + Persistence)

**How it works:**

1. User clicks the heart icon on a movie card
2. `FavoriteButton.tsx` prevents event bubbling (stops parent `<Link>` from triggering)
3. `setFavoriteIds()` writes the updated favorites array to `localStorage`
4. A custom `"favorites-changed"` browser event is dispatched
5. All `FavoriteButton` instances listening via `useSyncExternalStore()` automatically re-render
6. The heart icon updates instantly across the entire app (no prop drilling needed)
7. Favorites persist across page reloads and browser sessions

**Why this approach:**

- Uses `useSyncExternalStore` hook for external state management (no Redux needed)
- localStorage provides cross-session persistence
- Browser events synchronize multiple components without manual re-render logic
- No loading spinners—updates are instant

---

### Feature 2: Genre Filtering + Sorting (URL-Based)

**How it works:**

1. User clicks a genre chip (e.g., "Action") or changes the sort dropdown
2. For genre chips: they're simple `<Link>` elements, so clicking triggers normal browser navigation to `/genres?genre=28`
3. For sort dropdown: Client Component uses `useSearchParams()` to read the URL, then `router.push()` to update it to `/genres?genre=28&sort=popularity`
4. Next.js re-runs the `genres/page.tsx` Server Component with the new query parameters
5. `searchParams` are automatically available (no hook needed—Server Components receive them directly)
6. `discoverMovies()` fetches updated data from TMDB based on the new filters
7. MovieGrid renders with the new results
8. While loading, the skeleton from `loading.tsx` displays smoothly

**Why this approach:**

- URL is the single source of truth (bookmarks and the back button work perfectly)
- Server Components handle data fetching—no hydration mismatches
- No complex state management—just read the URL
- Users see immediate visual feedback with skeleton loading

---

### Feature 3: Skeleton Loading

**How it works:**

1. User navigates to a route like `/genres` or `/movies/123`
2. Next.js automatically looks for a `loading.tsx` file in that folder
3. While the Server Component (`page.tsx`) is fetching data (awaiting TMDB API), React shows the skeleton (`loading.tsx`)
4. The skeleton mimics the shape of real content (poster-sized boxes, title bars)
5. Once the data fetch completes, React swaps out the skeleton and shows the real page
6. No blank white screen—users always see something

**Why this approach:**

- Automatic—no manual `<Suspense>` boundaries needed, just naming convention
- Zero layout shift (skeleton layout matches final content layout)
- Better perceived performance than spinners or blank pages

---

### Feature 4: Share Movie Link

**How it works:**

1. User clicks the "Share" button on a movie detail page
2. `ShareButton.tsx` checks if the browser supports the native Web Share API: `"share" in navigator`
3. **On mobile (or browsers with share support):** Opens the device's native share sheet
   - User can select WhatsApp, Email, Twitter, etc.
   - URL is always current (read at click time: `window.location.href`)
4. **On desktop (or if native share fails):** Falls back to `navigator.clipboard.writeText(url)`
   - Copies URL to clipboard
   - Button text changes to "Copied!" for 2 seconds
5. Both paths provide a working solution—progressive enhancement

**Why this approach:**

- Works everywhere (mobile has native share, desktop has clipboard)
- Graceful fallback if one method fails
- No third-party share APIs needed

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 | SSR, file-based routing, Server & Client Components |
| **Language** | TypeScript 5 | Type safety, better developer experience |
| **UI Library** | React 19 | Component-based UI, hooks |
| **Styling** | Tailwind CSS 4 | Utility-first CSS, responsive design |
| **Testing** | Vitest + React Testing Library | Fast unit tests, behavior-focused testing |
| **Linting** | ESLint 9 | Code quality & consistency |
| **External API** | TMDB API | Movie database & metadata |
| **Storage** | Browser localStorage | Client-side favorites persistence |
| **Deployment** | Vercel | Optimized Next.js hosting |

---

## 📊 Project Composition

```
TypeScript: 91.7% ████████████████████
CSS:         7.8% █
JavaScript:  0.5% 
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or higher
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/Mariam-gitt/movieExplorer.git
cd movieExplorer

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server (with hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will auto-reload as you edit files.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

The project includes comprehensive unit tests covering different testing scenarios:

### Test Coverage

- **Pure Logic** (`favorites.test.ts`) - Tests utility functions without rendering
- **Component Interaction** (`FavoriteButton.test.tsx`) - Tests user interactions and state updates
- **Browser APIs** (`ShareButton.test.tsx`) - Tests native browser APIs with mocks
- **Async Operations** - Tests async behavior and loading states

### Run Tests

```bash
# Run tests once (for CI/CD pipelines)
npm test

# Watch mode (for active development)
npx vitest
```

### Test Philosophy

- Test **user behavior**, not internal implementation details
- Use accessible queries (`getByRole`, `getByText`) instead of targeting DOM internals
- Mock only what jsdom doesn't implement (browser APIs)
- Keep tests maintainable—refactoring internals shouldn't break passing tests

---

## 🔄 State Management Strategy

Unlike traditional Redux applications, this project uses a **lightweight, distributed state approach**:

| State Type | Storage | Method |
|-----------|---------|--------|
| **Filtering & Sorting** | URL Query String | Server-side processing (no hydration issues) |
| **User Favorites** | Browser localStorage | `useSyncExternalStore` + custom events |
| **Component UI** | React `useState` | Local component state (loading, copied status, etc.) |

**Why this works better than Redux:**

✅ **Simpler codebase** - No action creators, reducers, or dispatch boilerplate  
✅ **URL state is bookmarkable** - Users can share filtered views  
✅ **Back button works naturally** - No custom navigation logic needed  
✅ **Favorites sync across tabs** - localStorage events fire globally  
✅ **Faster initial load** - No store hydration overhead  

---

## 📁 File-by-File Breakdown

### Server Components (Pages)

- **`app/page.tsx`** - Fetches trending movies and displays them
- **`app/search/page.tsx`** - Searches movies by query string
- **`app/genres/page.tsx`** - Filters by genre and sorting, uses `searchParams`
- **`app/movies/[id]/page.tsx`** - Displays movie details and related info

### Client Components (Interactive Elements)

- **`FavoriteButton.tsx`** - Toggles favorite status, syncs via `useSyncExternalStore`
- **`ShareButton.tsx`** - Handles native share + clipboard fallback
- **`SortSelect.tsx`** - Dropdown to change sort order via URL
- **`MovieGrid.tsx`** - Grid layout container for movie cards

### Server Components (Non-Interactive)

- **`GenreChips.tsx`** - Genre filter links (pure links, no JS needed)
- **`MovieCard.tsx`** - Movie display card (can be Server or Client)

### Services & Utilities

- **`services/movieApi.ts`** - TMDB API wrapper with fetch logic
- **`utils/favorites.ts`** - localStorage helpers (`getFavoriteIds`, `setFavoriteIds`, etc.)

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

The app is currently deployed at [movie-explorer-chi-eight.vercel.app](https://movie-explorer-chi-eight.vercel.app).

To deploy your own copy:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (prompts for configuration)
vercel
```

### Environment Variables

- `TMDB_API_KEY` - Your TMDB API key for movie data
- Set in Vercel project settings under "Environment Variables"

### Other Deployment Options

- **Netlify** - Standard Node.js deployment
- **AWS** - Via Amplify or Lambda
- **Docker** - Containerized Node.js app
- **Self-Hosted** - Any Node.js server

---

## 🐛 Troubleshooting

### Issue: Favorites not saving
**Solution:**
- Verify localStorage is enabled in your browser
- Check DevTools → Application → localStorage
- Confirm `utils/favorites.ts` is reading/writing correctly

### Issue: Movies not loading
**Solution:**
- Verify TMDB API key is configured
- Check DevTools → Network tab for API errors
- Ensure CORS is allowed for `api.themoviedb.org`

### Issue: Build fails with TypeScript errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install

# Check for type errors
npx tsc --noEmit
```

### Issue: Styles not applying
**Solution:**
- Verify Tailwind CSS is configured in `tailwind.config.js`
- Check that CSS file imports are in `layout.tsx`
- Rebuild with `npm run build`

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create a feature branch** - `git checkout -b feature/amazing-feature`
3. **Make your changes** - Write code and tests
4. **Run tests** - `npm test` to ensure everything passes
5. **Commit** - `git commit -m 'Add amazing feature'`
6. **Push** - `git push origin feature/amazing-feature`
7. **Open a Pull Request** - Describe your changes

---

## 📚 Learning Resources

- **Next.js Documentation** - [nextjs.org](https://nextjs.org)
- **React 19** - [react.dev](https://react.dev)
- **Tailwind CSS** - [tailwindcss.com](https://tailwindcss.com)
- **TMDB API** - [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- **React Testing Library** - [testing-library.com](https://testing-library.com)
- **Vitest** - [vitest.dev](https://vitest.dev)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Mariam** - [GitHub Profile](https://github.com/Mariam-gitt)

---

## 🎯 Roadmap

Future enhancements planned:

- [ ] User authentication & personal watchlists
- [ ] Movie ratings & user reviews
- [ ] Advanced filtering (release year, IMDb rating, runtime)
- [ ] Dark mode theme toggle
- [ ] Internationalization (i18n) for multiple languages
- [ ] Recommendation engine based on favorites
- [ ] Mobile app (React Native)

---

**Happy exploring! 🍿**
