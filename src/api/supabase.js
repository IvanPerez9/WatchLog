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
 * Para GET: usa anonKey (público)
 * Para POST/PATCH/DELETE: usa anonKey (ya que las RLS están permitidas públicamente)
 */
const supabaseFetch = async (endpoint, options = {}) => {
  const url = `${config.supabase.url}/rest/v1/${endpoint}`;
  console.log('🔗 Supabase URL:', url);
  
  // Siempre usar anonKey (las RLS están configuradas para permitir todo públicamente)
  const apiKey = config.supabase.anonKey;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  console.log('📡 Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Supabase error:', errorText);
    throw new Error(`Supabase error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Data received:', data);
  return data;
};

/**
 * API de Movies - CRUD completo
 * Como un MovieRepository o MovieService
 * 
 * IMPORTANTE: Las tablas en MAYÚSCULAS necesitan comillas dobles en Supabase
 */
export const moviesApi = {
  /**
   * GET /movies - Listar películas con paginación
   */
  getAll: async (page = 0, pageSize = 20, statusId = null) => {
    console.log('📞 Llamando a getAll con:', { page, pageSize, statusId });
    
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Construir query base con JOIN a status
    let query = `movies?select=id,title,year,poster_path,status_id,status!inner(description)&order=id.desc`;
    
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