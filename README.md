# WatchLog - Movie Tracker

Aplicación web para trackear películas vistas, pendientes y en proceso. 
Sincronización con TMDB para obtener información automática de películas.

## 🚀 Tecnologías

- **React** - Framework frontend
- **Vite** - Build tool y dev server
- **Supabase** - Base de datos PostgreSQL + API REST
- **TMDB API** - Información de películas y pósters
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

## ✨ Funcionalidades

### ✅ Implementadas

- **Visualización pública** - Ver películas sin autenticación
- **Sistema de autenticación** - Token-based (Access Token en localStorage)
- **CRUD completo** - Crear, leer, actualizar, eliminar películas
- **Búsqueda global** - Busca en todas las películas (no solo página actual)
- **Filtrado por estado** - Pendiente, Vista, Viendo, Favorita
- **Paginación** - 20 películas por página, con búsqueda integrada
- **Importación CSV** - Importar películas en lote (requiere autenticación)
- **Sincronización TMDB** - Obtener posters y años automáticamente
- **Rellenar posters en background** - Proceso asíncrono sin bloquear UI
- **Estadísticas en tiempo real** - Total de películas por estado
- **Carga optimizada** - Primeras 20 películas al instante, resto en background

## 📁 Estructura del proyecto

```
watchlog/
├── .env                    # Variables de entorno (NO commitear)
├── .gitignore             # Archivos a ignorar en Git
├── index.html             # HTML base
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── README.md
├── src/
│   ├── index.jsx          # Entry point React
│   ├── app.jsx            # Componente principal (lógica + UI)
│   ├── config.js          # Variables de entorno centralizadas
│   ├── api/
│   │   ├── supabase.js    # Cliente API Supabase (CRUD)
│   │   ├── tmdb.js        # Cliente API TMDB (búsqueda)
│   │   └── supabase-client.js  # Cliente Supabase (desusado)
│   ├── auth/
│   │   └── useAuth.js     # Hook de autenticación
│   ├── components/
│   │   ├── MovieCard.jsx   # Tarjeta de película
│   │   ├── AddMovie.jsx    # Formulario añadir película
│   │   ├── Filters.jsx     # Búsqueda y filtros
│   │   └── Stats.jsx       # Estadísticas por estado
│   └── styles/            # Estilos globales
└── node_modules/
```

## 🛠️ Setup inicial

### 1. Instalar dependencias

```bash
cd WatchLog
npm install
npm install @supabase/supabase-js
```

### 2. Configurar .env

Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_TMDB_API_KEY=tu_tmdb_api_key_aqui
```

### 3. Configurar Supabase

En **Supabase SQL Editor**, ejecutar:

```sql
-- Tabla de estados
CREATE TABLE statuses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL UNIQUE
);

INSERT INTO statuses (description) VALUES 
  ('Pendiente'),
  ('Vista'),
  ('Viendo');
```

-- Tabla de películas
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  status_id INTEGER REFERENCES statuses(id),
  poster_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (permitir todo)
CREATE POLICY "statuses_allow_all"
ON statuses FOR ALL TO public USING (true);

CREATE POLICY "movies_allow_all"
ON movies FOR ALL TO public USING (true) WITH CHECK (true);
```

### 4. Arrancar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## 🔐 Autenticación

El sistema usa **Access Token** guardado en localStorage:

1. **Sin login** - Puedes ver todas las películas
2. **Con login** - Acceso a funciones de edición:
   - Agregar película
   - Actualizar estado
   - Eliminar película
   - Importar CSV
   - Rellenar posters

El "token" es solo un mecanismo de control en la app. Las RLS de Supabase permiten todo públicamente.

**Cómo obtener token de prueba:**
- Puedes usar cualquier string (ej: `test-token-123`)
- Se guarda en localStorage y persiste entre sesiones
- Click en "Logout" para borrar la sesión

## 📊 Arquitectura

```
┌────────────────────────────────────────────────────┐
│                   FRONTEND (React)                 │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   App.jsx    │  │ Components   │                │
│  │ (Main)       │  │ (Views)      │                │
│  └──────┬───────┘  └──────────────┘                │
│         │                                          │
│  ┌──────▼─────────────────────┐                    │
│  │   API Layer (Services)     │                    │
│  │  - supabase.js (CRUD)      │                    │
│  │  - tmdb.js (External API)  │                    │
│  │  - useAuth.js (Auth)       │                    │
│  └──────┬─────────────────────┘                    │
│         │                                          │
│  ┌──────▼──────┐                                   │
│  │  config.js  │  ← Lee .env                       │
│  └─────────────┘                                   │
└────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌──────────────────┐
│    Supabase     │        │    TMDB API      │
│  (PostgreSQL)   │        │   (External)     │
│                 │        │                  │
│  Tables:        │        │  Returns:        │
│  - movies       │        │  - year          │
│  - statuses     │        │  - poster_path   │
└─────────────────┘        │  - tmdb_id       │
                           │  - overview      │
                           └──────────────────┘
```

## 🎬 Flujo de datos

### 1. **Carga inicial**
```
Página abre
  ↓
loadInitialData()
  ├─ loadStatuses() [GET estados desde Supabase]
  ├─ loadMovies() [GET primeras 20 películas]
  └─ loadAllMovies() [GET todas (~1000) en background]
```

### 2. **Agregar película**
```
Usuario escribe título → handleAddMovie()
  ↓
requireAuth() [¿Autenticado?]
  ↓
tmdbApi.searchMovie() [Busca en TMDB]
  ↓
moviesApi.create() [Guarda en Supabase]
  ↓
loadMovies() [Recarga lista]
```

### 3. **Rellenar posters**
```
Click botón → requireAuth() [¿Autenticado?]
  ↓
fillMissingPosters() [Busca películas sin poster]
  ↓
Para cada película:
  ├─ tmdbApi.searchMovie() [Obtiene poster + año]
  └─ moviesApi.update() [Actualiza en Supabase]
  ↓
loadAllMovies() [Recarga con nuevos datos]
```

## 📦 Scripts disponibles

```bash
# Desarrollo
npm run dev          # Inicia dev server con HMR

# Producción
npm run build        # Build optimizado
npm run preview      # Preview del build

# Dependencias
npm install          # Instala todas las dependencias
npm install nombre   # Instala una dependencia específica
```

## 🔧 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | API key pública | `eyJh...` |
| `VITE_TMDB_API_KEY` | API key de TMDB | `abc123...` |

## 🐛 Troubleshooting

### Error 401 en Supabase
- Verificar que VITE_SUPABASE_ANON_KEY es correcto
- Verificar que RLS policies permiten lectura pública

### Posters no aparecen
- Verificar que VITE_TMDB_API_KEY es válido
- Revisar consola (F12) para errores de TMDB

### Búsqueda no funciona
- Asegúrate que `allMovies` se está cargando (tarda unos segundos)
- Prueba recargar la página

## 🚀 Próximas mejoras

- [ ] Autenticación real con Supabase Auth
- [ ] Rating y reseñas de películas
- [ ] Listas personalizadas
- [ ] Soporte para series
- [ ] Sincronización con IMDb
- [ ] Recomendaciones basadas en vistas
- [ ] Compartir listas con amigos

## 📝 Notas de desarrollo

- **Carga en dos fases**: Primeras 20 películas al instante, resto en background
- **Búsqueda global**: Busca en todas las películas cargadas, no solo página actual
- **Paginación dinámica**: Se recalcula automáticamente cuando filtras
- **Sin dependencia de JWT**: Usa token simple en localStorage para control de acceso
- **RLS permisivo**: Por desarrollo. En producción, implementar políticas más restrictivas

---

**Última actualización**: Diciembre 2025
npm run build
```

Genera la carpeta `dist/` con los archivos estáticos.

## 🚀 Deploy en Netlify

### Opción 1: Desde GitHub

1. Push del código a tu repo GitHub
2. En Netlify: "Add new site" → "Import from Git"
3. Selecciona el repo `WatchLog`
4. Configuración:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. En "Environment variables" añade:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TMDB_API_KEY`
6. Deploy!

### Opción 2: Drag & Drop

1. Ejecuta `npm run build`
2. Ve a https://app.netlify.com/drop
3. Arrastra la carpeta `dist/`
4. ¡Listo!

## 🎯 Funcionalidades

- ✅ Añadir películas (busca automáticamente en TMDB)
- ✅ Ver pósters y año
- ✅ Cambiar estado (Pendiente/Vista/Viendo)
- ✅ Filtrar por estado
- ✅ Buscar por título
- ✅ Eliminar películas
- ✅ Importar desde CSV
- ✅ Estadísticas por estado

## 🔧 Comandos útiles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build para producción
npm run preview  # Preview del build
```

## 📝 Notas

- Las variables de entorno DEBEN empezar con `VITE_` para ser accesibles en el frontend
- El `.env` NUNCA debe commitearse (está en .gitignore)
- En Netlify, configura las variables de entorno en el dashboard