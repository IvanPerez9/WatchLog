/**
 * Cliente HTTP para Supabase
 * Similar a un @Service o @Repository en Spring Boot
 * 
 * Supabase expone una REST API automática basada en tu schema
 * Es como si tuvieras un CRUD REST generado automáticamente
 */

import config from '../config.js';

/**
 * Función auxiliar para hacer fetch a Supabase
 * Maneja headers, autenticación y errores
 */
const supabaseFetch = async (endpoint, options = {}, token = null) => {
  const url = `${config.supabase.url}/rest/v1/${endpoint}`;
  
  const apiKey = config.supabase.anonKey;
  
  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers,
  };

  // Si hay token, añadirlo al header para validación en RLS
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Supabase error:', errorText);
    throw new Error(`Supabase error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * API de Movies - CRUD completo
 */
export const moviesApi = {
  /**
   * GET /movies - Listar películas con paginación (sin token requerido)
   */
  getAll: async (page = 0, pageSize = 20, statusId = null) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Construir query base con JOIN a status (INCLUYE rating, director, genres)
    let query = `movies?select=id,title,year,poster_path,status_id,rating,director,genres,updated_at,status!inner(description)&order=updated_at.desc,id.desc`;
    
    // Añadir filtro por status si es necesario
    if (statusId !== null) {
      query += `&status_id=eq.${statusId}`;
    }
    
    console.log('🔗 Query final:', query);
    
    try {
      // Hacer la petición con header Range para paginación
      const result = await supabaseFetch(query, {
        headers: {
          'Range': `${from}-${to}`,
        }
      });
      
      console.log('📦 Resultado:', result);
      console.log('📊 Total items:', result?.length || 0);
      
      return result;
    } catch (error) {
      console.error('❌ Error en getAll:', error);
      return [];
    }
  },

  /**
   * GET /movies - Contar total de películas (para paginación)
   * @param {number|null} statusId - Filtrar por estado (null = todos)
   */
  count: async (statusId = null) => {
    let query = 'movies?select=count';
    
    if (statusId !== null) {
      query += `&status_id=eq.${statusId}`;
    }
    
    const result = await supabaseFetch(query, {
      headers: {
        'Prefer': 'count=exact',
      }
    });
    
    return result;
  },

  /**
   * POST /movies - Crear una película
   * @param {Object} movie - {title, year, status_id, poster_path}
   * @param {string} token - Token de autenticación
   */
  create: async (movie, token) => {
    return supabaseFetch('movies', {
      method: 'POST',
      body: JSON.stringify(movie),
    }, token);
  },

  /**
   * PATCH /movies?id=eq.{id} - Actualizar una película
   * @param {number} id - ID de la película
   * @param {Object} updates - Campos a actualizar
   * @param {string} token - Token de autenticación
   */
  update: async (id, updates, token) => {
    return supabaseFetch(`movies?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, token);
  },

  /**
   * DELETE /movies?id=eq.{id} - Eliminar una película
   * @param {number} id - ID de la película
   * @param {string} token - Token de autenticación
   */
  delete: async (id, token) => {
    return supabaseFetch(`movies?id=eq.${id}`, {
      method: 'DELETE',
    }, token);
  },
};

/**
 * API de Series - CRUD completo (Phase 3)
 */
export const seriesApi = {
  /**
   * GET /series - Listar series con paginación (sin token requerido)
   */
  getAll: async (page = 0, pageSize = 20, statusId = null) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Construir query base con JOIN a status (INCLUYE rating, genres)
    let query = `series?select=id,title,year,poster_path,status_id,rating,genres,total_seasons,current_season,updated_at,status!inner(description)&order=updated_at.desc,id.desc`;
    
    // Añadir filtro por status si es necesario
    if (statusId !== null) {
      query += `&status_id=eq.${statusId}`;
    }
    
    console.log('🔗 Series Query final:', query);
    
    try {
      // Hacer la petición con header Range para paginación
      const result = await supabaseFetch(query, {
        headers: {
          'Range': `${from}-${to}`,
        }
      });
      
      console.log('📦 Series Resultado:', result);
      console.log('📊 Total items:', result?.length || 0);
      
      return result;
    } catch (error) {
      console.error('❌ Error en getAll series:', error);
      return [];
    }
  },

  /**
   * GET /series - Contar total de series (para paginación)
   * @param {number|null} statusId - Filtrar por estado (null = todos)
   */
  count: async (statusId = null) => {
    let query = 'series?select=count';
    
    if (statusId !== null) {
      query += `&status_id=eq.${statusId}`;
    }
    
    const result = await supabaseFetch(query, {
      headers: {
        'Prefer': 'count=exact',
      }
    });
    
    return result;
  },

  /**
   * POST /series - Crear una serie
   * @param {Object} series - {title, year, status_id, poster_path, genres, total_seasons}
   * @param {string} token - Token de autenticación
   */
  create: async (series, token) => {
    return supabaseFetch('series', {
      method: 'POST',
      body: JSON.stringify(series),
    }, token);
  },

  /**
   * PATCH /series?id=eq.{id} - Actualizar una serie
   * @param {number} id - ID de la serie
   * @param {Object} updates - Campos a actualizar
   * @param {string} token - Token de autenticación
   */
  update: async (id, updates, token) => {
    return supabaseFetch(`series?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, token);
  },

  /**
   * DELETE /series?id=eq.{id} - Eliminar una serie
   * @param {number} id - ID de la serie
   * @param {string} token - Token de autenticación
   */
  delete: async (id, token) => {
    return supabaseFetch(`series?id=eq.${id}`, {
      method: 'DELETE',
    }, token);
  },
};

/**
 * API de Status - Solo lectura
 */
export const statusesApi = {
  /**
   * GET /status - Listar todos los estados
   */
  getAll: async () => {
    return supabaseFetch('status?select=*');
  },
};

/**
 * API de Books - CRUD completo (Phase 4)
 */
export const booksApi = {
  /**
   * GET /books - Listar libros con paginación (sin token requerido)
   */
  getAll: async (page = 0, pageSize = 20, statusId = null) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Construir query base con JOIN a status
    let query = `books?select=id,title,author,year,isbn,cover_path,status_id,rating,genres,total_pages,updated_at,status!inner(description)&order=updated_at.desc,id.desc`;
    
    // Añadir filtro por status si es necesario
    if (statusId !== null) {
      query += `&status_id=eq.${statusId}`;
    }
    
    try {
      const result = await supabaseFetch(query, {
        headers: {
          'Range': `${from}-${to}`,
        }
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error en getAll books:', error);
      return [];
    }
  },

  /**
   * GET /books - Contar total de libros (para paginación)
   */
  count: async (statusId = null) => {
    let query = 'books?select=count';
    
    if (statusId !== null) {
      query += `&status_id=eq.${statusId}`;
    }
    
    const result = await supabaseFetch(query, {
      headers: {
        'Prefer': 'count=exact',
      }
    });
    
    return result;
  },

  /**
   * POST /books - Crear un libro
   * @param {Object} book - {title, author, year, isbn, cover_path, genres, total_pages, status_id, rating}
   * @param {string} token - Token de autenticación
   */
  create: async (book, token) => {
    return supabaseFetch('books', {
      method: 'POST',
      body: JSON.stringify(book),
    }, token);
  },

  /**
   * PATCH /books?id=eq.{id} - Actualizar un libro
   * @param {number} id - ID del libro
   * @param {Object} updates - Campos a actualizar
   * @param {string} token - Token de autenticación
   */
  update: async (id, updates, token) => {
    return supabaseFetch(`books?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, token);
  },

  /**
   * DELETE /books?id=eq.{id} - Eliminar un libro
   * @param {number} id - ID del libro
   * @param {string} token - Token de autenticación
   */
  delete: async (id, token) => {
    return supabaseFetch(`books?id=eq.${id}`, {
      method: 'DELETE',
    }, token);
  },
};