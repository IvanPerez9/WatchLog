/**
 * Componente BookCard
 * Representa una tarjeta individual de libro
 * 
 * Props:
 * - book: object with {id, title, author, year, status_id, cover_path, rating, total_pages}
 * - statuses: array of available statuses
 * - onStatusChange: callback cuando cambia el estado
 * - onDelete: callback cuando se elimina
 * - onRatingChange: callback cuando cambia la calificación
 * - user: objeto del usuario actual
 */

import React from 'react';
import { Trash2, BookOpen } from 'lucide-react';
import { getRatingText } from '../../utils/ratingUtils.js';
import { getRelativeTime } from '../../utils/dateUtils.js';
import { StarRating } from '../common/StarRating.jsx';
import '../../styles/buttonStyles.js';

const BookCard = ({ book, statuses, onStatusChange, onDelete, onRatingChange, user }) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const rating = book.rating || 0;
  const currentStatus = statuses.find(s => s.id === book.status_id);

  const handleStarClick = (starNumber, event) => {
    // No permitir rating según estado del libro
    if (book.status_id === 1) { // Pending
      alert('Cambia el estado del libro primero antes de calificarlo');
      return;
    }

    if (!user) {
      alert('Inicia sesión para calificar libros');
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;
    
    const newRating = isLeftHalf ? starNumber - 0.5 : starNumber;
    onRatingChange(book.id, newRating);
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-blue-900/50 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative w-full bg-gray-700 pt-[150%] overflow-hidden">
        {book.cover_path ? (
          <img
            src={book.cover_path}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Cover';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <BookOpen className="w-16 h-16 text-gray-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Title and Author */}
        <div>
          <h3 className="font-bold text-gray-100 line-clamp-2 text-sm hover:text-blue-400 transition">
            {book.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-1 mt-1">
            {book.author}
          </p>
          {book.year && (
            <p className="text-xs text-gray-500 mt-1">
              {book.year}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex gap-2 text-xs text-gray-400">
          {book.total_pages && (
            <span className="flex items-center gap-1">
              📖 {book.total_pages} págs
            </span>
          )}
          {book.isbn && (
            <span className="text-gray-500">
              ISBN: {book.isbn}
            </span>
          )}
        </div>

        {/* Genres */}
        {book.genres && (
          <div className="flex gap-1 flex-wrap">
            {book.genres.split(',').slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Status */}
        <div className="mt-auto">
          <select
            value={book.status_id}
            onChange={(e) => onStatusChange(book.id, parseInt(e.target.value))}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 text-xs rounded hover:border-blue-500 focus:outline-none focus:border-blue-400"
            disabled={!user}
          >
            {statuses
              .filter(s => ['Pending', 'Reading', 'Read', 'Favorite'].includes(s.description))
              .map((status) => (
                <option key={status.id} value={status.id}>
                  {status.description}
                </option>
              ))}
          </select>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div
            className="flex gap-0.5"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className="relative cursor-pointer hover:scale-110 transition-transform"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const isLeftHalf = clickX < rect.width / 2;
                  setHoverRating(isLeftHalf ? star - 0.5 : star);
                }}
                onClick={(e) => handleStarClick(star, e)}
                title={getRatingText(hoverRating || rating)}
              >
                {/* Background star (empty) */}
                <div className="text-gray-600 text-lg">★</div>

                {/* Foreground star (filled), clipped by width */}
                <div
                  className="absolute top-0 left-0 text-yellow-400 text-lg overflow-hidden"
                  style={{
                    width: `${
                      Math.min(
                        Math.max(
                          (hoverRating || rating) - star + 1,
                          0
                        ),
                        1
                      ) * 100
                    }%`,
                  }}
                >
                  ★
                </div>
              </div>
            ))}
          </div>

          {/* Delete button */}
          {user && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar "${book.title}"?`)) {
                  onDelete(book.id);
                }
              }}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors"
              title="Eliminar libro"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Updated at */}
        {book.updated_at && (
          <div className="text-xs text-gray-500 text-center mt-2">
            {getRelativeTime(book.updated_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
