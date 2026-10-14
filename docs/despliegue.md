# Despliegue

## URL de producción

Confirmada por el cliente (2026-10-14): `https://lupa.com/ofertiti`

La app no vive en la raíz del dominio, sino en un subdirectorio. Estado de la
migración:

1. **Resuelto:** `.htaccess` usa `RewriteBase /ofertiti/`. Si el server es
   nginx (ver `system/nginx-configuration.txt`), el `rewrite` ya es relativo
   al `location`.
2. **Resuelto:** `index.php` define `BASE` como `/ofertiti/` y
   `system/App/Views/base.html` establece `<base href="<?= BASE ?>">`, para
   que las rutas relativas funcionen también al entrar sin barra final.
3. **Resuelto:** redirects del admin, enlace de creación de tablas y rutas
   del panel usan `BASE`. Las vistas 404 y 500 conservan rutas literales
   `/ofertiti/` porque se sirven con `readfile()` y no pasan por PHP. El catch
   de `index.php` también apunta a `system/App/Views/` dentro del proyecto.
4. **Pendiente:** `sync-to-vm.sh` conserva el destino anterior; actualizarlo
   cuando se defina el path real del server de producción.
5. **Fuera de alcance:** los emails de 2024
   (`system/App/Views/email/email-*.html`) conservan sus URLs antiguas; revisar
   solo si se reutiliza alguna.

## Base de datos

Ya existe y funciona: tabla `formularios` creada por
`system/App/Models/Migrations.php` (se ejecuta visitando `crear-tablas/`), alta
de contactos en `Formulario::nuevoFormulario()` con deduplicación por email, y
exportación a CSV desde el panel (`panel.html`, botón "Descargar CSV").
Pendiente en producción: lanzar `crear-tablas/` una vez y cambiar la contraseña
del admin (`CHANGEPASSWORD` en `index.php`).
