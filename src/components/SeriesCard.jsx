import React, { useState } from 'react';
import { Star, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react';

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

  const renderStars = () => {
    const rating = hoverRating || series.rating || 0;
    
    return [1, 2, 3, 4, 5].map((starNumber) => (
      <button
        key={starNumber}
        onClick={(e) => handleStarClick(starNumber, e)}
        onMouseMove={(e) => handleStarHover(starNumber, e)}
        onMouseLeave={() => setHoverRating(0)}
        className={`transition transform ${
          series.status_id !== 1 ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-50'
        }`}
        disabled={series.status_id === 1}
        title={
          series.status_id === 1 
            ? 'Rate when you change the status'
            : 'Left click for ½ star'
        }
      >
        <div className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-slate-600" />
          
          {starNumber <= rating ? (
            <Star className="absolute w-4 h-4 fill-yellow-400 text-yellow-400" />
          ) : starNumber - 0.5 === rating ? (
            <div className="absolute top-0 left-0 w-2 h-4 overflow-hidden">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          ) : null}
        </div>
      </button>
    ));
  };

  const progressPercentage = series.total_seasons 
    ? (editedData.current_season / series.total_seasons) * 100 
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

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {genres.slice(0, 2).map((genre, idx) => (
              <span 
                key={idx}
                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
              >
                {genre}
              </span>
            ))}
            {genres.length > 2 && (
              <span className="text-xs text-slate-400 self-center">+{genres.length - 2}</span>
            )}
          </div>
        )}

        {/* Rating Stars - Interactive */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {renderStars()}
          </div>
          <span className="text-xs text-slate-400">{series.rating ? series.rating.toFixed(1) : '-'}</span>
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
