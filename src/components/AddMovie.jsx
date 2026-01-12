/**
 * Componente AddMovie
 * Formulario para añadir nuevas películas o series
 * 
 * Props:
 * - onAdd: callback cuando se añade una película/serie
 * - placeholder: texto del placeholder (por defecto "Movie title...")
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddMovie = ({ onAdd, placeholder = 'Movie title...' }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setLoading(true);
    await onAdd(title);
    setTitle('');
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 sm:p-6 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
};

export default AddMovie;