/**
 * Componente Stats
 * Muestra estadísticas de películas por estado
 * 
 * - movies: array de todas las películas
 * - statuses: array de estados disponibles
 */

import React from 'react';

const Stats = ({ movies, statuses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statuses.map((status) => {
        const count = movies.filter((m) => m.status_id === status.id).length;
        
        return (
          <div key={status.id} className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">{status.description}</div>
            <div className="text-3xl font-bold text-white">{count}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stats;