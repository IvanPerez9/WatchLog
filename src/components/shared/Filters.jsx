/**
 * Componente Filters
 * Barra de búsqueda y filtros
 * 
 * Props:
 * - searchTerm: término de búsqueda actual
 * - onSearchChange: callback cuando cambia la búsqueda
 * - minRating: filtro de calificación mínima
 * - onMinRatingChange: callback cuando cambia el filtro de calificación
 * - selectedGenre: género seleccionado actual (null o string)
 * - onGenreChange: callback cuando cambia el filtro de género
 * - genres: array de {id, name} disponibles desde TMDB
 */

import React from 'react';
import { Search, Star, Film, X } from 'lucide-react';

const Filters = ({ 
  searchTerm, 
  onSearchChange,
  minRating = 0,
  onMinRatingChange,
  selectedGenre = null,
  onGenreChange,
  genres = [],
  viewMode = 'movies'
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex flex-col gap-4">
        {/* First row: Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${viewMode} by title, year${viewMode === 'movies' ? ' or director' : ''}...`}
            className="w-full bg-slate-700 text-white pl-10 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Second row: Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Rating Filter */}
          {onMinRatingChange && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Star className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <label className="text-slate-300 text-sm font-semibold whitespace-nowrap flex-shrink-0">
                Min rating:
              </label>
              <select
                value={minRating}
                onChange={(e) => onMinRatingChange(Number(e.target.value))}
                className="bg-slate-700 text-white px-3 py-3 rounded text-sm hover:bg-slate-600 transition w-full sm:w-auto"
              >
                <option value={0}>All</option>
                <option value={0.5}>⭐ 0.5+</option>
                <option value={1}>⭐ 1+</option>
                <option value={1.5}>⭐ 1.5+</option>
                <option value={2}>⭐ 2+</option>
                <option value={2.5}>⭐ 2.5+</option>
                <option value={3}>⭐ 3+</option>
                <option value={3.5}>⭐ 3.5+</option>
                <option value={4}>⭐ 4+</option>
                <option value={4.5}>⭐ 4.5+</option>
                <option value={5}>⭐ 5</option>
              </select>
            </div>
          )}

          {/* Genre Filter */}
          {onGenreChange && genres.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Film className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <label className="text-slate-300 text-sm font-semibold whitespace-nowrap flex-shrink-0">
                Genre:
              </label>
              <select
                value={selectedGenre || ''}
                onChange={(e) => onGenreChange(e.target.value || null)}
                className="bg-slate-700 text-white px-3 py-3 rounded text-sm hover:bg-slate-600 transition w-full sm:w-auto"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
