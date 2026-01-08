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
   * Obtener lista de géneros disponibles
   * GET /genre/movie/list
   * 
   * @returns {Promise<Array|null>} - Array de {id, name} o null si hay error
   */
  getGenreList: async () => {
    try {
      const response = await fetch(
        `${config.tmdb.baseUrl}/genre/movie/list?api_key=${config.tmdb.apiKey}&language=en-US`
      );

      if (!response.ok) {
        console.error('TMDB API error getting genres:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.genres || [];
    } catch (error) {
      console.error('Error fetching genres:', error);
      return null;
    }
  },

  /**
   * Obtener detalles completos de una película (año, géneros, etc)
   * GET /movie/{id}
   * 
   * @param {number} movieId - ID de la película en TMDB
   * @returns {Promise<Object|null>} - Detalles de la película o null
   */
  getMovieDetails: async (movieId) => {
    try {
      const response = await fetch(
        `${config.tmdb.baseUrl}/movie/${movieId}?api_key=${config.tmdb.apiKey}&language=en-US`
      );

      if (!response.ok) {
        console.error('TMDB API error getting details:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  },

  /**
   * Obtener créditos de una película (directores, actores, etc)
   * GET /movie/{id}/credits
   * 
   * @param {number} movieId - ID de la película en TMDB
   * @returns {Promise<Object|null>} - Créditos de la película o null
   */
  getMovieCredits: async (movieId) => {
    try {
      const response = await fetch(
        `${config.tmdb.baseUrl}/movie/${movieId}/credits?api_key=${config.tmdb.apiKey}&language=en-US`
      );

      if (!response.ok) {
        console.error('TMDB API error getting credits:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie credits:', error);
      return null;
    }
  },

  /**
   * Buscar una película por título y obtener todos sus datos
   * GET /search/movie?query={title} + /movie/{id} + /movie/{id}/credits
   * 
   * @param {string} title - Título de la película
   * @returns {Promise<Object|null>} - {year, poster_path, director, genres, tmdb_id} o null si no se encuentra
   */
  searchMovie: async (title) => {
    try {
      // 1. Buscar película por título
      const searchResponse = await fetch(
        `${config.tmdb.baseUrl}/search/movie?api_key=${config.tmdb.apiKey}&query=${encodeURIComponent(title)}&language=en-US`
      );

      if (!searchResponse.ok) {
        console.error('TMDB API error:', searchResponse.statusText);
        return null;
      }

      const searchData = await searchResponse.json();

      // Si no encontramos resultados, retornar null
      if (!searchData.results || searchData.results.length === 0) {
        return null;
      }

      const movieBasic = searchData.results[0];
      const movieId = movieBasic.id;

      // 2. Obtener detalles completos (incluyendo géneros)
      const details = await tmdbApi.getMovieDetails(movieId);
      if (!details) {
        return null;
      }

      // 3. Obtener créditos (para el director)
      const credits = await tmdbApi.getMovieCredits(movieId);
      
      // Extraer director del crew
      let director = null;
      if (credits?.crew) {
        const directorObj = credits.crew.find((person) => person.job === 'Director');
        director = directorObj?.name || null;
      }

      // Extraer géneros
      const genres = details.genres
        ? details.genres.map((g) => g.name)
        : [];

      // Construir URL completa del poster si existe
      const posterPath = details.poster_path 
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
        : null;

      return {
        year: details.release_date ? new Date(details.release_date).getFullYear() : null,
        poster_path: posterPath,
        tmdb_id: movieId,
        overview: details.overview || null,
        director: director,
        genres: genres, // Array de strings: ["Acción", "Aventura", ...]
      };
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