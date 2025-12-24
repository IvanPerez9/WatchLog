/**
 * Componente principal App
 * Orquesta toda la aplicación
 * Similar a un @Controller o clase Main en Spring
 */

import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { moviesApi, statusesApi } from './api/supabase.js';
import { tmdbApi } from './api/tmdb.js';
import MovieCard from './components/MovieCard.jsx';
import AddMovie from './components/AddMovie.jsx';
import Filters from './components/Filters.jsx';
import Stats from './components/Stats.jsx';

const App = () => {
  // Estado global de la aplicación
  const [movies, setMovies] = useState([]);  // Películas de la página actual (20)
  const [allMovies, setAllMovies] = useState([]);  // Todas las películas (para búsqueda y stats)
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCsvData] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalMovies, setTotalMovies] = useState(0);
  const pageSize = 20;

  /**
   * useEffect se ejecuta cuando el componente se monta o cuando cambian las dependencias
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar películas cuando cambia la página o el filtro
  useEffect(() => {
    if (statuses.length > 0) {
      loadMovies();
      loadAllMovies();
    }
  }, [currentPage, filterStatus]);

  /**
   * Cargar datos iniciales (estados y películas)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await loadStatuses();
      await loadMovies();
      
      // Cargar todas las películas en background
      loadAllMovies();
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Error al cargar datos. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estados desde Supabase
   */
  const loadStatuses = async () => {
    const data = await statusesApi.getAll();
    setStatuses(data || []);
  };

  /**
   * Cargar películas desde Supabase con paginación (para mostrar 20 por página)
   */
  const loadMovies = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando películas - Página:', currentPage, 'Filtro:', filterStatus);
      
      const statusId = filterStatus === 'all' ? null : parseInt(filterStatus);
      const data = await moviesApi.getAll(currentPage, pageSize, statusId);
      
      console.log('📦 Datos recibidos:', data);
      console.log('📊 Total películas en página:', data?.length || 0);
      
      setMovies(data || []);
      
      // Obtener el total real de películas
      await loadTotalCount(statusId);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar TODAS las películas sin paginación (para búsqueda y stats)
   */
  const loadAllMovies = async () => {
    try {
      const statusId = filterStatus === 'all' ? null : parseInt(filterStatus);
      
      // Cargar todas sin paginación
      const data = await moviesApi.getAll(0, 10000, statusId);
      setAllMovies(data || []);
    } catch (error) {
      console.error('Error loading all movies:', error);
    }
  };

  /**
   * Obtener total de películas (para calcular páginas)
   */
  const loadTotalCount = async (statusId = null) => {
    try {
      const data = await moviesApi.count(statusId);
      const count = data[0].count;
      setTotalMovies(count);
    } catch (error) {
      console.error('Error loading total count:', error);
    }
  };

  /**
   * Añadir una nueva película
   * 1. Busca info en TMDB
   * 2. Crea en Supabase
   * 3. Recarga la lista
   */
  const handleAddMovie = async (title) => {
    try {
      const tmdbData = await tmdbApi.searchMovie(title);
      
      // Obtener el estado "Pendiente" por defecto
      const pendingStatus = statuses.find((s) => s.description === 'Pendiente');

      await moviesApi.create({
        title: title,
        year: tmdbData?.year || null,
        poster_path: tmdbData?.poster_path || null,
        status_id: pendingStatus?.id || 1,
      });

      await loadMovies();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Error al añadir película');
    }
  };

  /**
   * Actualizar el estado de una película
   */
  const handleStatusChange = async (movieId, newStatusId) => {
    try {
      await moviesApi.update(movieId, { status_id: newStatusId });
      await loadMovies();
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error al actualizar película');
    }
  };

  /**
   * Eliminar una película
   */
  const handleDelete = async (movieId) => {
    if (!confirm('¿Eliminar esta película?')) return;

    try {
      await moviesApi.delete(movieId);
      await loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error al eliminar película');
    }
  };

  /**
   * Importar películas desde CSV
   * Formato: Título,Estado
   */
  const handleImportCSV = async () => {
    if (!csvData.trim()) return;

    try {
      const lines = csvData.split('\n').filter((line) => line.trim());
      const vistaStatus = statuses.find((s) => s.description === 'Vista');
      const pendienteStatus = statuses.find((s) => s.description === 'Pendiente');

      for (const line of lines) {
        const [title, status] = line.split(',').map((s) => s.trim());
        if (!title) continue;

        const tmdbData = await tmdbApi.searchMovie(title);
        const statusId =
          status?.toLowerCase() === 'vista'
            ? vistaStatus?.id
            : pendienteStatus?.id;

        await moviesApi.create({
          title,
          year: tmdbData?.year || null,
          poster_path: tmdbData?.poster_path || null,
          status_id: statusId || 1,
        });
      }

      setCsvData('');
      setShowImport(false);
      await loadMovies();
      alert('Películas importadas correctamente');
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error al importar CSV');
    }
  };

  /**
   * Filtrar películas según búsqueda (en TODAS las películas)
   * Aplica paginación después de filtrar
   */
  const searchedMovies = allMovies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Aplicar paginación al resultado de búsqueda
  const from = currentPage * pageSize;
  const to = from + pageSize;
  const filteredMovies = searchedMovies.slice(from, to);
  const searchTotalPages = Math.ceil(searchedMovies.length / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    setCurrentPage(0); // Reset a primera página
  };

  // Render de la UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Film className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">WatchLog</h1>
          </div>
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Importar CSV
          </button>
        </div>

        {/* Sección de importar CSV */}
        {showImport && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-white text-lg font-semibold mb-3">
              Importar desde CSV
            </h3>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Título,Estado&#10;Inception,vista&#10;Dune,pendiente"
              className="w-full h-32 bg-slate-700 text-white p-3 rounded-lg mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleImportCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Importar
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Formulario añadir película */}
        <div className="mb-6">
          <AddMovie onAdd={handleAddMovie} />
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Filters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            statuses={statuses}
          />
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <Stats movies={allMovies} statuses={statuses} />
        </div>

        {/* Lista de películas */}
        {loading ? (
          <div className="text-center text-white py-12">Cargando películas...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No hay películas que mostrar
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  statuses={statuses}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Controles de paginación */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Anterior
              </button>
              
              <span className="text-white">
                Página {currentPage + 1} de {searchTotalPages || 1}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= searchTotalPages - 1}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;