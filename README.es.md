# WatchLog - Movie Tracker

Aplicación web para gestionar tu biblioteca de películas, series y libros. Trackea elementos vistos/leídos, pendientes y en proceso con sincronización automática con TMDB y Google Books.

📖 **Lee esto en**: [English](README.md)

## 🌐 Demo en vivo

[https://watchlog-vtlx.netlify.app/](https://watchlog-vtlx.netlify.app/) - Alojado en Netlify

## 📋 Tabla de contenidos

- [Descripción](#descripción)
  - [¿Por qué existe?](#por-qué-existe)
  - [Principios](#principios)
- [Características](#características)
  - [Core](#core)
  - [Búsqueda y Filtrado](#búsqueda-y-filtrado)
  - [Datos y Sincronización](#datos-y-sincronización)
  - [Interfaz](#interfaz)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Deploy](#deploy)
- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Desarrollo](#desarrollo)
- [Licencia](#licencia)
- [Recursos](#recursos)
- [Próximas mejoras](#próximas-mejoras)

## 📖 Descripción

Aplicación web para gestionar tu biblioteca de películas, series y libros. Trackea elementos vistos/leídos, pendientes y en proceso con sincronización automática con TMDB y Google Books.

### ¿Por qué existe?

**WatchLog** nace de la necesidad de tener un único lugar centralizado para gestionar todo tu contenido de entretenimiento. Cansado de usar una aplicación de terceros o un CSV para registrar qué películas viste.

**Visión futura:** Expandir más allá de películas para incluir series y libros. Un espacio unificado donde eres **dueño de tus datos** y puedes acceder desde cualquier dispositivo, en cualquier momento.

### Principios

- 🎯 **Centralizado** - Todo tu contenido en un solo lugar
- 🔒 **Privado** - Tus datos, tu servidor, sin algoritmos que te espíen
- 📱 **Accesible** - Desde móvil, tablet o desktop
- 🚀 **Abierto** - Código abierto, puedes fork y personalizar

## ✨ Características

### Core
- 🎬 **Películas, Series y Libros** - CRUD completo para películas, series TV y libros
- 🔐 **Autenticación segura** - Token-based con validación en base de datos
- 💾 **Persistencia** - Todos los datos guardados en PostgreSQL (Supabase)

### Gestión de Estados
- **Películas**: Pendiente, Vista, Favorita
- **Series**: Pendiente, Vista, Favorita, Viendo (trackea temporada actual con barra de progreso)
- **Libros**: Pendiente, Leyendo, Leído, Favorito (seguimiento mediante estado y rating)
- Seguimiento de temporadas con indicador visual de progreso
- Muestra 0% de progreso para series pendientes para evitar confusión

### Búsqueda y Filtrado
- 🔍 **Búsqueda global** - Por título, año o director
- 🎭 **Filtrado por estado** - Visualiza por estado actual
- ⭐ **Filtrado por rating** - Encuentra contenido mejor valorado
- 🎬 **Filtrado por género** - Organiza por tipo de contenido
- 📊 **Estadísticas** - Desglose visual por estado

### Datos y Sincronización
- 🖼️ **Pósters automáticos** - Integración con TMDB
- 📚 **Metadata de libros** - Integración con Google Books para portadas, páginas, géneros e ISBN
- ⭐ **Sistema de rating** - Valora con precisión de media estrella
- 📥 **Exporta datos** - Descarga tu biblioteca como CSV o JSON

### Interfaz
- 📱 **Responsive design** - Móvil, tablet y desktop
- ⚡ **Ultra rápido** - Construido con Vite
- 🌙 **Tema oscuro** - Fácil para la vista

## 📋 Requisitos

- **Node.js** 16 o superior
- **npm** o **yarn**
- Cuenta en [Supabase](https://supabase.com) (gratuito) - Para la base de datos
- API key en [TMDB](https://www.themoviedb.org/settings/api) (gratuito, opcional) - Para sincronizar pósters

## 🚀 Instalación

### 1. Fork del repositorio

👉 **Haz click en el botón "Fork"** en [GitHub](https://github.com/IvanPerez9/WatchLog) para crear tu propia copia.

Luego clona tu fork:

```bash
git clone https://github.com/TU-USUARIO/WatchLog.git
cd WatchLog
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear cuenta gratuita en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a **SQL Editor** y ejecutar `SUPABASE_SETUP.sql` de este repositorio
4. Copiar tus credenciales:
   - `VITE_SUPABASE_URL`: Settings → API → Project URL
   - `VITE_SUPABASE_ANON_KEY`: Settings → API → anon key

### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_TMDB_API_KEY=tu_tmdb_api_key
VITE_AUTH_TOKEN=tu_token_secreto_aqui
```

⚠️ **Seguridad**: Agregar `.env` a `.gitignore` - ya está aquí, ¡nunca hagas push de este archivo!

Referencia: Ver `.env.example` para la estructura

### 5. Obtener API Key de TMDB (Opcional pero Recomendado)

1. Registrarse en [TMDB](https://www.themoviedb.org/settings/api)
2. Crear una API key (hay tier gratuito)
3. Agregar a `.env` como `VITE_TMDB_API_KEY`

### 6. Crear tu token de autenticación

Generar un token fuerte y aleatorio (sin espacios):

```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# O usa un generador online: https://random.org/strings/
```

Luego:
1. Agregarlo a `.env` como `VITE_AUTH_TOKEN`
2. Agregarlo a Supabase: SQL Editor → Insert en tabla `valid_tokens`

### 7. Iniciar desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## 💻 Uso

### Ver y Buscar
- 👁️ Cambia entre pestañas Películas, Series y Libros
- 🔍 Busca películas/series por título, año o director
- 📚 Busca libros por título, autor o ISBN
- 🎭 Filtra por estado (Pendiente, Vista, Favorita, Viendo)
- ⭐ Filtra por rating mínimo

### Gestionar Contenido
Inicia sesión con tu token para:
- ➕ Agregar películas/series nuevas
- ⭐ Valora con precisión de media estrella
- 🎯 Cambia estado
- 🗑️ Elimina elementos

### Específico para Series
- 📺 Trackea temporada actual con botones +/-
- 📊 Barra de progreso muestra temporadas vistas
- 📥 Auto-sincronización desde TMDB

### Específico para Libros
- 📚 Añade libros usando búsqueda en Google Books (título, autor o ISBN)
- 🔍 Evita duplicados comprobando ISBN en la biblioteca
- 🧠 Rellena ISBN faltantes en libros existentes usando Google Books

## 🚀 Deploy

### Netlify (Recomendado)

1. Push a GitHub
2. Conectar a [Netlify](https://app.netlify.com)
3. Configuración automática:
   - Build: `npm run build`
   - Publish: `dist`
4. Agregar variables de entorno en dashboard
5. ✨ Deploy automático en cada push


## 🛠️ Tecnologías

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| Frontend | React + Vite | UI interactiva |
| Estilos | Tailwind CSS | Styling responsivo |
| Iconos | Lucide React | Icons modernos |
| Backend | Supabase | PostgreSQL + API REST |
| Datos externos | TMDB API | Info películas |
| Auth | Token-based | Seguridad |

## 📁 Estructura

```
watchlog/
├── src/
│   ├── app.jsx                    # Componente principal
│   ├── config.js                  # Configuración
│   ├── index.jsx                  # Punto de entrada
│   ├── api/
│   │   ├── supabase.js            # Cliente REST Supabase
│   │   ├── supabase-client.js     # Instancia cliente Supabase
│   │   └── tmdb.js                # Cliente TMDB API
│   ├── auth/
│   │   ├── useAuth.js             # Hook autenticación
│   │   └── LoginModal.jsx         # Componente modal login
│   ├── components/
│   │   ├── common/                # Componentes reutilizables
│   │   │   ├── StarRating.jsx
│   │   │   ├── PosterImage.jsx
│   │   │   ├── DeleteButton.jsx
│   │   │   └── StatusSelector.jsx
│   │   ├── movies/                # Componentes específicos películas
│   │   │   └── MovieCard.jsx
│   │   ├── series/                # Componentes específicos series
│   │   │   └── SeriesCard.jsx
│   │   ├── books/                 # Componentes específicos libros
│   │   │   ├── BookCard.jsx
│   │   │   └── BookSearchForm.jsx
│   │   ├── shared/                # Componentes UI compartidos
│   │   │   ├── AddItemForm.jsx
│   │   │   ├── Filters.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── Export.jsx
│   ├── styles/
│   │   └── buttonStyles.js        # Constantes estilos botones
│   └── utils/
│       ├── ratingUtils.js
│       ├── exportUtils.js
│       └── dateUtils.js
├── public/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## 💻 Desarrollo

### Scripts disponibles

```bash
npm run dev      # Desarrollo con HMR
npm run build    # Build optimizado
npm run preview  # Vista previa del build
```

### Variables de entorno en desarrollo

El archivo `.env` debe estar en `.gitignore` (no commitear nunca).

Usar `.env.example` como referencia para nuevos contribuidores.

## 📄 Licencia

Este proyecto está bajo licencia **MIT**.

Eres libre de:
- ✅ Usar en proyectos personales
- ✅ Usar en proyectos comerciales
- ✅ Modificar el código
- ✅ Distribuir

Condiciones:
- 📝 Incluir copia de la licencia

Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

¿Quieres contribuir? Lee [CONTRIBUTING.md](CONTRIBUTING.md)

## 📚 Recursos

- [Supabase Docs](https://supabase.io/docs)
- [TMDB API](https://developer.themoviedb.org/3)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🚀 Próximas mejoras

### Fase 2 - Export & Analytics ✅
- [x] Exportar a CSV/JSON
- [x] Filtros avanzados (por rango de años, director, etc.)
- [x] Opciones de ordenamiento (por rating, fecha añadida, etc.)

### Fase 3 - Soporte para Series ✅
- [x] Tabla separada `series` en la base de datos
- [x] Integración con API TMDB para TV
- [x] Componente de serie con seguimiento de temporadas
- [x] Gestión de series (añadir, editar, eliminar, calificar)
- [x] Búsqueda y filtrado de series
- [x] Trackea temporada actual con barra de progreso
- [x] UI consistente entre películas y series
- [x] Ordenamiento por actualizaciones recientes (por `updated_at`)
- [x] Mostrar "Actualizado hace X horas" en las tarjetas (usando `updated_at`)
- [x] Spinners de carga durante la obtención de datos

### Fase 4 - Soporte para Libros ✅
- [x] Tabla separada `books` en la base de datos
- [x] Integración con Google Books API
- [x] Componente de libro con autor/ISBN y páginas
- [x] Búsqueda por ISBN (búsqueda y obtención de metadata)
- [x] Gestión de libros (añadir, editar, eliminar, calificar)

### Fase 5 - Características Avanzadas
- [ ] Listas personalizadas y colecciones
- [ ] Tema oscuro/claro
- [ ] Cambio de idioma
- ...

---

<div align="center">

[⬆️ Volver al inicio](#watchlog---movie-tracker)

</div>