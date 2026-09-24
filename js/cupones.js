// Provisional: los cupones llegarán de una fuente todavía no definida.
// El backend deberá devolver el descuento separado en euros y centavos.
const cupones = [
  { euros: '2', centavos: '50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000001' },
  { euros: '1', centavos: '50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000002' },
  { euros: '3', centavos: '', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000003' },
  { euros: '0', centavos: '50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000004' },
];

import { inicializarCarrusel } from './carrusel.js';

const root = document.querySelector('.cupones');
const track = root?.querySelector('.carrusel__track');

const hexagon = (shadow = false) => `<svg class="cupones__hexagon${shadow ? ' cupones__hexagon--shadow' : ''}" viewBox="0 0 131 118" aria-hidden="true"><path d="M120.198 23.7749L127.186 78.7861L72.222 114.173L10.1581 93.6508L3.17059 38.6396L58.1331 3.25324L120.198 23.7749Z" fill="${shadow ? 'var(--color-gold-mid)' : 'var(--color-orange-hex)'}" stroke="${shadow ? 'var(--color-gold-mid)' : 'var(--color-gold)'}" stroke-width="5.9185"/></svg>`;

const renderCoupon = (coupon, index) => `<article class="carrusel__slide cupones__slide" role="group" aria-roledescription="slide" aria-label="Cupón ${index + 1} de ${cupones.length}">
  <!-- Decisión de diseño: el SVG ya está orientado; se ignora el rect rotado del dump. -->
  <img class="cupones__card" src="img/cupones/tarjeta.svg" alt="">
  <div class="cupones__discount">${hexagon(true)}${hexagon()}<div class="cupones__price" aria-label="${coupon.euros}${coupon.centavos ? `,${coupon.centavos}` : ''} € de descuento"><span class="cupones__price-euros" aria-hidden="true">${coupon.euros}</span>${coupon.centavos ? `<span class="cupones__price-resto" aria-hidden="true"><span class="cupones__price-centavos">${coupon.centavos}</span><span class="cupones__price-dto">${coupon.unidad}</span></span>` : ''}</div></div>
  <img class="cupones__product" src="${coupon.imagen}" alt="">
  <h3 class="cupones__product-title">${coupon.titulo}</h3>
  <p class="cupones__detail">${coupon.detalle}</p>
  <!-- Provisional: asset del código de barras pendiente. -->
  <div class="cupones__barcode" aria-label="Código ${coupon.codigo}"><span></span></div>
  <!-- Provisional: glifos del marco inferior pendientes. -->
  <div class="cupones__glyphs" aria-hidden="true"></div>
</article>`;

if (root && track) {
  track.innerHTML = cupones.map(renderCoupon).join('');
  inicializarCarrusel(root, { cantidad: cupones.length, circular: true });
}
