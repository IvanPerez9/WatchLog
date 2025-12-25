/**
 * Componente Stats
 * Muestra estadísticas de películas por estado
 * Las tarjetas son clickables para filtrar por ese estado
 * 
 * - movies: array de todas las películas
 * - statuses: array de estados disponibles
 * - filterStatus: estado actualmente filtrado ('all' o id)
 * - onFilterChange: callback cuando se cambia el filtro
 */

import React from 'react';

const Stats = ({ movies, statuses, filterStatus = 'all', onFilterChange }) => {
  const handleClick = (statusId) => {
    // Si hace click en el estado ya seleccionado, deselecciona (vuelve a todos)
    if (filterStatus === statusId) {
      onFilterChange('all');
    } else {
      onFilterChange(statusId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statuses.map((status) => {
        const count = movies.filter((m) => m.status_id === status.id).length;
        const isSelected = filterStatus === status.id;
        
        return (
          <button
            key={status.id}
            onClick={() => handleClick(status.id)}
            className={`rounded-lg p-4 transition cursor-pointer transform hover:scale-105 ${
              isSelected
                ? 'bg-purple-600 border-2 border-purple-400'
                : 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent'
            }`}
          >
            <div className={`text-sm ${
              isSelected ? 'text-purple-100 font-semibold' : 'text-slate-400'
            }`}>
              {status.description}
            </div>
            <div className="text-3xl font-bold text-white">{count}</div>
          </button>
        );
      })}
    </div>
  );
};

export default Stats;