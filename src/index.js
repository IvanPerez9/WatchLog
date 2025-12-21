/**
 * Entry point de la aplicación
 * Similar al método main() en Java
 * 
 * ReactDOM.createRoot es como iniciar el servidor Spring Boot
 * "Monta" la aplicación React en el div#root del HTML
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.js';

// Obtener el elemento del DOM donde montar la app
const rootElement = document.getElementById('root');

// Crear la raíz de React y renderizar el componente App
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);