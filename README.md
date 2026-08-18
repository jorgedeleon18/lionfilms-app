# Lion Films — App de alquiler de equipos

App web para el alquiler de equipo audiovisual de Lion Films (Gaby). React + Vite. El catálogo vive en `src/data/catalog.js` y el estado (carrito, cliente registrado, pedidos, fechas bloqueadas) se guarda en el `localStorage` del navegador — eso todavía no cambió. Lo que sí se conectó ya es **Supabase Auth**, solo para el login de Gaby (modo admin): antes cualquiera podía tocar el botón "Gaby" y entrar sin contraseña, ahora pide email/contraseña reales. La migración completa del catálogo/pedidos a una base de datos real sigue pendiente (ver `claude/plan-app-gaby.md`).

## Configurar Supabase (login de Gaby)

1. Copiá `.env.example` a un archivo nuevo llamado `.env.local` (este NO se sube a git, es solo para tu compu).
2. Completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los datos de tu proyecto en [supabase.com](https://supabase.com) → Project Settings → API.
3. En Supabase, andá a Authentication → Users → "Add user" y creale un usuario a Gaby (email + contraseña). Ese es el login que va a usar para entrar al modo admin.
4. En Netlify (una vez deployado), andá a Site settings → Environment variables y agregá las mismas dos variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) para que el login funcione también en el sitio publicado. Después de agregarlas hay que volver a deployar (Deploys → Trigger deploy).

**Importante**: la `secret key` de Supabase (empieza con `sb_secret_...`) nunca va en la app ni en git — esa es solo para uso de servidor/administración desde el dashboard de Supabase. Acá solo usamos la `publishable key` (`sb_publishable_...`), que es segura para el navegador.

## Correr en local

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` lista para deployar.

## Subir a GitHub

1. Creá un repositorio nuevo en GitHub (por ejemplo `lionfilms-app`), vacío, sin README ni .gitignore (ya los tiene el proyecto).
2. Desde esta carpeta:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de la app de Lion Films"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/lionfilms-app.git
   git push -u origin main
   ```

## Deploy en Netlify

1. Entrá a [app.netlify.com](https://app.netlify.com) con tu cuenta.
2. "Add new site" → "Import an existing project" → conectá tu cuenta de GitHub y elegí el repo `lionfilms-app`.
3. Netlify va a detectar automáticamente la configuración gracias al archivo `netlify.toml` que ya está en el proyecto:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Dale a "Deploy site". En un par de minutos vas a tener una URL tipo `https://lionfilms-app.netlify.app` para mandarle a Gaby.
5. Cada vez que hagas `git push` a `main`, Netlify va a redeployar solo con los cambios nuevos.

## Estructura del proyecto

- `src/data/catalog.js` — categorías, productos y combos/promociones (el catálogo real que pasó Gaby).
- `src/context/AppContext.jsx` — todo el estado de la app: carrito, cliente registrado, pedidos, fechas bloqueadas por producto.
- `src/pages/` — una página por vista (Home, Listado, Producto, Alta de clientes, Cómo alquilar, Contacto, Mi pedido, Fichas de Gaby).
- `src/components/` — Header, carrito (drawer), calendario de disponibilidad, toast.
- `src/index.css` — estilos globales (tema violeta oscuro "glass").
