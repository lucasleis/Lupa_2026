import { inicializarCarrusel } from './carrusel.js';

const ofertas = [
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '5', centavos: ',99', unidad: 'KG/€', precioTexto: '5,99 euros el kilo', imagen: 'img/ofertas/oferta.webp', titulo: 'Alas de pollo adobadas Granja Gourmet', peso: '500G' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '3', centavos: ',49', unidad: 'KG/€', precioTexto: '3,49 euros el kilo', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Tomate rama ecológico', peso: '1KG' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '7', centavos: ',25', unidad: 'KG/€', precioTexto: '7,25 euros el kilo', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Selección de quesos curados', peso: '300G' },
  { etiqueta: 'img/ofertas/etiqueta-precio.svg', entero: '2', centavos: ',99', unidad: 'KG/€', precioTexto: '2,99 euros el kilo', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Yogur natural', peso: '4 X 125G' },
];

// Provisional: falta una etiqueta por producto, cada una con su precio.

const root = document.querySelector('.ofertas');
const track = root?.querySelector('.carrusel__track');
const estrias = () => Array.from({ length: 11 }, () => '<img class="ofertas__estria" src="img/ofertas/estria.svg" alt="">').join('');

const renderOferta = (oferta, index) => `<article class="carrusel__slide ofertas__slide" role="group" aria-roledescription="slide" aria-label="Oferta ${index + 1} de ${ofertas.length}">
  <img class="ofertas__plato ofertas__plato--exterior" src="img/ofertas/plato-exterior.svg" alt="">
  <img class="ofertas__plato ofertas__plato--interior" src="img/ofertas/plato-interior.svg" alt="">
  <img class="ofertas__producto" src="${oferta.imagen}" alt="">
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
  <h3 class="ofertas__producto-titulo">${oferta.titulo}</h3>
  <p class="ofertas__peso">${oferta.peso}</p>
  <div class="ofertas__repisa" aria-hidden="true"><img src="img/ofertas/repisa.svg" alt=""><div class="ofertas__estrias" aria-hidden="true">${estrias()}</div></div>
</article>`;

if (root && track) {
  track.innerHTML = ofertas.map(renderOferta).join('');
  inicializarCarrusel(root, { cantidad: ofertas.length, circular: true });
}
