/**
 * Cliente HTTP para Google Books API
 * No requiere API key para búsquedas básicas (hasta ~1000 req/día)
 * Documentación: https://developers.google.com/books/docs/v1/using
 */

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';

const normalizeVolume = (item) => {
  const info = item.volumeInfo || {};

  const identifiers = info.industryIdentifiers || [];
  const isbn13 = identifiers.find(i => i.type === 'ISBN_13')?.identifier || null;
  const isbn10 = identifiers.find(i => i.type === 'ISBN_10')?.identifier || null;
  const isbn = isbn13 || isbn10 || null;

  // Si Google confirma que hay portada (imageLinks presente), construir URL limpia
  // directamente con el ID del volumen (sin edge=curl ni source=gbs_api).
  // zoom=1 → ~128×192px | zoom=0 → máxima resolución disponible
  const cover_path = info.imageLinks
    ? `https://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=1`
    : null;

  const year = info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) || null : null;

  const genres = info.categories ? JSON.stringify(info.categories.slice(0, 5)) : null;

  return {
    key: item.id || `${info.title}-${info.authors?.[0] || 'unknown'}`,
    title: info.title || '',
    author: info.authors?.[0] || null,
    year,
    isbn,
    cover_path,
    total_pages: info.pageCount || null,
    genres,
  };
};

export const googleBooksApi = {
  /**
   * Buscar libros por título.
   */
  searchByTitle: async (title, maxResults = 10) => {
    try {
      const query = encodeURIComponent(`intitle:${title.trim()}`);
      const response = await fetch(
        `${GOOGLE_BOOKS_API}/volumes?q=${query}&maxResults=${maxResults}&printType=books`
      );
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.items) return [];
      const results = data.items.map(normalizeVolume).filter(b => b.title);
      // Priorizar resultados con portada disponible
      return results.sort((a, b) => (b.cover_path ? 1 : 0) - (a.cover_path ? 1 : 0));
    } catch (error) {
      console.error('Google Books search by title failed:', error);
      throw error;
    }
  },

  /**
   * Buscar libros por autor.
   */
  searchByAuthor: async (author, maxResults = 10) => {
    try {
      const query = encodeURIComponent(`inauthor:${author.trim()}`);
      const response = await fetch(
        `${GOOGLE_BOOKS_API}/volumes?q=${query}&maxResults=${maxResults}&printType=books`
      );
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.items) return [];
      return data.items.map(normalizeVolume).filter(b => b.title && b.author);
    } catch (error) {
      console.error('Google Books search by author failed:', error);
      throw error;
    }
  },

  /**
   * Buscar libro por ISBN.
   */
  searchByIsbn: async (isbn) => {
    try {
      const clean = isbn.replace(/[-\s]/g, '');
      const query = encodeURIComponent(`isbn:${clean}`);
      const response = await fetch(
        `${GOOGLE_BOOKS_API}/volumes?q=${query}&maxResults=5&printType=books`
      );
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.items) return [];
      return data.items.map(normalizeVolume).filter(b => b.title);
    } catch (error) {
      console.error('Google Books search by ISBN failed:', error);
      throw error;
    }
  },

  /**
   * Validar formato ISBN-10 o ISBN-13.
   */
  isValidIsbn: (isbn) => {
    const clean = isbn.replace(/[-\s]/g, '');
    return /^\d{9}[\dX]$/i.test(clean) || /^\d{13}$/.test(clean);
  },
};

