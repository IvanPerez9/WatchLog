# WatchLog - Movie Tracker

Aplicación web para trackear películas vistas y pendientes.
Futuro para series, libros etc...

## 🚀 Tecnologías

- **React** - Framework frontend
- **Vite** - Build tool y dev server
- **Supabase** - Base de datos PostgreSQL + API REST
- **TMDB API** - Información de películas y pósters
- **Tailwind CSS** - Estilos

## 📁 Estructura del proyecto

```
watchlog/
├── .env                    # Variables de entorno (NO commitear)
├── .gitignore             # Archivos a ignorar en Git
├── index.html             # HTML base
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── src/
│   ├── index.js           # Entry point
│   ├── app.js             # Componente principal
│   ├── config.js          # Configuración centralizada
│   ├── api/
│   │   ├── supabase.js    # Cliente API Supabase
│   │   └── tmdb.js        # Cliente API TMDB
│   └── components/
│       ├── MovieCard.js   # Tarjeta de película
│       ├── AddMovie.js    # Formulario añadir
│       ├── Filters.js     # Búsqueda y filtros
│       └── Stats.js       # Estadísticas
└── README.md
```

## 🛠️ Setup inicial

### 1. Instalar dependencias

```bash
cd WatchLog
npm install
```

### 2. Configurar .env

Crear archivo `.env` en la raíz con:

```env
VITE_SUPABASE_URL=https://txgtcqfhozxnginmqkvz.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_TMDB_API_KEY=940c74e2e3f47b75f7fafa1b2c8bffb5
```

### 3. Configurar Supabase

En Supabase, asegúrate de tener estas tablas:

**Tabla `statuses`:**
```sql
CREATE TABLE statuses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL
);

INSERT INTO statuses (description) VALUES 
  ('Pendiente'),
  ('Vista'),
  ('Viendo');
```

**Tabla `movies`:**
```sql
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  status_id INTEGER REFERENCES statuses(id),
  poster_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Habilitar RLS (Row Level Security):**
- Ve a Authentication → Policies
- Activa políticas públicas para testing (puedes asegurarlas después)

### 4. Arrancar en desarrollo

```bash
npm run dev
```

Esto abre http://localhost:3000

## 📦 Build para producción

```bash
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