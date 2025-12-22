/**
 * Componente MovieCard
 * Representa una tarjeta individual de película
 * 
 * - movie: objeto con {id, title, year, status_id, poster_path}
 * - statuses: array de estados disponibles
 * - onStatusChange: callback cuando cambia el estado
 * - onDelete: callback cuando se elimina
 */

import React from 'react';
import { Film, Trash2 } from 'lucide-react';
import { tmdbApi } from '../api/tmdb.js';

const MovieCard = ({ movie, statuses, onStatusChange, onDelete }) => {
  const posterUrl = tmdbApi.getPosterUrl(movie.poster_path);

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden group hover:ring-2 hover:ring-purple-500 transition">
      {/* Póster */}
      <div className="aspect-[2/3] bg-slate-700 relative">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si la imagen falla, mostrar placeholder
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Placeholder si no hay póster */}
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ display: posterUrl ? 'none' : 'flex' }}
        >
          <Film className="w-16 h-16 text-slate-600" />
        </div>

        {/* Botón de eliminar (aparece al hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onDelete(movie.id)}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition"
            title="Eliminar película"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Info de la película */}
      <div className="p-3">
        <h3 
          className="text-white font-semibold text-sm mb-1 truncate" 
          title={movie.title}
        >
          {movie.title}
        </h3>

        {movie.year && (
          <div className="text-slate-400 text-xs mb-2">{movie.year}</div>
        )}

        {/* Selector de estado */}
        <select
          value={movie.status_id}
          onChange={(e) => onStatusChange(movie.id, parseInt(e.target.value))}
          className="w-full bg-slate-700 text-white text-xs px-2 py-1.5 rounded cursor-pointer hover:bg-slate-600 transition"
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MovieCard;