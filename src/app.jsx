/**
 * Componente principal App
 * Orquesta toda la aplicación
 * Similar a un @Controller o clase Main en Spring
 */

import React, { useState, useEffect } from 'react';
import { Film, Tv, X } from 'lucide-react';
import { moviesApi, seriesApi, statusesApi } from './api/supabase.js';
import { tmdbApi } from './api/tmdb.js';
import config from './config.js';
import MovieCard from './components/MovieCard.jsx';
import SeriesCard from './components/SeriesCard.jsx';
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
  const [filterStatus, setFilterStatus] = useState(() => {
    return localStorage.getItem('watchlog_filterStatus') || 'all';
  });
  const [minRating, setMinRating] = useState(() => {
    return parseInt(localStorage.getItem('watchlog_minRating') || '0');
  });
  
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
  const [selectedGenre, setSelectedGenre] = useState(() => {
    const saved = localStorage.getItem('watchlog_selectedGenre');
    return saved || null;
  });

  // Series state (Phase 3)
  const [viewMode, setViewMode] = useState(() => {
    // Cargar viewMode del localStorage al inicializar
    const savedViewMode = localStorage.getItem('watchlog_viewMode');
    return savedViewMode || 'movies';
  });
  const [series, setSeries] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [totalSeries, setTotalSeries] = useState(0);

  /**
   * useEffect se ejecuta cuando el componente se monta o cuando cambian las dependencias
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  // Guardar viewMode en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem('watchlog_viewMode', viewMode);
    setCurrentPage(0);
  }, [viewMode]);

  // Guardar filtros en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('watchlog_filterStatus', filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    localStorage.setItem('watchlog_minRating', minRating.toString());
  }, [minRating]);

  useEffect(() => {
    localStorage.setItem('watchlog_selectedGenre', selectedGenre || '');
  }, [selectedGenre]);

  // Recargar películas/series cuando cambia la página, el filtro o el modo de vista
  useEffect(() => {
    if (statuses.length > 0) {
      if (viewMode === 'movies') {
        loadMovies();
        loadAllMovies();
      } else {
        loadSeries();
        loadAllSeries();
      }
    }
  }, [currentPage, filterStatus, viewMode]);

  /**
   * Cargar series desde Supabase con paginación
   */
  const loadSeries = async () => {
    try {
      setLoading(true);
      
      const statusId = filterStatus === 'all' ? null : parseInt(filterStatus);
      const data = await seriesApi.getAll(currentPage, pageSize, statusId);
      
      setSeries(data || []);
      
      // Obtener el total real de series
      await loadSeriesTotalCount(statusId);
    } catch (error) {
      console.error('Error loading series:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar TODAS las series sin paginación (para búsqueda y stats)
   */
  const loadAllSeries = async () => {
    try {
      // Cargar TODAS sin paginación y sin filtro de status
      const data = await seriesApi.getAll(0, 10000, null);
      setAllSeries(data || []);
    } catch (error) {
      console.error('Error loading all series:', error);
    }
  };

  /**
   * Obtener total de series (para calcular páginas)
   */
  const loadSeriesTotalCount = async (statusId = null) => {
    try {
      const data = await seriesApi.count(statusId);
      const count = data[0].count;
      setTotalSeries(count);
    } catch (error) {
      console.error('Error loading total series count:', error);
    }
  };

  /**
   * Cargar datos iniciales (estados, géneros y películas/series)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      await loadStatuses();
      await loadGenres();
      
      if (viewMode === 'movies') {
        await loadMovies();
        loadAllMovies();
      } else {
        await loadSeries();
        loadAllSeries();
      }
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
      // Cargar TODAS sin paginación y sin filtro de status
      const data = await moviesApi.getAll(0, 10000, null);
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
   * Actualizar rating de serie - versión INTERNA (sin verificación de auth)
   */
  const _updateSeriesRating = async (seriesId, newRating) => {
    // Guardar estado anterior
    const oldAllSeries = allSeries;
    const oldSeries = series;
    
    try {
      // Actualizar inmediatamente
      setAllSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, rating: newRating } : s
        )
      );
      
      setSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, rating: newRating } : s
        )
      );
      
      // Hacer la petición en background
      seriesApi.update(seriesId, { rating: newRating }, user.token)
        .catch((error) => {
          console.error('Error updating series rating:', error);
          // Revertir cambios si falla
          setAllSeries(oldAllSeries);
          setSeries(oldSeries);
        });
    } catch (error) {
      console.error('Error updating series rating:', error);
    }
  };

  /**
   * Actualizar rating de serie - versión PÚBLICA (con verificación de auth)
   */
  const handleSeriesRatingChange = async (seriesId, newRating) => {
    if (!requireAuth(() => _updateSeriesRating(seriesId, newRating))) return;
    await _updateSeriesRating(seriesId, newRating);
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
   * Añadir una nueva serie - versión INTERNA (sin verificación de auth)
   */
  const _addSeries = async (title) => {
    try {
      const pendingStatus = statuses.find((s) => s.description === 'Pendiente');
      
      // Crear serie temporal con ID negativo
      const tempId = -Date.now();
      const tempSeries = {
        id: tempId,
        title: title,
        year: null,
        poster_path: null,
        genres: null,
        total_seasons: null,
        current_season: 1,
        status_id: pendingStatus?.id || 1,
        created_at: new Date().toISOString(),
      };
      
      // Añadir al instante a la UI
      setAllSeries((prev) => [tempSeries, ...prev]);
      
      // Buscar en TMDB en background
      let tmdbData = {};
      try {
        tmdbData = await tmdbApi.searchSeries(title);
      } catch (tmdbError) {
        console.warn('TMDB search failed for series:', tmdbError);
      }
      
      // Actualizar la serie temporal con datos de TMDB
      setAllSeries((prev) =>
        prev.map((s) =>
          s.id === tempId
            ? {
                ...s,
                year: tmdbData?.year || null,
                poster_path: tmdbData?.poster_path || null,
                genres: tmdbData?.genres ? JSON.stringify(tmdbData.genres) : null,
                total_seasons: tmdbData?.total_seasons || null,
              }
            : s
        )
      );
      
      // Crear en la BD con todos los datos
      const createdSeries = await seriesApi.create({
        title: title,
        year: tmdbData?.year || null,
        poster_path: tmdbData?.poster_path || null,
        genres: tmdbData?.genres ? JSON.stringify(tmdbData.genres) : null,
        total_seasons: tmdbData?.total_seasons || null,
        current_season: 1,
        status_id: pendingStatus?.id || 1,
      }, user.token);
      
      // Reemplazar serie temporal con la real
      setAllSeries((prev) =>
        prev.map((s) => (s.id === tempId ? createdSeries : s))
      );
      
      // Resetear página y búsqueda
      setCurrentPage(0);
      setSearchTerm('');
      
      // Refresco de sincronización
      setTimeout(() => {
        loadAllSeries();
      }, 500);
    } catch (error) {
      console.error('Error adding series:', error);
      alert('Error adding series');
    }
  };

  /**
   * Añadir serie - versión PÚBLICA (con verificación de auth)
   */
  const handleAddSeries = async (title) => {
    if (!requireAuth(() => _addSeries(title))) return;
    await _addSeries(title);
  };

  /**
   * Actualizar serie - versión INTERNA
   */
  const _updateSeries = async (seriesId, updates) => {
    const oldAllSeries = allSeries;
    const oldSeries = series;
    
    try {
      // Actualizar inmediatamente
      setAllSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, ...updates } : s
        )
      );
      
      setSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, ...updates } : s
        )
      );
      
      // Hacer la petición en background
      seriesApi.update(seriesId, updates, user.token)
        .catch((error) => {
          console.error('Error updating series:', error);
          setAllSeries(oldAllSeries);
          setSeries(oldSeries);
        });
    } catch (error) {
      console.error('Error updating series:', error);
    }
  };

  /**
   * Eliminar serie - versión INTERNA
   */
  const _deleteSeries = async (seriesId) => {
    if (!confirm('Delete this series?')) return;

    const oldAllSeries = allSeries;
    const oldSeries = series;

    try {
      setAllSeries((prev) => prev.filter((s) => s.id !== seriesId));
      setSeries((prev) => prev.filter((s) => s.id !== seriesId));
      
      seriesApi.delete(seriesId, user.token)
        .catch((error) => {
          console.error('Error deleting series:', error);
          setAllSeries(oldAllSeries);
          setSeries(oldSeries);
          alert('Error deleting series. Change reverted.');
        });
    } catch (error) {
      console.error('Error deleting series:', error);
      alert('Error deleting series');
    }
  };

  /**
   * Cambiar estado de serie - versión INTERNA
   */
  const _changeSeriesStatus = async (seriesId, newStatusId) => {
    const oldAllSeries = allSeries;
    const oldSeries = series;
    
    try {
      setAllSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, status_id: newStatusId } : s
        )
      );
      
      setSeries((prev) =>
        prev.map((s) =>
          s.id === seriesId ? { ...s, status_id: newStatusId } : s
        )
      );
      
      seriesApi.update(seriesId, { status_id: newStatusId }, user.token)
        .catch((error) => {
          console.error('Error updating series status:', error);
          setAllSeries(oldAllSeries);
          setSeries(oldSeries);
        });
    } catch (error) {
      console.error('Error updating series status:', error);
    }
  };

  const handleSeriesStatusChange = async (seriesId, newStatusId) => {
    if (!requireAuth(() => _changeSeriesStatus(seriesId, newStatusId))) return;
    await _changeSeriesStatus(seriesId, newStatusId);
  };

  const handleSeriesDelete = async (seriesId) => {
    if (!requireAuth(() => _deleteSeries(seriesId))) return;
    await _deleteSeries(seriesId);
  };

  const handleSeriesUpdate = async (seriesId, updates) => {
    if (!requireAuth(() => _updateSeries(seriesId, updates))) return;
    await _updateSeries(seriesId, updates);
  };

  /**
   * Filtrar series según búsqueda, rating y género
   */
  const searchedSeries = allSeries.filter((serie) => {
    const title = serie.title || '';
    const year = serie.year;
    const searchLower = searchTerm.toLowerCase().trim();
    
    const matchesTitle = title
      .toLowerCase()
      .includes(searchLower);
    
    const matchesYear = searchLower && /^\d+$/.test(searchLower) && 
      year && 
      year.toString() === searchLower;
    
    const matchesRating = !minRating || (serie.rating && serie.rating >= minRating);
    
    let matchesGenre = true;
    if (selectedGenre) {
      try {
        const serieGenres = serie.genres ? JSON.parse(serie.genres) : [];
        matchesGenre = serieGenres.includes(selectedGenre);
      } catch (e) {
        matchesGenre = false;
      }
    }

    // Filtrar por status
    const matchesStatus = filterStatus === 'all' ? true : serie.status_id === parseInt(filterStatus);
    
    return (matchesTitle || matchesYear) && matchesRating && matchesGenre && matchesStatus;
  });

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

    // Filtrar por status
    const matchesStatus = filterStatus === 'all' ? true : movie.status_id === parseInt(filterStatus);
    
    return (matchesTitle || matchesYear || matchesDirector) && matchesRating && matchesGenre && matchesStatus;
  });

  // Calcular paginación ANTES de usarla
  const from = currentPage * pageSize;
  const to = from + pageSize;

  // Aplicar paginación al resultado de búsqueda de movies
  const filteredMovies = searchedMovies.slice(from, to);
  const searchTotalPages = Math.ceil(searchedMovies.length / pageSize);

  // Aplicar paginación al resultado de búsqueda de series
  const filteredSeries = searchedSeries.slice(from, to);
  const searchSeriesTotalPages = Math.ceil(searchedSeries.length / pageSize);

  // Determinar qué mostrar según el modo de vista
  const displayList = viewMode === 'movies' ? filteredMovies : filteredSeries;
  const displayTotal = viewMode === 'movies' ? searchTotalPages : searchSeriesTotalPages;
  const displayMovies = viewMode === 'movies';

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = viewMode === 'movies' ? searchTotalPages : searchSeriesTotalPages;
    if (currentPage < maxPage - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterStatus(newFilter);
    setCurrentPage(0);
  };

  /**
   * Limpiar todos los filtros (al hacer click en el título)
   */
  const clearAllFilters = () => {
    setFilterStatus('all');
    setMinRating(0);
    setSelectedGenre(null);
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Render de la UI - Siempre mostrar la app (sin pantalla de login al inicio)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Reset everything to initial state
                clearAllFilters();
                setShowAddMovieModal(false);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer group"
              title="Click to reset filters"
            >
              <Film className="w-10 h-10 text-purple-400 group-hover:scale-110 transition" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">WatchLog</h1>
            </button>

            {/* View Mode Toggle */}
            <div className="ml-8 flex gap-2">
              <button
                onClick={() => {
                  setViewMode('movies');
                  setCurrentPage(0);
                }}
                className={`px-3 py-2 rounded text-sm font-semibold flex items-center gap-1 transition ${
                  viewMode === 'movies'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Film size={16} /> Movies
              </button>
              <button
                onClick={() => {
                  setViewMode('series');
                  setCurrentPage(0);
                }}
                className={`px-3 py-2 rounded text-sm font-semibold flex items-center gap-1 transition ${
                  viewMode === 'series'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Tv size={16} /> Series
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (viewMode === 'movies') {
                  if (!user) {
                    setPendingAction(() => () => fillMissingTMDBData(allMovies));
                    setShowLoginModal(true);
                  } else {
                    fillMissingTMDBData(allMovies);
                  }
                }
              }}
              disabled={viewMode === 'series'}
              className={`${BUTTON_STYLES.primary_sm} flex-1 sm:flex-none text-sm ${viewMode === 'series' ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Completa poster, año, director y géneros desde TMDB"
            >
              🔍 Complete TMDB
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className={`${BUTTON_STYLES.primary_sm} flex-1 sm:flex-none text-sm`}
              title={`Exporta tu ${viewMode === 'movies' ? 'librería de películas' : 'librería de series'}`}
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
              ➕ Add {viewMode === 'movies' ? 'Movie' : 'Series'}
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
            viewMode={viewMode}
          />
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <Stats 
            movies={viewMode === 'movies' ? allMovies : allSeries} 
            statuses={viewMode === 'movies' ? statuses.filter(s => s.description !== 'Watching') : statuses}
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

        {/* Lista de películas/series */}
        {loading ? (
          <div className="text-center text-white py-12">Loading {viewMode === 'movies' ? 'movies' : 'series'}...</div>
        ) : displayList.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No {viewMode === 'movies' ? 'movies' : 'series'} to show
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayList.map((item) => (
                <div key={`${viewMode}-${item.id}`}>
                  {viewMode === 'movies' ? (
                    <MovieCard
                      movie={item}
                      statuses={statuses.filter(s => s.description !== 'Watching')}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onRatingChange={handleRatingChange}
                      user={user}
                    />
                  ) : (
                    <SeriesCard
                      series={item}
                      statuses={statuses}
                      onStatusChange={handleSeriesStatusChange}
                      onDelete={handleSeriesDelete}
                      onUpdate={handleSeriesUpdate}
                      onRatingChange={handleSeriesRatingChange}
                      user={user}
                    />
                  )}
                </div>
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
                Page {currentPage + 1} of {displayTotal || 1}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= displayTotal - 1}
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

      {/* Add Movie/Series Modal */}
      {showAddMovieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-semibold">
                Add New {viewMode === 'movies' ? 'Movie' : 'Series'}
              </h2>
              <button
                onClick={() => setShowAddMovieModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div>
              {viewMode === 'movies' ? (
                <AddMovie 
                  onAdd={(title) => {
                    handleAddMovie(title);
                    setShowAddMovieModal(false);
                  }}
                />
              ) : (
                <AddMovie 
                  onAdd={(title) => {
                    handleAddSeries(title);
                    setShowAddMovieModal(false);
                  }}
                  placeholder="Series title..."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Export 
          movies={viewMode === 'movies' ? allMovies : allSeries}
          onClose={() => setShowExportModal(false)}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

export default App;