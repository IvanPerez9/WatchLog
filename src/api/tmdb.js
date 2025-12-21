/**
 * Cliente HTTP para TMDB (The Movie Database)
 * Documentación: https://developers.themoviedb.org/3/search/search-movies
 */

import config from '../config.js';

/**
 * API de TMDB
 */
export const tmdbApi = {
  /**
   * Buscar una película por título
   * GET /search/movie?query={title}
   * 
   * @param {string} title - Título de la película
   * @returns {Promise<Object|null>} - {year, poster_path} o null si no se encuentra
   */
  searchMovie: async (title) => {
    try {
      const response = await fetch(
        `${config.tmdb.baseUrl}/search/movie?api_key=${config.tmdb.apiKey}&query=${encodeURIComponent(title)}&language=es-ES`
      );

      if (!response.ok) {
        console.error('TMDB API error:', response.statusText);
        return null;
      }

      const data = await response.json();

      // Si encontramos resultados, devolvemos el primero
      if (data.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
          poster_path: movie.poster_path || null,
          tmdb_id: movie.id,
          overview: movie.overview || null,
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return null;
    }
  },

  /**
   * Construir URL completa del póster
   * @param {string} posterPath - Path del póster (ej: /abc123.jpg)
   * @returns {string|null} - URL completa o null
   */
  getPosterUrl: (posterPath) => {
    return posterPath ? `${config.tmdb.imageBaseUrl}${posterPath}` : null;
  },
};