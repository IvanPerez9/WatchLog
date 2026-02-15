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
import { ELEMENT_STYLES } from '../../styles/buttonStyles.js';

const Stats = ({ movies, statuses, filterStatus = 'all', onFilterChange }) => {
  const handleClick = (statusId) => {
    const statusIdString = statusId.toString();
    // Si hace click en el estado ya seleccionado, deselecciona (vuelve a todos)
    if (filterStatus === statusIdString) {
      onFilterChange('all');
    } else {
      onFilterChange(statusIdString);
    }
  };

  // Determinar columnas dinámicamente basado en la cantidad de estados
  const gridColsClass = statuses.length === 4 
    ? 'grid-cols-2 lg:grid-cols-4' 
    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';

  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-3 md:gap-4`}>
      {statuses.map((status) => {
        const count = movies.filter((m) => m.status_id === status.id).length;
        const isSelected = filterStatus === status.id.toString();
        
        return (
          <button
            key={status.id}
            onClick={() => handleClick(status.id)}
            className={`${ELEMENT_STYLES.cardBase} rounded-lg p-3 sm:p-4 transition cursor-pointer transform hover:scale-105 ${
              isSelected
                ? ELEMENT_STYLES.selected
                : ELEMENT_STYLES.unselected
            }`}
          >
            <div className={`text-xs sm:text-sm ${
              isSelected ? ELEMENT_STYLES.textSelected : ELEMENT_STYLES.textUnselected
            }`}>
              {status.description}
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{count}</div>
          </button>
        );
      })}
    </div>
  );
};

export default Stats;
