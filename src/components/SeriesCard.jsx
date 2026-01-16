import React, { useState } from 'react';
import { Star, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react';
import { getRatingText } from '../utils/ratingUtils.js';
import { StarRating } from './common/StarRating.jsx';

/**
 * SeriesCard Component - Display card for TV series
 * Similar to MovieCard but with series-specific information
 * (total_seasons, current_season)
 */
export const SeriesCard = ({ series, statuses, onDelete, onUpdate, onStatusChange, onRatingChange, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [editedData, setEditedData] = useState({
    current_season: series.current_season || 1,
  });

  const currentStatus = statuses?.find(s => s.id === series.status_id);
  const posterUrl = series.poster_path 
    ? `https://image.tmdb.org/t/p/w300${series.poster_path}`
    : 'https://placehold.co/300x450/e5e7eb/6b7280?text=No+Poster';

  const genres = Array.isArray(series.genres) 
    ? series.genres 
    : (typeof series.genres === 'string' ? JSON.parse(series.genres) : []);

  const handleSave = async () => {
    await onUpdate(series.id, editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      current_season: series.current_season || 1,
    });
    setIsEditing(false);
  };

  const handleStarClick = (starNumber, event) => {
    if (series.status_id === 1) {
      alert('You can\'t rate a pending series. Update its status first.');
      return;
    }

    if (!user) {
      alert('Sign in to rate series');
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;

    const newRating = isLeftHalf ? starNumber - 0.5 : starNumber;
    onRatingChange(series.id, newRating);
  };

  const handleStarHover = (starNumber, event) => {
    if (series.status_id === 1) {
      setHoverRating(0);
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const hoverX = event.clientX - rect.left;
    const isLeftHalf = hoverX < rect.width / 2;

    const hoverValue = isLeftHalf ? starNumber - 0.5 : starNumber;
    setHoverRating(hoverValue);
  };

  const progressPercentage = series.total_seasons 
    ? series.status_id === 1 && editedData.current_season === 1
      ? 0
      : (editedData.current_season / series.total_seasons) * 100 
    : 0;

  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg overflow-visible group hover:ring-2 hover:ring-purple-500 transition relative">
      {/* Poster */}
      <div className="aspect-[2/3] bg-slate-700 relative">
        <img 
          src={posterUrl}
          alt={series.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Placeholder if no poster */}
        <div 
          className="w-full h-full flex items-center justify-center text-slate-600"
          style={{ display: posterUrl ? 'none' : 'flex' }}
        >
          <span className="text-4xl">📺</span>
        </div>

        {/* Delete button (appears on hover) */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onDelete(series.id)}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition"
            title="Delete series"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title & Year */}
        <h3 className="text-white font-semibold text-sm mb-1 truncate" title={series.title}>{series.title}</h3>
        <p className="text-xs text-slate-400 mb-2">{series.year || 'N/A'}</p>

        {/* Rating Stars - Interactive */}
        <div className="mb-2">
          <StarRating
            rating={series.rating || 0}
            hoverRating={hoverRating}
            statusId={series.status_id}
            onStarClick={handleStarClick}
            onStarHover={handleStarHover}
            onMouseLeave={() => setHoverRating(0)}
            showText={series.rating > 0}
          />
          {!series.rating && (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>

        {/* Progress Bar - Seasons Watched */}
        <div className="mb-3 bg-slate-700 rounded p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-300">
              Season {editedData.current_season} of {series.total_seasons}
            </span>
            <span className="text-xs text-slate-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-1.5">
            <div 
              className="bg-purple-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Season Controls */}
        <div className="mb-3 bg-slate-700 rounded p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Season</span>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (editedData.current_season > 1) {
                    const newSeason = editedData.current_season - 1;
                    setEditedData({...editedData, current_season: newSeason});
                    await onUpdate(series.id, { current_season: newSeason });
                  }
                }}
                disabled={editedData.current_season <= 1}
                className="px-2 py-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-bold transition"
              >
                −
              </button>
              <span className="text-sm font-bold text-white min-w-8 text-center">
                {editedData.current_season}/{series.total_seasons}
              </span>
              <button
                onClick={async () => {
                  if (editedData.current_season < series.total_seasons) {
                    const newSeason = editedData.current_season + 1;
                    setEditedData({...editedData, current_season: newSeason});
                    await onUpdate(series.id, { current_season: newSeason });
                  }
                }}
                disabled={editedData.current_season >= series.total_seasons}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-bold transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Status Dropdown & Actions */}
        <div>
          {/* Status selector */}
          <select
            value={series.status_id}
            onChange={(e) => onStatusChange(series.id, parseInt(e.target.value))}
            className="w-full bg-slate-700 text-white text-xs px-2 py-1.5 rounded cursor-pointer hover:bg-slate-600 transition"
          >
            {statuses?.map((status) => (
              <option key={status.id} value={status.id}>
                {status.description}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;
