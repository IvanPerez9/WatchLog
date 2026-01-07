/**
 * Utilidades para exportar datos de películas
 * Genera CSV y JSON desde array de películas
 */

/**
 * Convierte un array de películas a CSV
 * @param {Array} movies - Array de objetos película
 * @returns {String} CSV formateado
 */
const generateCSV = (movies) => {
  if (!movies || movies.length === 0) {
    return '';
  }

  // Headers
  const headers = ['ID', 'Title', 'Year', 'Status', 'Rating', 'Poster Path', 'Added Date'];
  
  // Body - convertir cada película a una fila CSV
  const rows = movies.map(movie => {
    const statusNames = {
      1: 'Pending',
      2: 'Watched',
      3: 'Watching',
      4: 'Favorite'
    };
    
    const status = statusNames[movie.status_id] || 'Unknown';
    const rating = movie.rating ? movie.rating : '';
    const addedDate = movie.created_at ? new Date(movie.created_at).toLocaleDateString() : '';
    
    return [
      `"${movie.id}"`,
      `"${movie.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${movie.year || ''}"`,
      `"${status}"`,
      `"${rating}"`,
      `"${movie.poster_path || ''}"`,
      `"${addedDate}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Descarga CSV como archivo
 * @param {Array} movies - Array de películas
 */
export const exportToCSV = (movies) => {
  const csv = generateCSV(movies);
  
  if (!csv) {
    alert('No data to export');
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `watchlog-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Formatea datos para JSON export
 * @param {Array} movies - Array de películas
 * @returns {Object} Objeto con metadata y películas
 */
const generateJSON = (movies) => {
  const statusNames = {
    1: 'Pending',
    2: 'Watched',
    3: 'Watching',
    4: 'Favorite'
  };

  const formattedMovies = movies.map(movie => ({
    id: movie.id,
    title: movie.title,
    year: movie.year || null,
    status: statusNames[movie.status_id] || 'Unknown',
    rating: movie.rating || null,
    posterPath: movie.poster_path || null,
    addedDate: movie.created_at ? new Date(movie.created_at).toISOString() : null,
    updatedDate: movie.updated_at ? new Date(movie.updated_at).toISOString() : null
  }));

  return {
    exportDate: new Date().toISOString(),
    totalMovies: movies.length,
    version: '1.0',
    movies: formattedMovies
  };
};

/**
 * Descarga JSON como archivo
 * @param {Array} movies - Array de películas
 */
export const exportToJSON = (movies) => {
  if (!movies || movies.length === 0) {
    alert('No data to export');
    return;
  }

  const data = generateJSON(movies);
  const jsonString = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `watchlog-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
