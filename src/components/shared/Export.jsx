/**
 * Componente Export
 * Permite exportar películas en CSV o JSON
 * 
 * Props:
 * - movies: array de películas a exportar
 * - onClose: callback al cerrar modal
 */

import React from 'react';
import { Download, X } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils.js';
import { BUTTON_STYLES } from '../../styles/buttonStyles.js';

const Export = ({ movies, onClose, viewMode = 'movies' }) => {
  const contentType = viewMode === 'movies' ? 'movies' : 'series';
  if (!movies || movies.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Export Library</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-slate-300 mb-6">No {contentType} to export.</p>
          <button
            onClick={onClose}
            className={BUTTON_STYLES.secondary}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    exportToCSV(movies);
    onClose();
  };

  const handleExportJSON = () => {
    exportToJSON(movies);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Export Library</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-slate-300 mb-6">
          Export your {movies.length} {contentType}:
        </p>

        <div className="space-y-3">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className={`${BUTTON_STYLES.primary} w-full flex items-center justify-center gap-2`}
          >
            <Download size={20} />
            CSV
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            className={`${BUTTON_STYLES.primary} w-full flex items-center justify-center gap-2`}
          >
            <Download size={20} />
            JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Export;
