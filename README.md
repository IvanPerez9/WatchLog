# WatchLog - Movie Tracker

Web application to manage your movie library. Track watched, pending, and in-progress movies with automatic TMDB synchronization.

📖 **Read this in**: [Español](README.es.md)

## 🌐 Live Demo

[https://watchlog-vtlx.netlify.app/](https://watchlog-vtlx.netlify.app/) - Hosted on Netlify

See all features in action: authentication, adding movies with poster search, rating system, filters, and more.

![WatchLog Demo](docs/media/WatchLog.gif)

## 📋 Table of Contents
- [Description](#description)
  - [Why does it exist?](#why-does-it-exist)
  - [Principles](#principles)
- [Features](#features)
  - [Core](#core)
  - [Search and Filtering](#search-and-filtering)
  - [Data and Synchronization](#data-and-synchronization)
  - [Interface](#interface)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Deploy](#deploy)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)
- [Resources](#resources)
- [Future Improvements](#future-improvements)

## 📖 Description

Web application to manage your movie library. Track watched, pending, and in-progress movies with automatic TMDB synchronization.

### Why does it exist?

**WatchLog** was born from the need to have a single centralized place to manage all your entertainment content. Tired of using third-party applications or CSVs to record what movies you watched.

**Future vision:** Expand beyond movies to include TV series and books. A unified space where you **own your data** and can access it from any device, anytime.

### Principles

- 🎯 **Centralized** - All your content in one place
- 🔒 **Private** - Your data, your server, no spying algorithms
- 📱 **Accessible** - From mobile, tablet or desktop
- 🚀 **Open** - Open source, you can fork and customize

## ✨ Features

### Core
- 🎬 **Movies & Series** - Complete CRUD for movies and TV series
- 🔐 **Secure Authentication** - Token-based with database validation
- 💾 **Persistence** - All data stored in PostgreSQL (Supabase)

### Status Management
- **Movies**: Pending, Watched, Favorite
- **Series**: Pending, Watched, Favorite, Watching (track current series)
- Track seasons watched for series with progress bar

### Search and Filtering
- 🔍 **Global Search** - By title, year, or director
- 🎭 **Filter by Status** - View content by current status
- ⭐ **Filter by Rating** - Find highly-rated content
- 🎬 **Filter by Genre** - Organize by content type
- 📊 **Statistics** - Visual breakdown by status

### Data and Synchronization
- 🖼️ **Automatic Posters** - TMDB integration for covers
- ⭐ **Rating System** - Rate with half-star precision
- 📥 **Export Data** - Download library as CSV or JSON

### Interface
- 📱 **Responsive Design** - Mobile, tablet and desktop
- ⚡ **Ultra Fast** - Built with Vite
- 🌙 **Dark Theme** - Easy on the eyes

## 📋 Requirements

- **Node.js** 16 or higher
- **npm** or **yarn**
- Account on [Supabase](https://supabase.com) (free)
- API key from [TMDB](https://www.themoviedb.org/settings/api) (free)

## 🚀 Installation

### 1. Fork the repository

👉 **Click "Fork" button** on [GitHub](https://github.com/IvanPerez9/WatchLog) to create your own copy.

Then clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/WatchLog.git
cd WatchLog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a free account on [Supabase](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and execute `SUPABASE_SETUP.sql` from this repo
4. Copy your credentials:
   - `VITE_SUPABASE_URL`: Settings → API → Project URL
   - `VITE_SUPABASE_ANON_KEY`: Settings → API → anon key

### 4. Configure environment variables

Create a `.env` file in the root (never commit this!):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_AUTH_TOKEN=your_secret_token_here
```

⚠️ **Security**: Add `.env` to `.gitignore` - it's already there, never push this file!

Reference: See `.env.example` for the structure

### 5. Get TMDB API Key (Optional but Recommended)

1. Register on [TMDB](https://www.themoviedb.org/settings/api)
2. Create an API key (free tier available)
3. Add it to `.env` as `VITE_TMDB_API_KEY`

### 6. Create your auth token

Generate a strong random token (no spaces):

```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any online generator: https://random.org/strings/
```

Then:
1. Add it to `.env` as `VITE_AUTH_TOKEN`
2. Add it to Supabase: SQL Editor → Insert into `valid_tokens` table

### 7. Start development

```bash
npm run dev
```

Open http://localhost:3000

## 💻 Usage

## 💻 Usage

### View & Search
- 👁️ Switch between Movies and Series tabs
- 🔍 Search by title, year, or director
- 🎭 Filter by status (Pending, Watched, Favorite, Watching)
- ⭐ Filter by minimum rating

### Manage Content
Sign in with your token to:
- ➕ Add new movies/series
- ⭐ Rate with half-star precision
- 🎯 Change status
- 🗑️ Delete items

### Series-Specific
- 📺 Track current season with +/- buttons
- 📊 Progress bar shows seasons watched
- 📥 Auto-sync from TMDB

## 🚀 Deploy

### Netlify (Recommended)

1. Push to GitHub
2. Connect to [Netlify](https://app.netlify.com)
3. Automatic configuration:
   - Build: `npm run build`
   - Publish: `dist`
4. Add environment variables in dashboard
5. ✨ Automatic deploy on each push


## 🛠️ Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Interactive UI |
| Styles | Tailwind CSS | Responsive styling |
| Icons | Lucide React | Modern icons |
| Backend | Supabase | PostgreSQL + REST API |
| External Data | TMDB API | Movie information |
| Auth | Token-based | Security |

## 📁 Project Structure

```
watchlog/
├── src/
│   ├── app.jsx              # Main component
│   ├── config.js            # Configuration
│   ├── api/
│   │   ├── supabase.js      # REST client
│   │   └── tmdb.js          # TMDB client
│   ├── auth/
│   │   └── useAuth.js       # Auth hook
│   └── components/
│       ├── MovieCard.jsx    
│       ├── AddMovie.jsx     
│       ├── Filters.jsx      
│       └── Stats.jsx        
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## 💻 Development

### Available Scripts

```bash
npm run dev      # Development with HMR
npm run build    # Optimized build
npm run preview  # Build preview
```

### Environment variables in development

Use `.env.example` as reference for new contributors.

## 📄 License

This project is under the **MIT** license.

You are free to:
- ✅ Use in personal projects
- ✅ Use in commercial projects
- ✅ Modify the code
- ✅ Distribute

Conditions:
- 📝 Include copy of the license

See [LICENSE](LICENSE.md) for more details.

## 🚀 Future Improvements

### Phase 2 - Export & Analytics ✅
- [x] CSV/JSON export functionality
- [x] Advanced filters (by year range, director, etc.)
- [x] Sort options (by rating, date added, etc.)

### Phase 3 - TV Series Support
- [ ] Separate `series` table in database
- [ ] TMDB TV API integration
- [ ] Series card component with episodes/seasons
- [ ] Series management (add, edit, delete, rate)
- [ ] Search and filter for series

### Phase 4 - Books Support (Q2 2026)
- [ ] Separate `books` table in database
- [ ] Google Books API or OpenLibrary integration
- [ ] Book card component with author/ISBN
- [ ] ISBN search capability
- [ ] Books management (add, edit, delete, rate)

### Phase 5 - Advanced Features
- [ ] Custom lists and collections
- [ ] Dark/Light theme toggle
- [ ] Change languaje
...
- [ ] Change languaje
...

---

<div align="center">

[⬆️ Back to top](#watchlog---movie-tracker)

</div>
