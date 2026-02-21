/**
 * Cliente HTTP para OpenLibrary API
 * Documentación: https://openlibrary.org/developers/api
 * 
 * Ventajas:
 * - Sin API Key requerida
 * - Gratuita y sin límites
 * - Búsqueda por título, autor, ISBN
 */

const OPENLIBRARY_API = 'https://openlibrary.org';
const COVERS_API = 'https://covers.openlibrary.org';

/**
 * Normalizar datos de OpenLibrary a formato de aplicación
 */
const normalizeBook = (doc, searchResult = false) => {
  return {
    title: doc.title || '',
    author: Array.isArray(doc.author_name) 
      ? doc.author_name.join(', ') 
      : doc.authors?.[0]?.name || 'Unknown Author',
    year: doc.first_publish_year || doc.publish_date?.split('-')[0],
    isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : doc.isbn,
    total_pages: doc.number_of_pages_median || doc.number_of_pages,
    genres: doc.subject ? doc.subject.slice(0, 5).join(', ') : '',
    cover_path: null, // Se obtiene después
    // Es resultado de búsqueda (tiene campos de búsqueda)
    isSearchResult: searchResult,
    // Para búsqueda visual
    coverId: doc.cover_id,
    key: doc.key || `${doc.title}-${doc.author_name?.[0] || 'unknown'}`
  };
};

/**
 * Generar URL de portada
 */
const getCoverUrl = (coverId, isbn, size = 'M') => {
  // Tamaños: S (small), M (medium), L (large)
  if (coverId) {
    return `${COVERS_API}/b/id/${coverId}-${size}.jpg`;
  }
  if (isbn) {
    return `${COVERS_API}/b/isbn/${isbn}-${size}.jpg`;
  }
  return null;
};

export const openlibraryApi = {
  /**
   * Buscar libros por título
   * @param {string} title - Título del libro
   * @param {number} limit - Número máximo de resultados
   */
  searchByTitle: async (title, limit = 10) => {
    try {
      const response = await fetch(
        `${OPENLIBRARY_API}/search.json?title=${encodeURIComponent(title)}&limit=${limit}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.docs
        .map((doc, index) => {
          const book = normalizeBook(doc, true);
          book.cover_path = getCoverUrl(doc.cover_id, book.isbn, 'M');
          book.searchIndex = index;
          return book;
        })
        .filter(book => book.title && book.author);
    } catch (error) {
      console.error('OpenLibrary search by title failed:', error);
      throw error;
    }
  },

  /**
   * Buscar libros por autor
   * @param {string} author - Nombre del autor
   * @param {number} limit - Número máximo de resultados
   */
  searchByAuthor: async (author, limit = 10) => {
    try {
      const response = await fetch(
        `${OPENLIBRARY_API}/search.json?author=${encodeURIComponent(author)}&limit=${limit}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.docs
        .map((doc, index) => {
          const book = normalizeBook(doc, true);
          book.cover_path = getCoverUrl(doc.cover_id, book.isbn, 'M');
          book.searchIndex = index;
          return book;
        })
        .filter(book => book.title && book.author);
    } catch (error) {
      console.error('OpenLibrary search by author failed:', error);
      throw error;
    }
  },

  /**
   * Buscar libro por ISBN
   * @param {string} isbn - ISBN del libro
   */
  searchByIsbn: async (isbn) => {
    try {
      const response = await fetch(
        `${OPENLIBRARY_API}/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&jscmd=data&format=json`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const key = Object.keys(data)[0];
      
      if (!key) {
        throw new Error('ISBN not found');
      }

      const doc = data[key];
      const book = {
        title: doc.title || '',
        author: doc.authors?.[0]?.name || 'Unknown Author',
        year: doc.publish_date?.split('-')[0] || doc.first_publish_year,
        isbn: isbn,
        total_pages: doc.number_of_pages,
        genres: doc.subjects ? doc.subjects.slice(0, 5).join(', ') : '',
        cover_path: doc.cover?.medium || doc.cover?.large || null,
        isSearchResult: true,
        key: key
      };

      return [book];
    } catch (error) {
      console.error('OpenLibrary search by ISBN failed:', error);
      throw error;
    }
  },

  /**
   * Búsqueda general (título + autor)
   * Útil para búsqueda global en la app
   */
  search: async (query, limit = 10) => {
    try {
      // Intenta primero por título, luego por autor si la consulta parece ser un nombre
      const titleResults = await openlibraryApi.searchByTitle(query, limit);
      
      if (titleResults.length > 0) {
        return titleResults;
      }

      // Si no hay resultados por título, intenta por autor
      return await openlibraryApi.searchByAuthor(query, limit);
    } catch (error) {
      console.error('OpenLibrary general search failed:', error);
      return [];
    }
  },

  /**
   * Obtener URL de portada
   */
  getCoverUrl,

  /**
   * Normalizar datos de libro
   */
  normalizeBook,

  /**
   * Validar ISBN
   */
  isValidIsbn: (isbn) => {
    const cleaned = isbn.replace(/[-\s]/g, '');
    return /^(?:ISBN(?:-1[03])?[- ]?)?(?=[0-9X]{10}$|(?:(?=(?:[0-9]+[-]?){3})[-0-9X]{13}$)|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]?){4})[- 0-9]{17}$)/.test(isbn);
  }
};
