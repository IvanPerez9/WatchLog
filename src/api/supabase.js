/**
 * 
 * Supabase expone una REST API automática basada en schema de la BBDD
 */

import config from '../config.js';

/**
 * Función auxiliar para hacer fetch a Supabase
 * Similar a RestTemplate.exchange() en Spring
 */
const supabaseFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${config.supabase.url}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': config.supabase.anonKey,
      'Authorization': `Bearer ${config.supabase.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation', // Para que devuelva el objeto creado/actualizado
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.statusText}`);
  }

  return response.json();
};

/**
 * API de Movies - CRUD completo
 * Como un MovieRepository o MovieService
 */
export const moviesApi = {
  /**
   * GET /movies - Listar todas las películas con sus estados
   * SQL: SELECT m.*, s.description FROM movies m JOIN statuses s ON m.status_id = s.id
   */
  getAll: async () => {
    return supabaseFetch('movies?select=*,statuses(description)&order=created_at.desc');
  },

  /**
   * POST /movies - Crear una película
   * @param {Object} movie - {title, year, status_id, poster_path}
   */
  create: async (movie) => {
    return supabaseFetch('movies', {
      method: 'POST',
      body: JSON.stringify(movie),
    });
  },

  /**
   * PATCH /movies?id=eq.{id} - Actualizar una película
   * @param {number} id - ID de la película
   * @param {Object} updates - Campos a actualizar
   */
  update: async (id, updates) => {
    return supabaseFetch(`movies?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * DELETE /movies?id=eq.{id} - Eliminar una película
   * @param {number} id - ID de la película
   */
  delete: async (id) => {
    return supabaseFetch(`movies?id=eq.${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * API de Statuses - Solo lectura
 */
export const statusesApi = {
  /**
   * GET /statuses - Listar todos los estados
   */
  getAll: async () => {
    return supabaseFetch('statuses?select=*');
  },
};