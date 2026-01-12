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
import Export from './components/Export.jsx';
import { useAuth } from './auth/useAuth.js';
import { BUTTON_STYLES } from './styles/buttonStyles.js';

const App = () => {
  // Get current page from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const pageFromURL = parseInt(searchParams.get('page') || '0');
  
  // Global application state
  const [movies, setMovies] = useState([]);  // Movies on current page (20)
  const [allMovies, setAllMovies] = useState([]);  // All movies (for search and stats)
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [minRating, setMinRating] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPageInternal] = useState(pageFromURL);
  const [totalMovies, setTotalMovies] = useState(0);
  const pageSize = 20;

  // Wrapper function to update page and URL
  const setCurrentPage = (newPage) => {
    setCurrentPageInternal(newPage);
    const url = new URL(window.location);
    url.searchParams.set('page', newPage);
    window.history.replaceState({}, '', url);
  };

  // Auth
  const { user, login, logout } = useAuth();
  const [token, setToken] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [shouldOpenAddMovieAfterLogin, setShouldOpenAddMovieAfterLogin] = useState(false);
  const [fillingTMDB, setFillingTMDB] = useState(false);
  const [tmdbFillStatus, setTMDBFillStatus] = useState('');
  
  // Genre filter
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

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
   * Cargar datos iniciales (estados, géneros y películas)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await loadStatuses();
      await loadGenres();
      await loadMovies();
      
      // Cargar todas las películas en background
      loadAllMovies();
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Error loading data. Check the console.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar géneros desde TMDB
   */
  const loadGenres = async () => {
    const data = await tmdbApi.getGenreList();
    setGenres(data || []);
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
      // Abrir modal de Add Movie si fue el trigger
      if (shouldOpenAddMovieAfterLogin) {
        setTimeout(() => {
          setShowAddMovieModal(true);
          setShouldOpenAddMovieAfterLogin(false);
        }, 50);
      }
    } else {
      alert('❌ Invalid Token');
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
    // Filtrar estados "Viendo" y "Watching" (reservados para series en el futuro)
    const filtered = data ? data.filter(s => s.description !== 'Viendo' && s.description !== 'Watching') : [];
    setStatuses(filtered);
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
   * Search and fill missing TMDB data (posters/year/director/genres) asynchronously in the background
   */
  const fillMissingTMDBData = async (moviesToProcess) => {
    setFillingTMDB(true);
    setTMDBFillStatus('Preparando búsqueda...');
    
    const moviesWithMissingData = moviesToProcess
      .filter((m) => !m.poster_path || !m.year || !m.director || !m.genres)
      .sort((a, b) => b.id - a.id);
    
    if (moviesWithMissingData.length === 0) {
      setTMDBFillStatus('✅ Toda la información está completa');
      setFillingTMDB(false);
      return;
    }

    setTMDBFillStatus(`🎬 Encontradas ${moviesWithMissingData.length} películas incompletas. Iniciando búsqueda...`);

    let updated = 0;
    for (const movie of moviesWithMissingData) {
      try {
        setTMDBFillStatus(`⏳ Buscando información: ${movie.title}...`);
        
        const tmdbData = await tmdbApi.searchMovie(movie.title);

        if (tmdbData?.poster_path || tmdbData?.year || tmdbData?.director || tmdbData?.genres) {
          const updates = {};
          
          if (tmdbData.poster_path) {
            updates.poster_path = tmdbData.poster_path;
          }
          
          if (tmdbData.year && !movie.year) {
            updates.year = tmdbData.year;
          }

          if (tmdbData.director && !movie.director) {
            updates.director = tmdbData.director;
          }

          if (tmdbData.genres && !movie.genres) {
            updates.genres = JSON.stringify(tmdbData.genres);
          }
          
          if (Object.keys(updates).length > 0) {
            await moviesApi.update(movie.id, updates, user.token);
            updated++;
            setTMDBFillStatus(`✅ ${updated}/${moviesWithMissingData.length} películas actualizadas`);
          }
        } else {
          setTMDBFillStatus(`⚠️ Sin información: ${movie.title}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error procesando ${movie.title}:`, error);
        setTMDBFillStatus(`❌ Error en: ${movie.title}`);
      }
    }

    setTMDBFillStatus(`🎉 ¡Completado! ${updated} películas actualizadas`);
    await loadAllMovies();
    setFillingTMDB(false);
  };

  /**
   * Añadir una nueva película - versión INTERNA (sin verificación de auth)
   * Muestra la película al instante y busca poster/año/director/géneros en background
   */
  const _addMovie = async (title) => {
    try {
      const pendingStatus = statuses.find((s) => s.description === 'Pendiente');
      
      // Crear película temporal con ID negativo (para diferenciarla)
      const tempId = -Date.now();
      const tempMovie = {
        id: tempId,
        title: title,
        year: null,
        poster_path: null,
        director: null,
        genres: null,
        status_id: pendingStatus?.id || 1,
        created_at: new Date().toISOString(),
      };
      
      // Añadir al instante a la UI
      setAllMovies((prev) => [tempMovie, ...prev]);
      
      // Buscar en TMDB en background (obtiene año, poster, director, géneros)
      const tmdbData = await tmdbApi.searchMovie(title);
      
      // Actualizar la película temporal con datos de TMDB
      setAllMovies((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                year: tmdbData?.year || null,
                poster_path: tmdbData?.poster_path || null,
                director: tmdbData?.director || null,
                genres: tmdbData?.genres ? JSON.stringify(tmdbData.genres) : null,
              }
            : m
        )
      );
      
      // Crear en la BD con todos los datos
      const createdMovie = await moviesApi.create({
        title: title,
        year: tmdbData?.year || null,
        poster_path: tmdbData?.poster_path || null,
        director: tmdbData?.director || null,
        genres: tmdbData?.genres ? JSON.stringify(tmdbData.genres) : null,
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
      alert('Error adding movie');
    }
  };

  /**
   * Añadir película - versión PÚBLICA (con verificación de auth)
   */
  const handleAddMovie = async (title) => {
    if (!requireAuth(() => _addMovie(title))) return;
    await _addMovie(title);
  };

  /**
   * Actualizar estado - versión INTERNA (sin verificación de auth)
   */
  const _changeStatus = async (movieId, newStatusId) => {
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
          alert('Error updating movie. Change reverted.');
        });
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error updating movie');
    }
  };

  /**
   * Actualizar estado - versión PÚBLICA (con verificación de auth)
   */
  const handleStatusChange = async (movieId, newStatusId) => {
    if (!requireAuth(() => _changeStatus(movieId, newStatusId))) return;
    await _changeStatus(movieId, newStatusId);
  };

  /**
   * Actualizar rating - versión INTERNA (sin verificación de auth)
   */
  const _updateRating = async (movieId, newRating) => {
    // Guardar estado anterior
    const oldAllMovies = allMovies;
    const oldMovies = movies;
    
    try {
      // Actualizar inmediatamente
      setAllMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, rating: newRating } : m
        )
      );
      
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, rating: newRating } : m
        )
      );
      
      // Hacer la petición en background
      moviesApi.update(movieId, { rating: newRating }, user.token)
        .catch((error) => {
          console.error('Error updating rating:', error);
          // Revertir cambios si falla
          setAllMovies(oldAllMovies);
          setMovies(oldMovies);
        });
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  /**
   * Actualizar rating - versión PÚBLICA (con verificación de auth)
   */
  const handleRatingChange = async (movieId, newRating) => {
    if (!requireAuth(() => _updateRating(movieId, newRating))) return;
    await _updateRating(movieId, newRating);
  };

  /**
   * Eliminar película - versión INTERNA (sin verificación de auth)
   */
  const _deleteMovie = async (movieId) => {
    if (!confirm('Delete this movie?')) return;

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
          alert('Error deleting movie. Change reverted.');
        });
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error deleting movie');
    }
  };

  /**
   * Eliminar película - versión PÚBLICA (con verificación de auth)
   */
  const handleDelete = async (movieId) => {
    if (!requireAuth(() => _deleteMovie(movieId))) return;
    await _deleteMovie(movieId);
  };

  /**
   * Filtrar películas según búsqueda, rating y género
   * Busca por título, año o director
   * Aplica paginación después de filtrar
   */
  const searchedMovies = allMovies.filter((movie) => {
    const title = movie.title || '';
    const year = movie.year;
    const director = movie.director || '';
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Buscar por título
    const matchesTitle = title
      .toLowerCase()
      .includes(searchLower);
    
    // Buscar por año (si el término de búsqueda es un número)
    const matchesYear = searchLower && /^\d+$/.test(searchLower) && 
      year && 
      year.toString() === searchLower;
    
    // Buscar por director
    const matchesDirector = searchLower && 
      director
        .toLowerCase()
        .includes(searchLower);
    
    // Filtrar por rating mínimo
    const matchesRating = !minRating || (movie.rating && movie.rating >= minRating);
    
    // Filtrar por género
    let matchesGenre = true;
    if (selectedGenre) {
      try {
        const movieGenres = movie.genres ? JSON.parse(movie.genres) : [];
        matchesGenre = movieGenres.includes(selectedGenre);
      } catch (e) {
        matchesGenre = false;
      }
    }
    
    return (matchesTitle || matchesYear || matchesDirector) && matchesRating && matchesGenre;
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <button
            onClick={() => {
              // Reset everything to initial state
              setSearchTerm('');
              setCurrentPage(0);
              setFilterStatus('all');
              setMinRating(0);
              setSelectedGenre(null);
              setShowAddMovieModal(false);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer group"
            title="Click to reset filters"
          >
            <Film className="w-10 h-10 text-purple-400 group-hover:scale-110 transition" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">WatchLog</h1>
          </button>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (!user) {
                  setPendingAction(() => () => fillMissingTMDBData(allMovies));
                  setShowLoginModal(true);
                } else {
                  fillMissingTMDBData(allMovies);
                }
              }}
              className={`${BUTTON_STYLES.primary_sm} flex-1 sm:flex-none text-sm`}
              title="Completa poster, año, director y géneros desde TMDB"
            >
              🔍 Complete TMDB
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className={`${BUTTON_STYLES.primary_sm} flex-1 sm:flex-none text-sm`}
              title="Exporta tu librería"
            >
              💾 Export
            </button>
            <button
              onClick={() => {
                if (!user) {
                  setShouldOpenAddMovieAfterLogin(true);
                  setShowLoginModal(true);
                } else {
                  setShowAddMovieModal(true);
                }
              }}
              className={`${BUTTON_STYLES.primary_sm} flex-1 sm:flex-none text-sm`}
            >
              ➕ Add Movie
            </button>
            {user && (
              <button
                onClick={logout}
                className={`${BUTTON_STYLES.danger} flex-1 sm:flex-none text-sm`}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Filters
            searchTerm={searchTerm}
            onSearchChange={(term) => {
              setSearchTerm(term);
              setCurrentPage(0);
            }}
            minRating={minRating}
            onMinRatingChange={(rating) => {
              setMinRating(rating);
              setCurrentPage(0);
            }}
            selectedGenre={selectedGenre}
            onGenreChange={(genre) => {
              setSelectedGenre(genre);
              setCurrentPage(0);
            }}
            genres={genres}
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

        {/* Status de completar datos TMDB */}
        {fillingTMDB && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-blue-500">
            <p className="text-white text-sm">{tmdbFillStatus}</p>
          </div>
        )}

        {/* Lista de películas */}
        {loading ? (
          <div className="text-center text-white py-12">Loading movies...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No movies to show
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
                  onRatingChange={handleRatingChange}
                  user={user}
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
                ← Previous
              </button>
              
              <span className="text-white">
                Page {currentPage + 1} of {searchTotalPages || 1}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= searchTotalPages - 1}
                className={BUTTON_STYLES.secondary_lg}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-6">You need to authenticate</h2>
            
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Paste your Access Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleLoginModal}
                  className={BUTTON_STYLES.primary_lg}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setToken('');
                    setPendingAction(null);
                  }}
                  className={BUTTON_STYLES.secondary}
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <p className="text-slate-400 text-xs mt-4 text-center">
              Supabase → Settings → API → anon key
            </p>
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-6">Add New Movie</h2>
            
            <div className="mb-4">
              <AddMovie 
                onAdd={(title) => {
                  handleAddMovie(title);
                  setShowAddMovieModal(false);
                }}
              />
            </div>
            
            <button
              onClick={() => setShowAddMovieModal(false)}
              className={BUTTON_STYLES.secondary}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Export 
          movies={allMovies}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default App;