/**
 * Componente Filters
 * Barra de búsqueda
 * 
 * Props:
 * - searchTerm: término de búsqueda actual
 * - onSearchChange: callback cuando cambia la búsqueda
 * - minRating: filtro de calificación mínima
 * - onMinRatingChange: callback cuando cambia el filtro de calificación
 */

import React from 'react';
import { Search, Star } from 'lucide-react';

const Filters = ({ 
  searchTerm, 
  onSearchChange,
  minRating = 0,
  onMinRatingChange
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search movies by title or year..."
          className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* Rating Filter */}
      {onMinRatingChange && (
        <div className="flex items-center gap-3">
          <Star className="w-4 h-4 text-slate-400" />
          <label className="text-slate-300 text-sm font-semibold">
            Min rating:
          </label>
          <select
            value={minRating}
            onChange={(e) => onMinRatingChange(Number(e.target.value))}
            className="bg-slate-700 text-white px-3 py-2 rounded text-sm hover:bg-slate-600 transition"
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
    </div>
  );
};

export default Filters;