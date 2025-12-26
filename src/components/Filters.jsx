/**
 * Componente Filters
 * Barra de búsqueda
 * 
 * Props:
 * - searchTerm: término de búsqueda actual
 * - onSearchChange: callback cuando cambia la búsqueda
 */

import React from 'react';
import { Search } from 'lucide-react';

const Filters = ({ 
  searchTerm, 
  onSearchChange
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar películas por título o año..."
          className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>
    </div>
  );
};

export default Filters;