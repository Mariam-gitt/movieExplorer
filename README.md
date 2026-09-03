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

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Movie Explorer App                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ Browser │   │ Next.js  │   │  TMDB   │
   │  (UI)   │   │  Server  │   │   API   │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │             │
        │  Client-Side │  Server-Side│
        │   Rendering  │  Rendering  │
        │              │             │
        └──────────────┼─────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
      ┌─────▼────┐         ┌─────▼──────┐
      │localStorage│        │Query String│
      │ (Favorites)│        │  (Sorting) │
      └───────────┘         └────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── page.tsx (Home - Server Component)
│   │   └── Renders trending movies
│   │
│   ├── search/
│   │   └── page.tsx (Search - Server Component)
│   │       └── Searches movies by title
│   │
│   ├── genres/
│   │   ├── page.tsx (Genres - Server Component)
│   │   │   └── Filters by genre & sorting
│   │   └── loading.tsx (Skeleton fallback)
│   │
│   ├── movies/
│   │   └── [id]/
│   │       ├── page.tsx (Movie Details - Server Component)
│   │       └── loading.tsx (Skeleton fallback)
│   │
│   └── layout.tsx (Root layout)
│
├── components/
│   ├── MovieCard.tsx (Client)
│   │   └── Displays individual movie
│   │
│   ├── MovieGrid.tsx (Client)
│   │   └── Grid of movie cards
│   │
│   ├── FavoriteButton.tsx (Client)
│   │   └── Toggle favorite + persist to localStorage
│   │
│   ├── ShareButton.tsx (Client)
│   │   └── Native share + clipboard fallback
│   │
│   ├── GenreChips.tsx (Server)
│   │   └── Genre filter links
│   │
│   └── SortSelect.tsx (Client)
│       └── Dropdown for sort options
│
├── services/
│   └── movieApi.ts
│       └── TMDB API calls
│
├── utils/
│   └── favorites.ts
│       └── localStorage management
│
└── __tests__/
    ├── favorites.test.ts
    ├── FavoriteButton.test.tsx
    └── ShareButton.test.tsx
```

---

## 📊 Data Flow

### Feature: Favorite Button (Toggle + Persistence)

```
User Clicks Heart
    ↓
FavoriteButton.tsx → handleFavorite()
    ↓
event.stopPropagation()
    ↓
setFavoriteIds() → favorites.ts
    ↓
Write to localStorage + Dispatch "favorites-changed" event
    ↓
subscribeToFavorites listener (useSyncExternalStore) →
    triggers re-render across ALL FavoriteButton instances
    ↓
UI Updates Instantly (No prop drilling needed!)
```

**Why this works:**
- `useSyncExternalStore` provides **external state management** without Redux
- Multiple components stay in sync via browser events
- localStorage persists across page reloads
- No parent-to-child prop drilling required

---

### Feature: Genre Filtering + Sorting (URL-based)

```
User Clicks Genre Chip or Changes Sort Dropdown
    ↓
GenreChips.tsx: Simple <Link href="/genres?genre=28">
  OR
SortSelect.tsx: useSearchParams() + router.push()
    ↓
URL changes to /genres?genre=28&sort=popularity
    ↓
Next.js re-runs genres/page.tsx (Server Component)
    ↓
searchParams automatically updated (no hook needed!)
    ↓
discoverMovies(genreId, sortBy) → TMDB API fetch
    ↓
MovieGrid renders with new results
    ↓
loading.tsx shows skeleton while fetching
```

**Why this works:**
- URL is the single source of truth
- Server Components get `searchParams` automatically
- No client-side state management needed
- Back button works perfectly (no custom navigation logic)

---

### Feature: Skeleton Loading

```
User navigates to /genres?...
    ↓
Next.js finds:
  ├── genres/page.tsx (slow - awaiting TMDB)
  └── genres/loading.tsx (fast - instant render)
    ↓
Automatic wrapping (no manual <Suspense>):
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
    ↓
Show Loading → User sees skeleton immediately
    ↓
page.tsx awaits discoverMovies() → resolves
    ↓
Swap Loading out → Show real MovieGrid
```

**Why this works:**
- Next.js auto-wraps via filename convention (`loading.tsx`)
- No manual Suspense boundaries needed
- Zero layout shift (skeleton mimics real content shape)
- Users never see a blank page

---

### Feature: Share Movie

```
User clicks Share Button
    ↓
ShareButton.tsx → handleShare()
    ↓
Check: "share" in navigator?
    ├─ YES → navigator.share({title, url})
    │   ↓
    │   Device native share sheet opens
    │   (User selects WhatsApp, Email, etc.)
    │
    └─ NO → navigator.clipboard.writeText(url)
        ↓
        URL copied to clipboard
        ↓
        Button shows "Copied!" for 2 seconds
```

**Why this works:**
- Progressive enhancement (graceful fallback)
- Works on mobile (native share) and desktop (clipboard)
- URL always current (`window.location.href` read at click time)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 | Server + Client rendering, file-based routing |
| **Language** | TypeScript 5 | Type safety, better DX |
| **UI Library** | React 19 | Component-based UI |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Testing** | Vitest + React Testing Library | Unit tests, component tests |
| **Linting** | ESLint 9 | Code quality |
| **External API** | TMDB API | Movie data source |
| **Storage** | Browser localStorage | Favorites persistence |
| **Deployment** | Vercel | Fast, zero-config hosting |

--

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or higher
- **npm** or **yarn** or **pnpm**

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

The project includes comprehensive unit tests covering:
- **Pure logic** - favorites utility functions
- **Component interactions** - favorite button clicks
- **Browser APIs** - share/clipboard functionality
- **Async operations** - loading states and data fetching

### Run Tests

```bash
# Run tests once (for CI/CD)
npm test

# Watch mode (for development)
npx vitest
```

### Test Structure

```
src/__tests__/
├── favorites.test.ts           # Pure logic tests
├── FavoriteButton.test.tsx      # Component + interaction tests
└── ShareButton.test.tsx         # Browser API + async tests
```

**Testing Philosophy:**
- Test **user behavior**, not implementation details
- Use React Testing Library's accessible queries (`getByRole`)
- Mock browser APIs only when jsdom doesn't implement them

---

## 📁 Project Structure Explained

```
movieExplorer/
├── src/
│   ├── app/                    # Next.js app directory (routes)
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── search/             # Search route
│   │   ├── genres/             # Genre filtering route
│   │   └── movies/[id]/        # Movie details route
│   │
│   ├── components/             # Reusable React components
│   │   ├── MovieCard.tsx       # Movie card component
│   │   ├── FavoriteButton.tsx  # Favorite toggle component
│   │   ├── ShareButton.tsx     # Share component
│   │   └── ...
│   │
│   ├── services/               # API & external services
│   │   └── movieApi.ts         # TMDB API wrapper
│   │
│   ├── utils/                  # Utility functions
│   │   └── favorites.ts        # localStorage helpers
│   │
│   └── __tests__/              # Unit tests
│       ├── *.test.ts(x)        # Test files
│       └── ...
│
├── public/                     # Static assets (images, fonts)
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── tailwind.config.js          # Tailwind CSS config
└── vitest.config.mts           # Test runner config
```

---

## 🔄 State Management Strategy

### Why No Redux?

This project uses **URL + localStorage + Browser Events** instead of a global state manager:

| State Type | Storage | Method |
|-----------|---------|--------|
| **Sorting/Filtering** | URL Query String | Server-side (no hydration mismatch) |
| **Favorites** | localStorage | `useSyncExternalStore` + custom events |
| **Component UI** | React State | Local `useState` (loading, copied, etc.) |

**Benefits:**
✅ No Redux boilerplate  
✅ URL favorites work out-of-the-box  
✅ Back button works perfectly  
✅ Bookmarking filtered views works  
✅ Favorites sync across tabs automatically  

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

The app is already configured for Vercel and deployed at [movie-explorer-chi-eight.vercel.app](https://movie-explorer-chi-eight.vercel.app).

To deploy your own copy:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Environment Variables:**
- Add your `TMDB_API_KEY` to Vercel's project settings
- (Already configured in the current deployment)

### Deploy to Other Platforms

The project is a standard Next.js app and can run on:
- **Netlify** - Static export (requires custom API routing)
- **AWS** - Via Amplify or Lambda
- **Docker** - Standard Node.js container
- **Self-hosted** - Any Node.js server

---

## 🐛 Common Issues & Solutions

### Favorites Not Persisting?
- Check browser localStorage is enabled
- Verify `utils/favorites.ts` is reading/writing correctly
- Check browser DevTools → Application → localStorage

### Movies Not Loading?
- Verify TMDB API key is set
- Check network tab for API errors
- Ensure browser allows CORS requests to `api.themoviedb.org`

### Build Fails?
- Clear `.next/` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Learning Resources

- **Next.js 16 Docs:** [nextjs.org](https://nextjs.org)
- **React 19:** [react.dev](https://react.dev)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)
- **TMDB API:** [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- **React Testing Library:** [testing-library.com](https://testing-library.com)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Mariam** - [GitHub Profile](https://github.com/Mariam-gitt)

---

## 🎯 Roadmap

Future enhancements planned:
- [ ] User authentication & watchlists
- [ ] Movie ratings & reviews
- [ ] Advanced filtering (year, rating, runtime)



