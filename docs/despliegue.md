# Despliegue

## URL de producción

Confirmada por el cliente (2026-10-14): `https://lupa.com/ofertiti`

La app no vive en la raíz del dominio, sino en un subdirectorio. Lo que hay que
tocar antes de publicar:

1. **`.htaccess` → `RewriteBase`**: hoy es `/buscandoconlupa/`. Tiene que ser
   `/ofertiti/`. Si el server es nginx (ver `system/nginx-configuration.txt`),
   el `rewrite` ya es relativo al `location` y no hace falta cambio.
2. **Barra final obligatoria**: todas las rutas de `system/App/Views/base.html`
   son relativas (`css/…`, `img/…`, `procesar-formulario/`). Con
   `lupa.com/ofertiti` (sin barra) el navegador resuelve contra `lupa.com/` y
   no carga nada. Hace falta redirección 301 de `/ofertiti` → `/ofertiti/` en
   el server, o un `<base href="/ofertiti/">` en el `<head>`.
3. **Rutas absolutas hardcodeadas con `/buscandoconlupa/`** (29 apariciones):
   `system/App/Controllers/Admin.php` (6 `header('Location:')`),
   `CreateTables.php`, `system/App/Views/panel.html`, `404.html`, `500.html`.
   Afectan al panel de administración y a las páginas de error, no a la
   landing. Arreglo mínimo: una constante de base en `index.php` y usarla en
   esos puntos, en vez de buscar y reemplazar literal en cada archivo.
4. **`sync-to-vm.sh`** sincroniza a `/var/www/html/buscandoconlupa/`; cambiar
   el destino cuando se defina el path real del server de producción.
5. Los emails de 2024 (`system/App/Views/email/email-*.html`) apuntan a
   `lupa2024.dev-ws.com/buscandoconlupa/pdf/…`. Son plantillas viejas; revisar
   solo si se reutiliza alguna.

## Base de datos

Ya existe y funciona: tabla `formularios` creada por
`system/App/Models/Migrations.php` (se ejecuta visitando `crear-tablas/`), alta
de contactos en `Formulario::nuevoFormulario()` con deduplicación por email, y
exportación a CSV desde el panel (`panel.html`, botón "Descargar CSV").
Pendiente en producción: lanzar `crear-tablas/` una vez y cambiar la contraseña
del admin (`CHANGEPASSWORD` en `index.php`).
