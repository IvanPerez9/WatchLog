/**
 * Componente principal App
 * Orquesta toda la aplicación
 * Similar a un @Controller o clase Main en Spring
 */

import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { moviesApi, statusesApi } from './api/supabase.js';
import { tmdbApi } from './api/tmdb.js';
import MovieCard from './components/MovieCard.js';
import AddMovie from './components/AddMovie.js';
import Filters from './components/Filters.js';
import Stats from './components/Stats.js';

const App = () => {
  // Estado global de la aplicación (como variables de instancia)
  const [movies, setMovies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCsvData] = useState('');

  /**
   * useEffect se ejecuta cuando el componente se monta
   * Similar a @PostConstruct en Spring
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Cargar datos iniciales (estados y películas)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await loadStatuses();
      await loadMovies();
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
   * Cargar películas desde Supabase
   */
  const loadMovies = async () => {
    const data = await moviesApi.getAll();
    setMovies(data || []);
  };

  /**
   * Añadir una nueva película
   * 1. Busca info en TMDB
   * 2. Crea en Supabase
   * 3. Recarga la lista
   */
  const handleAddMovie = async (title) => {
    try {
      // Buscar en TMDB
      const tmdbData = await tmdbApi.searchMovie(title);
      
      // Obtener el estado "Pendiente" por defecto
      const pendingStatus = statuses.find((s) => s.description === 'Pendiente');

      // Crear en Supabase
      await moviesApi.create({
        title: title,
        year: tmdbData?.year || null,
        poster_path: tmdbData?.poster_path || null,
        status_id: pendingStatus?.id || 1,
      });

      // Recargar lista
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
   * Filtrar películas según búsqueda y estado
   */
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || movie.status_id === parseInt(filterStatus);
    return matchesSearch && matchesFilter;
  });

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
            onFilterChange={setFilterStatus}
            statuses={statuses}
          />
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <Stats movies={movies} statuses={statuses} />
        </div>

        {/* Lista de películas */}
        {loading ? (
          <div className="text-center text-white py-12">Cargando películas...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No hay películas que mostrar
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default App;