# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000 (auto-opens browser)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

No linting, formatting, or test framework is configured.

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_TMDB_API_KEY` — The Movie Database API key
- `VITE_AUTH_TOKEN` — App access token (validated server-side against `valid_tokens` table)
- `VITE_GOOGLE_BOOKS_API_KEY` — (Optional) Google Books API key for better rate limits

### Google Books API Key (Optional)

Without a key: ~1000 requests/day shared by IP.  
With a key: 1000 requests/day per project (more with billing).

To get a key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or use existing)
3. Enable [Google Books API](https://console.cloud.google.com/apis/library/books.googleapis.com)
4. **Create credentials > API key**
5. Copy the key to `VITE_GOOGLE_BOOKS_API_KEY` in `.env`

`src/config.js` validates these at startup and throws if required vars are missing.

### Netlify Deployment

This project is deployed on **Netlify**. Environment variables must be configured in the Netlify dashboard.

To set up environment variables in Netlify:
1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site → **Site settings**
3. Scroll to **Build & deploy → Environment variables**
4. Click **Add a variable** and add each required variable

Required variables for production:
```
VITE_SUPABASE_URL = <your-supabase-url>
VITE_SUPABASE_ANON_KEY = <your-supabase-anon-key>
VITE_TMDB_API_KEY = <your-tmdb-api-key>
VITE_AUTH_TOKEN = <your-auth-token>
VITE_GOOGLE_BOOKS_API_KEY = <your-google-books-api-key> (optional)
```

**Important:** Variables prefixed with `VITE_` are embedded into the client bundle at build time. Never commit actual values to git — use Netlify's dashboard instead.

Netlify CLI alternative:
```bash
netlify env:set VITE_GOOGLE_BOOKS_API_KEY "your-key-here"
```

## Architecture

**WatchLog** is a React 19 + Vite 7 SPA for managing a personal library of movies, TV series, and books. Tailwind CSS is loaded via CDN (no PostCSS/build step for styles).

### Data flow

```
App.jsx (smart container — all global state lives here)
  └── API clients (src/api/) ←→ Supabase / TMDB / Google Books
  └── Feature components (movies/, series/, books/) — presentation only
  └── Shared UI (components/shared/, components/common/)
```

`App.jsx` (~53 KB) is intentionally large: it owns all state (items, filters, pagination, auth), fetches data, and passes handlers down as props. Child components are mostly stateless.

### API layer (`src/api/`)

| File | Purpose |
|---|---|
| `supabase-client.js` | Supabase SDK instance |
| `supabase.js` | CRUD wrappers for movies, series, books |
| `tmdb.js` | Search + metadata fetch from TMDB; includes fuzzy similarity matching |
| `googlebooks.js` | Book search/lookup via Google Books API |

### Auth

Token-based — `src/auth/useAuth.js` manages a token stored in `localStorage`. The token is validated against the `valid_tokens` Supabase table. `LoginModal.jsx` handles the UI.

### Database schema

Defined in `SUPABASE_SETUP.sql`. Key tables: `movies`, `series`, `books`, `statuses`, `valid_tokens`. Ratings are constrained to 0.5–5.0 in 0.5 increments. All three content tables share the same status vocabulary via a `statuses` FK.

### Styling conventions

- Tailwind CSS utility classes throughout (no CSS modules or styled-components)
- Shared button/element class strings centralized in `src/styles/buttonStyles.js` — use these instead of repeating class strings
- Responsive mobile-first design; index.html includes mobile-specific CSS to prevent input zoom (font-size 16px)

## Code Style

Only add comments on complex or non-obvious code. Skip comments on self-evident logic.

### Utilities (`src/utils/`)

- `ratingUtils.js` — format ratings on the 0.5–5.0 scale
- `dateUtils.js` — relative time formatting ("2 hours ago")
- `exportUtils.js` — CSV and JSON export logic
