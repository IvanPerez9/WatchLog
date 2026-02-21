/**
 * Componente BookSearchForm
 * Permite añadir libros con búsqueda en OpenLibrary
 * 
 * Props:
 * - onAddBook: callback cuando se ha añadido un libro
 * - statuses: array de estados disponibles
 * - user: usuario actual
 */

import React, { useState } from 'react';
import { Search, Loader, X, BookOpen } from 'lucide-react';
import { openlibraryApi } from '../../api/openlibrary.js';
import { booksApi } from '../../api/supabase.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

const BookSearchForm = ({ onAddBook, statuses, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title', 'author', 'isbn'
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addingBook, setAddingBook] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    statuses.find(s => s.description === 'Pending')?.id || 1
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let results = [];
      
      if (searchType === 'title') {
        results = await openlibraryApi.searchByTitle(searchQuery, 10);
      } else if (searchType === 'author') {
        results = await openlibraryApi.searchByAuthor(searchQuery, 10);
      } else if (searchType === 'isbn') {
        if (openlibraryApi.isValidIsbn(searchQuery)) {
          results = await openlibraryApi.searchByIsbn(searchQuery);
        } else {
          alert('ISBN no válido. Intenta con un ISBN de 10 o 13 dígitos.');
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Error en la búsqueda. Intenta de nuevo.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleAddBook = async () => {
    if (!selectedBook || !user) return;

    setAddingBook(true);
    try {
      const bookToAdd = {
        title: selectedBook.title,
        author: selectedBook.author,
        year: selectedBook.year,
        isbn: selectedBook.isbn,
        cover_path: selectedBook.cover_path,
        genres: selectedBook.genres,
        total_pages: selectedBook.total_pages,
        status_id: selectedStatus,
        rating: null,
      };

      const result = await booksApi.create(bookToAdd, user.token);

      if (result && result.length > 0) {
        onAddBook(result[0]);
        setSearchResults([]);
        setSelectedBook(null);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error al añadir el libro. Intenta de nuevo.');
    } finally {
      setAddingBook(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
        <BookOpen size={24} className="text-blue-400" />
        Buscar y Añadir Libro
      </h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2 mb-4">
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setSearchResults([]);
              setSelectedBook(null);
            }}
            className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm hover:border-blue-500 focus:outline-none focus:border-blue-400"
          >
            <option value="title">Por Título</option>
            <option value="author">Por Autor</option>
            <option value="isbn">Por ISBN</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchType === 'isbn'
                ? 'Ej: 978-0451524934'
                : `Buscar ${searchType === 'author' ? 'autor' : 'título'}...`
            }
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm placeholder-gray-400 hover:border-blue-500 focus:outline-none focus:border-blue-400"
          />

          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            Buscar
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            Resultados ({searchResults.length})
          </h3>

          {searchResults.map((book, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectBook(book)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                selectedBook?.key === book.key
                  ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-24 bg-gray-600 rounded overflow-hidden">
                  {book.cover_path ? (
                    <img
                      src={book.cover_path}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={24} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-100 line-clamp-2 text-sm">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {book.author}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {book.year && (
                      <span className="text-xs text-gray-500">📅 {book.year}</span>
                    )}
                    {book.total_pages && (
                      <span className="text-xs text-gray-500">📖 {book.total_pages} págs</span>
                    )}
                    {book.isbn && (
                      <span className="text-xs text-gray-500">ISBN: {book.isbn}</span>
                    )}
                  </div>
                  {book.genres && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {book.genres.split(',').slice(0, 3).map((genre, gIdx) => (
                        <span
                          key={gIdx}
                          className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Book Details & Add Form */}
      {selectedBook && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded border border-blue-500/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-100">
                {selectedBook.title}
              </h3>
              <p className="text-sm text-gray-400">por {selectedBook.author}</p>
            </div>
            <button
              onClick={() => setSelectedBook(null)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status Selector */}
          <div className="mb-4 space-y-2">
            <label className="text-sm font-medium text-gray-300">Estado inicial:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-100 rounded text-sm hover:border-blue-500 focus:outline-none focus:border-blue-400"
            >
              {statuses
                .filter(s => ['Pending', 'Reading', 'Read', 'Favorite'].includes(s.description))
                .map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.description}
                  </option>
                ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddBook}
            disabled={addingBook || !user}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {addingBook ? (
              <>
                <Loader size={18} className="animate-spin" />
                Añadiendo...
              </>
            ) : (
              <>
                <BookOpen size={18} />
                Añadir a Mi Biblioteca
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && searchResults.length === 0 && searchQuery && (
        <div className="mt-6 text-center text-gray-400 py-8">
          <p>No se encontraron resultados para: <strong>{searchQuery}</strong></p>
          <p className="text-xs mt-2">Intenta con diferentes palabras clave</p>
        </div>
      )}

      {!user && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded text-sm text-yellow-300">
          Inicia sesión para añadir libros
        </div>
      )}
    </div>
  );
};

export default BookSearchForm;
