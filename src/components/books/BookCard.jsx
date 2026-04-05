/**
 * Componente BookCard
 * Representa una tarjeta individual de libro
 * Sigue el mismo patrón visual que MovieCard y SeriesCard
 *
 * Props:
 * - book: { id, title, author, year, cover_path, status_id, rating, genres, pages, updated_at }
 * - bookStatuses: array de estados disponibles para libros
 * - onStatusChange: callback cuando cambia el estado
 * - onDelete: callback cuando se elimina
 * - onRatingChange: callback cuando cambia la calificación
 * - user: objeto del usuario actual
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { getRelativeTime } from '../../utils/dateUtils.js';
import { StarRating } from '../common/StarRating.jsx';

const BookCard = ({ book, bookStatuses, onStatusChange, onDelete, onRatingChange, user }) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const rating = book.rating || 0;

  const coverUrl = book.cover_path || null;

  // Encontrar el status "Pending" para bloquear el rating
  const pendingStatus = bookStatuses?.find(s => s.description === 'Pending');
  const isPending = pendingStatus ? book.status_id === pendingStatus.id : false;

  const handleStarClick = (starNumber, event) => {
    if (isPending) {
      alert('You can\'t rate a book you haven\'t started. Update its status first.');
      return;
    }
    if (!user) {
      alert('Sign in to rate books');
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;
    const newRating = isLeftHalf ? starNumber - 0.5 : starNumber;
    onRatingChange(book.id, newRating);
  };

  const handleStarHover = (starNumber, event) => {
    if (isPending) {
      setHoverRating(0);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const isLeftHalf = hoverX < rect.width / 2;
    const hoverValue = isLeftHalf ? starNumber - 0.5 : starNumber;
    setHoverRating(hoverValue);
  };

  // pages puede estar en book.pages o book.total_pages según la BD
  const pages = book.pages || book.total_pages || null;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden group hover:ring-2 hover:ring-purple-500 transition">
      {/* Portada */}
      <div className="aspect-[2/3] bg-slate-700 relative">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Placeholder si no hay portada */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ display: coverUrl ? 'none' : 'flex' }}
        >
          <span className="text-4xl sm:text-5xl">📚</span>
        </div>

        {/* Botón eliminar (aparece en hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onDelete(book.id)}
            className="p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 rounded-full transition"
            title="Delete book"
          >
            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 sm:p-3">
        <h3
          className="text-white font-semibold text-xs sm:text-sm mb-0.5 truncate"
          title={book.title}
        >
          {book.title}
        </h3>

        {book.author && (
          <p className="text-slate-400 text-xs mb-0.5 truncate" title={book.author}>
            {book.author}
          </p>
        )}

        <div className="text-slate-500 text-xs mb-1 flex gap-2">
          {book.year && <span>{book.year}</span>}
          {pages && <span>· {pages}p.</span>}
        </div>

        {/* Updated time */}
        <p className="text-slate-500 text-xs mb-1 sm:mb-2">
          Updated {getRelativeTime(book.updated_at)}
        </p>

        {/* Rating */}
        <div className="mb-1.5 sm:mb-2 pb-1.5 sm:pb-2 border-b border-slate-700 min-h-[2.5rem] sm:min-h-[3rem]">
          <StarRating
            rating={rating}
            hoverRating={hoverRating}
            isPending={isPending}
            onStarClick={handleStarClick}
            onStarHover={handleStarHover}
            onMouseLeave={() => setHoverRating(0)}
            showText={true}
            pendingMessage="Rate when you start reading"
          />
        </div>

        {/* Status selector */}
        <select
          value={book.status_id}
          onChange={(e) => onStatusChange(book.id, parseInt(e.target.value))}
          className="w-full bg-slate-700 text-white text-xs px-1.5 sm:px-2 py-1 sm:py-1.5 rounded cursor-pointer hover:bg-slate-600 transition"
        >
          {bookStatuses?.map((status) => (
            <option key={status.id} value={status.id}>
              {status.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BookCard;
