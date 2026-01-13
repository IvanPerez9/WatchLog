/**
 * Componente MovieCard
 * Representa una tarjeta individual de película
 * 
 * - movie: object with {id, title, year, status_id, poster_path}
 * - statuses: array of available statuses
 * - onStatusChange: callback when status changes
 * - onDelete: callback cuando se elimina
 * - onRatingChange: callback cuando cambia la calificación
 * - user: objeto del usuario actual
 */

import React from 'react';
import { Film, Trash2, Star } from 'lucide-react';
import { tmdbApi } from '../api/tmdb.js';
import { getRatingText } from '../utils/ratingUtils.js';
import { StarRating } from './StarRating.jsx';

const MovieCard = ({ movie, statuses, onStatusChange, onDelete, onRatingChange, user }) => {
  const posterUrl = tmdbApi.getPosterUrl(movie.poster_path);
  const [hoverRating, setHoverRating] = React.useState(0);
  const rating = movie.rating || 0;

  // Handle click on star (detect left or right half)
  const handleStarClick = (starNumber, event) => {
    // Don't allow rating if status is "Pending" (id = 1)
    if (movie.status_id === 1) {
      alert('You can\'t rate a pending movie. Update its status first.');
      return;
    }

    if (!user) {
      alert('Sign in to rate movies');
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;

    const newRating = isLeftHalf ? starNumber - 0.5 : starNumber;
    onRatingChange(movie.id, newRating);
  };

  // Handle hover for preview
  const handleStarHover = (starNumber, event) => {
    // Don't allow hover if status is "Pending" (id = 1)
    if (movie.status_id === 1) {
      setHoverRating(0);
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const isLeftHalf = hoverX < rect.width / 2;

    const hoverValue = isLeftHalf ? starNumber - 0.5 : starNumber;
    setHoverRating(hoverValue);
  };

  // Renderizar estrellas (completas, media, vacías)
  // Renderizar estrellas (completas, media, vacías)
  const renderStars = (fillAmount) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = fillAmount >= i;
      const isHalf = fillAmount > i - 1 && fillAmount < i;

      if (isFilled) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else if (isHalf) {
        // Media estrella
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-slate-600" />
            <div className="absolute top-0 left-0 w-2 h-4 overflow-hidden">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-slate-600" />
        );
      }
    }
    return stars;
  };

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
            title="Delete movie"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
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

        {/* Rating with stars */}
        <div className="mb-2 pb-2 border-b border-slate-700">
          <StarRating
            rating={rating}
            hoverRating={hoverRating}
            statusId={movie.status_id}
            onStarClick={handleStarClick}
            onStarHover={handleStarHover}
            onMouseLeave={() => setHoverRating(0)}
            showText={true}
          />
          {movie.status_id === 1 && (
            <p className="text-slate-400 text-xs italic mt-1">
              Rate when you watch it
            </p>
          )}
        </div>

        {/* Status selector */}
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