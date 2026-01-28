/**
 * Componente StarRating
 * Rating interactivo con estrellas reutilizable
 * Se usa en MovieCard y SeriesCard
 */

import React from 'react';
import { Star } from 'lucide-react';
import { getRatingText } from '../../utils/ratingUtils.js';

export const StarRating = ({
  rating = 0,
  hoverRating = 0,
  statusId = 1,
  onStarClick,
  onStarHover,
  onMouseLeave,
  showText = true,
  pendingMessage = null,
}) => {
  const displayRating = hoverRating || rating;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((starNumber) => (
          <button
            key={starNumber}
            onClick={(e) => onStarClick(starNumber, e)}
            onMouseMove={(e) => onStarHover(starNumber, e)}
            onMouseLeave={onMouseLeave}
            className={`transition transform ${
              statusId !== 1 ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            disabled={statusId === 1}
            title={
              statusId === 1 
                ? 'Rate when you change the status'
                : 'Left click for ½ star'
            }
          >
            <div className="relative w-4 h-4">
              <Star className="absolute w-4 h-4 text-slate-600" />
              
              {starNumber <= displayRating ? (
                <Star className="absolute w-4 h-4 fill-yellow-400 text-yellow-400" />
              ) : starNumber - 0.5 === displayRating ? (
                <div className="absolute top-0 left-0 w-2 h-4 overflow-hidden">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              ) : null}
            </div>
          </button>
        ))}
      </div>
      {showText && rating > 0 && (
        <span className="text-xs text-yellow-400 font-medium">
          {getRatingText(rating)}
        </span>
      )}
      {pendingMessage && statusId === 1 && (
        <span className="text-xs text-slate-400 italic">
          {pendingMessage}
        </span>
      )}
    </div>
  );
};
