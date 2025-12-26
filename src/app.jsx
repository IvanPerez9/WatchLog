/**
 * Componente principal App
 * Orquesta toda la aplicación
 * Similar a un @Controller o clase Main en Spring
 */

import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { moviesApi, statusesApi } from './api/supabase.js';
import { tmdbApi } from './api/tmdb.js';
import config from './config.js';
import MovieCard from './components/MovieCard.jsx';
import AddMovie from './components/AddMovie.jsx';
import Filters from './components/Filters.jsx';
import Stats from './components/Stats.jsx';
import { useAuth } from './auth/useAuth.js';
import { BUTTON_STYLES } from './styles/buttonStyles.js';

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

  // Auth
  const { user, login, logout } = useAuth();
  const [token, setToken] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [fillingPosters, setFillingPosters] = useState(false);
  const [posterStatus, setPosterStatus] = useState('');

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
   * Manejar login con Access Token desde el modal
   */
  const handleLoginModal = async () => {
    // Validar que el token coincida con el token válido
    if (token === config.auth.validToken) {
      setShowLoginModal(false);
      setToken('');
      login(token);
      // Ejecutar la acción pendiente si existe
      if (pendingAction) {
        setTimeout(() => {
          pendingAction();
          setPendingAction(null);
        }, 50);
      }
    } else {
      alert('❌ Token inválido');
    }
  };

  /**
   * Verificar autenticación antes de hacer acciones
   */
  const requireAuth = (action) => {
    if (!user) {
      setPendingAction(() => action);
      setShowLoginModal(true);
      return false;
    }
    return true;
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
      
      const statusId = filterStatus === 'all' ? null : parseInt(filterStatus);
      const data = await moviesApi.getAll(currentPage, pageSize, statusId);
      
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
   * Buscar y rellenar posters y años faltantes de forma asíncrona en background
   */
  const fillMissingPosters = async (moviesToProcess) => {
    setFillingPosters(true);
    setPosterStatus('Preparando búsqueda...');
    
    const moviesWithoutPoster = moviesToProcess
      .filter((m) => !m.poster_path)
      .sort((a, b) => b.id - a.id);
    
    if (moviesWithoutPoster.length === 0) {
      setPosterStatus('✅ Todas las películas tienen poster');
      setFillingPosters(false);
      return;
    }

    setPosterStatus(`🎬 Encontradas ${moviesWithoutPoster.length} películas sin poster. Iniciando búsqueda...`);

    let updated = 0;
    for (const movie of moviesWithoutPoster) {
      try {
        setPosterStatus(`⏳ Buscando: ${movie.title}...`);
        
        const tmdbData = await tmdbApi.searchMovie(movie.title);

        if (tmdbData?.poster_path || tmdbData?.year) {
          const updates = {};
          
          if (tmdbData.poster_path) {
            updates.poster_path = tmdbData.poster_path;
          }
          
          if (tmdbData.year && !movie.year) {
            updates.year = tmdbData.year;
          }
          
          if (Object.keys(updates).length > 0) {
            await moviesApi.update(movie.id, updates, user.token);
            updated++;
            setPosterStatus(`✅ ${updated}/${moviesWithoutPoster.length} películas actualizadas`);
          }
        } else {
          setPosterStatus(`⚠️ Sin información: ${movie.title}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error procesando ${movie.title}:`, error);
        setPosterStatus(`❌ Error en: ${movie.title}`);
      }
    }

    setPosterStatus(`🎉 ¡Completado! ${updated} películas actualizadas`);
    await loadAllMovies();
    setFillingPosters(false);
  };

  /**
   * Añadir una nueva película (optimistic update)
   * Muestra la película al instante y busca poster/año en background
   */
  const handleAddMovie = async (title) => {
    if (!requireAuth(() => handleAddMovie(title))) return;
    
    try {
      const pendingStatus = statuses.find((s) => s.description === 'Pendiente');
      
      // Crear película temporal con ID negativo (para diferenciarla)
      const tempId = -Date.now();
      const tempMovie = {
        id: tempId,
        title: title,
        year: null,
        poster_path: null,
        status_id: pendingStatus?.id || 1,
        created_at: new Date().toISOString(),
      };
      
      // Añadir al instante a la UI
      setAllMovies((prev) => [tempMovie, ...prev]);
      
      // Buscar en TMDB en background
      const tmdbData = await tmdbApi.searchMovie(title);
      
      // Actualizar la película temporal con datos de TMDB
      setAllMovies((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                year: tmdbData?.year || null,
                poster_path: tmdbData?.poster_path || null,
              }
            : m
        )
      );
      
      // Crear en la BD
      const createdMovie = await moviesApi.create({
        title: title,
        year: tmdbData?.year || null,
        poster_path: tmdbData?.poster_path || null,
        status_id: pendingStatus?.id || 1,
      }, user.token);
      
      // Reemplazar película temporal con la real (con ID real)
      setAllMovies((prev) =>
        prev.map((m) => (m.id === tempId ? createdMovie : m))
      );
      
      // Resetear página y búsqueda DESPUÉS de crear
      setCurrentPage(0);
      setSearchTerm('');
      
      // Refresco de sincronización después de 500ms
      setTimeout(() => {
        loadAllMovies();
      }, 500);
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Error al añadir película');
    }
  };

  /**
   * Actualizar el estado de una película (optimistic update)
   * Actualiza la UI inmediatamente y hace la petición en background
   */
  const handleStatusChange = async (movieId, newStatusId) => {
    if (!requireAuth(() => handleStatusChange(movieId, newStatusId))) return;
    
    // Guardar estados anteriores por si acaso falla
    const oldAllMovies = allMovies;
    const oldMovies = movies;
    
    try {
      // Actualizar inmediatamente en allMovies (para stats)
      setAllMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, status_id: newStatusId } : m
        )
      );
      
      // Actualizar inmediatamente en movies (para la página actual)
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, status_id: newStatusId } : m
        )
      );
      
      // Hacer la petición en background (sin await)
      moviesApi.update(movieId, { status_id: newStatusId }, user.token)
        .catch((error) => {
          console.error('Error updating movie:', error);
          // Revertir cambios si falla
          setAllMovies(oldAllMovies);
          setMovies(oldMovies);
          alert('Error al actualizar película. Cambio revertido.');
        });
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error al actualizar película');
    }
  };

  /**
   * Eliminar una película (optimistic update)
   * Elimina inmediatamente de la UI y hace la petición en background
   */
  const handleDelete = async (movieId) => {
    if (!requireAuth(() => handleDelete(movieId))) return;
    
    if (!confirm('¿Eliminar esta película?')) return;

    // Guardar estados anteriores por si acaso falla
    const oldAllMovies = allMovies;
    const oldMovies = movies;

    try {
      // Eliminar inmediatamente de allMovies
      setAllMovies((prev) => prev.filter((m) => m.id !== movieId));
      
      // Eliminar inmediatamente de movies
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
      
      // Hacer la petición en background (sin await)
      moviesApi.delete(movieId, user.token)
        .catch((error) => {
          console.error('Error deleting movie:', error);
          // Revertir cambios si falla
          setAllMovies(oldAllMovies);
          setMovies(oldMovies);
          alert('Error al eliminar película. Cambio revertido.');
        });
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error al eliminar película');
    }
  };

  /**
   * Importar películas desde CSV
   */
  const handleImportCSV = async () => {
    if (!requireAuth(() => handleImportCSV())) return;
    
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
        }, user.token);
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
   * Busca por título o año
   * Aplica paginación después de filtrar
   */
  const searchedMovies = allMovies.filter((movie) => {
    const title = movie.title || '';
    const year = movie.year;
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Buscar por título
    const matchesTitle = title
      .toLowerCase()
      .includes(searchLower);
    
    // Buscar por año (si el término de búsqueda es un número)
    const matchesYear = searchLower && /^\d+$/.test(searchLower) && 
      year && 
      year.toString() === searchLower;
    
    return matchesTitle || matchesYear;
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
    if (currentPage < searchTotalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    setCurrentPage(0);
  };

  // Render de la UI - Siempre mostrar la app (sin pantalla de login al inicio)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Film className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">WatchLog</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!user) {
                  setPendingAction(() => () => fillMissingPosters(allMovies));
                  setShowLoginModal(true);
                } else {
                  fillMissingPosters(allMovies);
                }
              }}
              className={BUTTON_STYLES.primary_sm}
              title="Busca posters faltantes en background"
            >
              🎬 Rellenar Posters
            </button>
            <button
              onClick={() => {
                if (!user) {
                  setPendingAction(() => () => setShowImport(!showImport));
                  setShowLoginModal(true);
                } else {
                  setShowImport(!showImport);
                }
              }}
              className={BUTTON_STYLES.primary}
            >
              Importar CSV
            </button>
            {user && (
              <button
                onClick={logout}
                className={BUTTON_STYLES.danger}
              >
                Logout
              </button>
            )}
          </div>
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
                className={BUTTON_STYLES.primary}
              >
                Importar
              </button>
              <button
                onClick={() => setShowImport(false)}
                className={BUTTON_STYLES.secondary}
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
          />
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <Stats 
            movies={allMovies} 
            statuses={statuses}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Status de rellenar posters */}
        {fillingPosters && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-blue-500">
            <p className="text-white text-sm">{posterStatus}</p>
          </div>
        )}

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
                className={BUTTON_STYLES.secondary_lg}
              >
                ← Anterior
              </button>
              
              <span className="text-white">
                Página {currentPage + 1} de {searchTotalPages || 1}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= searchTotalPages - 1}
                className={BUTTON_STYLES.secondary_lg}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-6">Necesitas autenticarte</h2>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Pega tu Access Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleLoginModal}
                  className={BUTTON_STYLES.primary_lg}
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setToken('');
                    setPendingAction(null);
                  }}
                  className={BUTTON_STYLES.secondary}
                >
                  Cancelar
                </button>
              </div>
            </div>
            
            <p className="text-slate-400 text-xs mt-4 text-center">
              Supabase → Settings → API → anon key
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;