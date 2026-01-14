/**
 * Componente PosterImage
 * Muestra la imagen del poster con placeholder
 */

import React from 'react';

export const PosterImage = ({ posterPath, title, emoji = '🎬' }) => {
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : `https://placehold.co/300x450/e5e7eb/6b7280?text=No+Poster`;

  return (
    <div className="aspect-[2/3] bg-slate-700 relative">
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />

      {/* Placeholder if no poster */}
      <div
        className="w-full h-full flex items-center justify-center text-slate-600"
        style={{ display: posterUrl && !posterUrl.includes('placehold') ? 'none' : 'flex' }}
      >
        <span className="text-4xl">{emoji}</span>
      </div>
    </div>
  );
};
