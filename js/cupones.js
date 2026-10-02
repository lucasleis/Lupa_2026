// Provisional: los cupones llegarán de una fuente todavía no definida.
// El backend deberá devolver el descuento separado en euros y centavos.
const cupones = [
  { euros: '2', centavos: ',50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000001' },
  { euros: '1', centavos: ',50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000002' },
  { euros: '3', centavos: ',00', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000003' },
  { euros: '0', centavos: ',50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000004' },
];

import { inicializarCarrusel } from './carrusel.js';

const root = document.querySelector('.cupones');
const track = root?.querySelector('.carrusel__track');

const renderCoupon = (coupon, index) => `<article class="carrusel__slide cupones__slide" data-cupon-index="${index}" role="group" aria-roledescription="slide" aria-label="Cupón ${index + 1} de ${cupones.length}">
  <img class="cupones__card" src="img/cupones/papiro.svg" alt="">
  <div class="cupones__discount"><img class="cupones__hexagon cupones__hexagon--shadow" src="img/cupones/hexagono-sombra.svg" alt=""><img class="cupones__hexagon" src="img/cupones/hexagono.svg" alt=""><div class="cupones__price" aria-label="${coupon.euros}${coupon.centavos} € de descuento"><span class="cupones__price-euros" aria-hidden="true">${coupon.euros}</span>${coupon.centavos ? `<span class="cupones__price-resto" aria-hidden="true"><span class="cupones__price-centavos">${coupon.centavos}</span><span class="cupones__price-dto">${coupon.unidad}</span></span>` : ''}</div></div>
  <img class="cupones__product" src="${coupon.imagen}" alt="">
  <h3 class="cupones__product-title">${coupon.titulo}</h3>
  <p class="cupones__detail">${coupon.detalle}</p>
  <img class="cupones__barcode" src="img/cupones/codigo-barras.svg" alt="" aria-label="Código ${coupon.codigo}">
  <img class="cupones__glyphs" src="img/cupones/glifos.svg" alt="" aria-hidden="true">
</article>`;

if (root && track) {
  track.innerHTML = cupones.map(renderCoupon).join('');
  inicializarCarrusel(root, { cantidad: cupones.length, circular: true });
}
