import { inicializarCarrusel } from './carrusel.js';

const ofertas = [
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '1', centavos: ',29', unidad: 'L/€', precioTexto: '1,29 euros el litro', imagen: 'img/ofertas/leche-movit.webp', titulo: 'Leche Pascual Movit: sin lactosa, desnatada y semidesnatada', peso: '500G' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '2', centavos: ',39', unidad: '6ud/€', precioTexto: '2,39 euros el pack de 6', imagen: 'img/ofertas/batido-puleva-chocolate.webp', titulo: 'Batido Puleva de chocolate pack 6 unds x 200 ml.', peso: '6 x 200ML' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '2', centavos: ',59', unidad: '6ud/€', precioTexto: '2,59 euros el pack de 6', imagen: 'img/ofertas/batido-puleva-zero.webp', titulo: 'Batido Puleva Choco Zero / Chocolate sin lactosa', peso: '6 x 200ML' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '1', centavos: ',99', unidad: 'L/€', precioTexto: '1,99 euros el litro', imagen: 'img/ofertas/batido-puleva-shake.webp', titulo: 'Batido Puleva Vainilla / Chocolate / Fresa', peso: '1L' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '3', centavos: ',50', unidad: 'ud/€', precioTexto: '3,50 euros la unidad', imagen: 'img/ofertas/queso-le-rustique.webp', titulo: 'Queso Le Rustique Camembert', peso: '250GR' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '2', centavos: ',50', unidad: 'ud/€', precioTexto: '2,50 euros la unidad', imagen: 'img/ofertas/queso-caprice.webp', titulo: 'Queso Caprice des Dieux', peso: '125GR' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '5', centavos: ',40', unidad: 'ud/€', precioTexto: '5,40 euros la unidad', imagen: 'img/ofertas/queso-burgo-arias.webp', titulo: 'Queso Burgo Arias Original', peso: '500GR' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '2', centavos: ',49', unidad: 'ud/€', precioTexto: '2,49 euros la unidad', imagen: 'img/ofertas/weikis.webp', titulo: 'Weikis Bella Easo Chocolate/Leche 6 unds', peso: '250GR' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '3', centavos: ',30', unidad: 'ud/€', precioTexto: '3,30 euros la unidad', imagen: 'img/ofertas/kh7.webp', titulo: 'Desengrasante KH-7 pistola', peso: '780ML' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '1', centavos: ',69', unidad: 'ud/€', precioTexto: '1,69 euros la unidad', imagen: 'img/ofertas/aceituna-la-espanola.webp', titulo: 'Aceituna La Española rellenas de anchoa', peso: '350GR' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '3', centavos: ',50', unidad: 'ud/€', precioTexto: '3,50 euros la unidad', imagen: 'img/ofertas/girasoli-rana.webp', titulo: 'Girasoli Rana Gourmet queso cabra&amp;cebolla caramelizada', peso: '250GR' },
];

const root = document.querySelector('.ofertas');
const track = root?.querySelector('.carrusel__track');
const estrias = () => Array.from({ length: 11 }, () => '<img class="ofertas__estria" src="img/ofertas/estria.svg" alt="">').join('');

const renderOferta = (oferta, index) => `<article class="carrusel__slide ofertas__slide" data-oferta-index="${index}" role="group" aria-roledescription="slide" aria-label="Oferta ${index + 1} de ${ofertas.length}">
  <img class="ofertas__plato ofertas__plato--exterior" src="img/ofertas/plato-exterior.svg" alt="">
  <img class="ofertas__plato ofertas__plato--interior" src="img/ofertas/plato-interior.svg" alt="">
  <img class="ofertas__producto" src="${oferta.imagen}" alt="" decoding="async" fetchpriority="low">
  <div class="ofertas__precio">
    <img src="${oferta.etiqueta}" alt="">
    <div class="ofertas__price" aria-label="${oferta.precioTexto}">
      <span class="ofertas__price-entero" aria-hidden="true">${oferta.entero}</span>
      <span class="ofertas__price-resto" aria-hidden="true">
        <span class="ofertas__price-centavos">${oferta.centavos}</span>
        <span class="ofertas__price-unidad">${oferta.unidad}</span>
      </span>
    </div>
  </div>
  <div class="ofertas__texto">
    <h3 class="ofertas__producto-titulo">${oferta.titulo}</h3>
    <p class="ofertas__peso">${oferta.peso}</p>
  </div>
  <div class="ofertas__repisa" aria-hidden="true"><img src="img/ofertas/repisa.svg" alt=""><div class="ofertas__estrias" aria-hidden="true">${estrias()}</div></div>
</article>`;

if (root && track) {
  track.innerHTML = ofertas.map(renderOferta).join('');
  inicializarCarrusel(root, { cantidad: ofertas.length, circular: true, clones: 4, visiblesEscritorio: 4 });
}
