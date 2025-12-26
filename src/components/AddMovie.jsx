/**
 * Componente AddMovie
 * Formulario para añadir nuevas películas
 * 
 * Props:
 * - onAdd: callback cuando se añade una película
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddMovie = ({ onAdd }) => {
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
    <div className="bg-slate-800 rounded-lg p-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la película..."
          disabled={loading}
          className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Añadiendo...' : 'Añadir'}
        </button>
      </form>
    </div>
  );
};

export default AddMovie;