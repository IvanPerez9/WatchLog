/**
 * Vite lee las variables del .env que empiezan con VITE_
 */

// TODO revisar url de tmdb
const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  tmdb: {
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  },
};

// Validación: lanzar error si faltan configuraciones críticas
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing Supabase configuration. Check your .env file');
}

if (!config.tmdb.apiKey) {
  throw new Error('Missing TMDB API key. Check your .env file');
}

export default config;