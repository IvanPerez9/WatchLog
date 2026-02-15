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
    <div className="bg-slate-800 rounded-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* First row: Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 sm:top-3.5 w-4 sm:w-5 h-4 sm:h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${viewMode}...`}
            className="w-full bg-slate-700 text-white pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 sm:top-3.5 text-slate-400 hover:text-white transition flex-shrink-0"
              title="Clear search"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          )}
        </div>

        {/* Second row: Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center flex-wrap">
          {/* Rating Filter */}
          {onMinRatingChange && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Star className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-400 flex-shrink-0" />
              <label className="text-slate-300 text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0">
                Min:
              </label>
              <select
                value={minRating}
                onChange={(e) => onMinRatingChange(Number(e.target.value))}
                className="bg-slate-700 text-white px-2 sm:px-3 py-2 sm:py-3 rounded text-xs sm:text-sm hover:bg-slate-600 transition flex-1 sm:flex-none"
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
              <Film className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-400 flex-shrink-0" />
              <label className="text-slate-300 text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0">
                Genre:
              </label>
              <select
                value={selectedGenre || ''}
                onChange={(e) => onGenreChange(e.target.value || null)}
                className="bg-slate-700 text-white px-2 sm:px-3 py-2 sm:py-3 rounded text-xs sm:text-sm hover:bg-slate-600 transition flex-1 sm:flex-none"
              >
                <option value="">All</option>
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
