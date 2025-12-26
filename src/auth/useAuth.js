import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado al cargar
    const token = localStorage.getItem('accessToken');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (token) => {
    try {
      if (!token || token.trim().length === 0) {
        throw new Error('El token no puede estar vacío');
      }
      
      // Guardar token en localStorage
      localStorage.setItem('accessToken', token);
      setUser({ token });
      return null;
    } catch (error) {
      alert('Error: ' + error.message);
      return error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('accessToken');
      setUser(null);
    } catch (error) {
      alert('Error al cerrar sesión: ' + error.message);
    }
  };

  return { user, login, logout, loading };
};