/**
 * Componente DeleteButton
 * Botón para eliminar película/serie reutilizable
 */

import React from 'react';
import { Trash2 } from 'lucide-react';

export const DeleteButton = ({ onDelete, itemName = 'item' }) => {
  return (
    <button
      onClick={() => {
        if (confirm(`Delete this ${itemName}?`)) {
          onDelete();
        }
      }}
      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition z-10"
      title={`Delete ${itemName}`}
    >
      <Trash2 className="w-4 h-4 text-white" />
    </button>
  );
};
