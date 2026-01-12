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
   * Calcular similitud entre dos strings (0-1)
   * Usa algoritmo simple: coincidencia de caracteres / longitud promedio
   */
  calculateSimilarity: (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Coincidencia exacta
    if (s1 === s2) return 1;
    
    // Si uno es substring del otro
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    // Levenshtein distance simplificado
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = tmdbApi.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  },

  /**
   * Calcular distancia de Levenshtein entre dos strings
   */
  levenshteinDistance: (s1, s2) => {
    const len1 = s1.length;
    const len2 = s2.length;
    const d = [];

    for (let i = 0; i <= len1; i++) {
      d[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      d[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
      }
    }

    return d[len1][len2];
  },

  /**
   * Encontrar el resultado más similar en una lista de películas/series
   */
  findBestMatch: (searchTitle, results) => {
    if (!results || results.length === 0) return null;
    
    let bestMatch = results[0];
    // Para series usa 'name', para películas usa 'title'
    const firstTitle = results[0].title || results[0].name;
    const firstOriginal = results[0].original_title || results[0].original_name;
    
    let highestSimilarity = firstTitle ? tmdbApi.calculateSimilarity(searchTitle, firstTitle) : 0;
    
    // Comparar con original_title/original_name también
    if (firstOriginal) {
      let originalSimilarity = tmdbApi.calculateSimilarity(searchTitle, firstOriginal);
      if (originalSimilarity > highestSimilarity) {
        highestSimilarity = originalSimilarity;
      }
    }
    
    for (let i = 1; i < results.length; i++) {
      const item = results[i];
      const itemTitle = item.title || item.name;
      const itemOriginal = item.original_title || item.original_name;
      
      let titleSimilarity = itemTitle ? tmdbApi.calculateSimilarity(searchTitle, itemTitle) : 0;
      let originalSimilarity = itemOriginal ? tmdbApi.calculateSimilarity(searchTitle, itemOriginal) : 0;
      const maxSimilarity = Math.max(titleSimilarity, originalSimilarity);
      
      if (maxSimilarity > highestSimilarity) {
        highestSimilarity = maxSimilarity;
        bestMatch = item;
      }
    }
    
    return bestMatch;
  },

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

      // Encontrar el resultado más similar al título buscado
      const movieBasic = tmdbApi.findBestMatch(title, searchData.results);
      if (!movieBasic) {
        return null;
      }
      
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

  /**
   * Obtener detalles completos de una serie (años, géneros, temporadas, etc)
   * GET /tv/{id}
   * 
   * @param {number} seriesId - ID de la serie en TMDB
   * @returns {Promise<Object|null>} - Detalles de la serie o null
   */
  getSeriesDetails: async (seriesId) => {
    try {
      const response = await fetch(
        `${config.tmdb.baseUrl}/tv/${seriesId}?api_key=${config.tmdb.apiKey}&language=en-US`
      );

      if (!response.ok) {
        console.error('TMDB API error getting series details:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching series details:', error);
      return null;
    }
  },

  /**
   * Buscar una serie por título y obtener todos sus datos
   * GET /search/tv?query={title} + /tv/{id}
   * 
   * @param {string} title - Título de la serie
   * @returns {Promise<Object|null>} - {year, poster_path, genres, total_seasons, tmdb_id} o null si no se encuentra
   */
  searchSeries: async (title) => {
    try {
      // 1. Buscar serie por título
      const searchResponse = await fetch(
        `${config.tmdb.baseUrl}/search/tv?api_key=${config.tmdb.apiKey}&query=${encodeURIComponent(title)}&language=en-US`
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

      // Encontrar el resultado más similar al título buscado
      const seriesBasic = tmdbApi.findBestMatch(title, searchData.results);
      if (!seriesBasic) {
        return null;
      }
      
      const seriesId = seriesBasic.id;

      // 2. Obtener detalles completos (incluyendo géneros y número de temporadas)
      const details = await tmdbApi.getSeriesDetails(seriesId);
      if (!details) {
        return null;
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
        year: details.first_air_date ? new Date(details.first_air_date).getFullYear() : null,
        poster_path: posterPath,
        tmdb_id: seriesId,
        overview: details.overview || null,
        genres: genres, // Array de strings: ["Drama", "Crime", ...]
        total_seasons: details.number_of_seasons || null,
      };
    } catch (error) {
      console.error('Error searching TMDB series:', error);
      return null;
    }
  },
};