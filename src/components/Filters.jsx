/**
 * Componente Filters
 * Barra de búsqueda y filtro por estado
 * 
 * Props:
 * - searchTerm: término de búsqueda actual
 * - onSearchChange: callback cuando cambia la búsqueda
 * - filterStatus: estado seleccionado ('all' o id del estado)
 * - onFilterChange: callback cuando cambia el filtro
 * - statuses: array de estados disponibles
 */

import React from 'react';
import { Search, Filter } from 'lucide-react';

const Filters = ({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterChange, 
  statuses 
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda por título */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar películas..."
            className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Filtro por estado */}
        <div className="relative">
          <Filter className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-slate-700 text-white pl-10 pr-8 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            {statuses.map((status) => (
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

export default Filters;