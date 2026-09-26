# Rendimiento de scroll (desktop)

Medido el 2026-09-26 con Chromium headless, viewport 1440x900, scroll con rueda
de ida y vuelta. "Raster" = tiempo total de RasterTask en el trace.

| Tramo                  | Raster antes | Raster después | Frames > 33ms antes → después |
|------------------------|-------------:|---------------:|------------------------------:|
| Intro (hero)           |     ~2270 ms |         ~75 ms | 10 → 0-1                      |
| Pirámide / puerta      |     ~1250 ms |        ~165 ms | 1 → 1                         |
| Resto de la página     |     ~1490 ms |        ~295 ms | 14 → 1                        |

El main thread (JS + estilos) nunca fue el cuello de botella: ~0,4 ms por
frame. El problema era rasterizar.

## Causas

1. `img/intro/ofertiti-name.svg`: 6,7 MB y 8.511 `<path>`. Se movía con el
   scroll, así que Chrome lo re-rasterizaba en cada frame. Solo esto explicaba
   ~85% del raster del intro. Reemplazado por `ofertiti-name.webp` (1152 px de
   ancho = 2x del tamaño máximo en pantalla, 41 KB). El SVG queda como fuente.
2. Transforms ligados al scroll sin capa propia: cada frame repintaba el stage
   entero. Ver el bloque "Rendimiento de scroll desktop" al final de
   `css/sections.css` y `js/scroll-activo.js`.

## Reglas para assets nuevos

- Un SVG exportado de Figma con texturas (glifos, tramas) no va como `<img>`
  animado: rasterizar a 2x del ancho máximo en pantalla y exportar a WebP.
  Chequeo rápido: `grep -c "<path" archivo.svg`; más de unos cientos, raster.
- Los rasters actuales ya están a ~2x del tamaño en pantalla a 1440 px; no hace
  falta achicarlos más (a DPR 2 se verían blandos).
- Elemento nuevo que se traslada con el scroll: agregarlo a la lista de capa
  permanente. Si además escala: a la lista de `html[data-scrolling]`.
- No poner `will-change` fijo en algo que escala más de ~1,3x: se ve borroso.
