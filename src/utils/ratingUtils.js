/**
 * Utilidades para ratings
 * Funciones compartidas entre MovieCard y SeriesCard
 */

/**
 * Obtiene el texto descriptivo para un rating numérico
 * @param {number} ratingValue - Valor del rating (0.5 a 5)
 * @returns {string} Texto descriptivo del rating
 */
export const getRatingText = (ratingValue) => {
  const texts = {
    0.5: '½ - Terrible',
    1: '1 - Very Bad',
    1.5: '1.5 - Bad',
    2: '2 - Poor',
    2.5: '2.5 - Fair',
    3: '3 - Good',
    3.5: '3.5 - Very Good',
    4: '4 - Excellent',
    4.5: '4.5 - Almost Perfect',
    5: '5 - Perfect ✨',
  };
  return texts[ratingValue] || '';
};
