/**
 * Componente StatusSelector
 * Dropdown para seleccionar estado (status) reutilizable
 */

import React from 'react';

export const StatusSelector = ({ statusId, statuses, onChange, disabled = false }) => {
  return (
    <select
      value={statusId}
      onChange={(e) => onChange(parseInt(e.target.value))}
      disabled={disabled}
      className="w-full bg-slate-700 text-white text-xs px-2 py-1.5 rounded cursor-pointer hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {statuses.map((status) => (
        <option key={status.id} value={status.id}>
          {status.description}
        </option>
      ))}
    </select>
  );
};
