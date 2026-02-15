/**
 * Componente AddItemForm
 * Formulario reutilizable para añadir nuevos items (películas, series, libros, etc)
 * 
 * Props:
 * - onAdd: callback cuando se añade un item
 * - placeholder: texto del placeholder (por defecto "Movie title...")
 * - isInModal: boolean para remover estilos cuando está dentro de un modal
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddItemForm = ({ onAdd, placeholder = 'Movie title...', isInModal = true }) => {
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
    <div className={isInModal ? '' : 'bg-slate-800 rounded-lg p-3 sm:p-4 md:p-6 w-full'}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="flex-1 bg-slate-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50 text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap"
        >
          <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
          <span className="hidden sm:inline">{loading ? 'Adding...' : 'Add'}</span>
          <span className="sm:hidden">{loading ? 'Adding' : '+'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddItemForm;
