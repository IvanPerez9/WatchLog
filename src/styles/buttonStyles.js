/**
 * Estilos de botones centralizados
 * Paleta unificada:
 * - Azul: acciones principales
 * - Rojo: acciones eliminar y logout
 * - Gris: acciones secundarias
 */

export const BUTTON_STYLES = {
  primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm sm:text-base',
  primary_sm: 'px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-xs sm:text-sm',
  primary_lg: 'flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm sm:text-base',

  secondary: 'px-3 py-2 sm:px-4 sm:py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm',
  secondary_lg: 'px-4 py-2 sm:px-6 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base',

  danger: 'px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-xs sm:text-sm',
  danger_icon: 'p-2 bg-red-600 hover:bg-red-700 rounded-full transition',

  selected: 'bg-blue-600 border-2 border-blue-400',
  unselected: 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent',
};

/**
 * Estados de elementos
 */
export const ELEMENT_STYLES = {
  cardBase: 'rounded-lg p-4 transition cursor-pointer transform hover:scale-105',
  selected: 'bg-blue-600 border-2 border-blue-400',
  unselected: 'bg-slate-800 hover:bg-slate-700 border-2 border-transparent',
  textSelected: 'text-blue-100 font-semibold',
  textUnselected: 'text-slate-400',
};
