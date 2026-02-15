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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full">
          <div className="flex justify-between items-start sm:items-center mb-3 sm:mb-4 gap-4">
            <h2 className="text-lg sm:text-2xl font-bold text-white">Export Library</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition flex-shrink-0"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
          <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">No {contentType} to export.</p>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm sm:text-base w-full"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8 max-w-md w-full">
        <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-2xl font-bold text-white">Export Library</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition flex-shrink-0"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
          Export your {movies.length} {contentType}:
        </p>

        <div className="space-y-2 sm:space-y-3">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base font-semibold"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            CSV
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition text-sm sm:text-base font-semibold"
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Export;
