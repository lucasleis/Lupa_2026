import { inicializarCarrusel } from './carrusel.js';

const FRASE = '«Tú tanjamón y yo tan pimiento»';
const vales = [
  { frase: FRASE, prefijo: '',          entero: '3<span class="vales__price-chico">x</span>2', centavos: '€', unidad: '',    descuentoTexto: '3x2',                            imagen: 'img/vales/kefir.webp',           titulo: 'Kéfir Nestlé Natural o Arándanos',          peso: '150GR' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '50',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 50% de descuento', imagen: 'img/vales/salchichon.webp',      titulo: 'Salchichón Revilla Extra Lonchas',          peso: '65GR' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '70',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 70% de descuento', imagen: 'img/vales/axe.webp',             titulo: 'Desodorante Axe Dark Temptation',           peso: '150ML' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '70',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 70% de descuento', imagen: 'img/vales/colgate.webp',         titulo: 'Dentífrico Colgate Total Original',         peso: '75ML' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '50',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 50% de descuento', imagen: 'img/vales/tonica-schweppes.webp', titulo: 'Tónica Schweppes lata',                     peso: '25CL' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '70',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 70% de descuento', imagen: 'img/vales/creatina.webp',        titulo: 'Creatina Natur Tierra cápsulas',            peso: '' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '50',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 50% de descuento', imagen: 'img/vales/pan-dulcesol.webp',    titulo: 'Pan Dulcesol Burger Brioche pack 4',        peso: '340GR' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '50',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 50% de descuento', imagen: 'img/vales/pizza-dr-oetker.webp', titulo: 'Pizza Dr.Oetker Rústica borde relleno BBQ', peso: '495GR' },
  { frase: FRASE, prefijo: '2ª unidad', entero: '50',                                      centavos: '%',  unidad: 'DTO', descuentoTexto: 'Segunda unidad al 50% de descuento', imagen: 'img/vales/tosta-rica.webp',      titulo: 'Galleta Cuétara Tosta Rica',                peso: '760GR' },
];

const hexagono = (clase, fill) => `<svg class="vales__hexagono ${clase}" viewBox="0 0 131 118" aria-hidden="true" focusable="false"><path d="M120.198 23.7749L127.186 78.7861L72.222 114.173L10.1581 93.6508L3.17059 38.6396L58.1331 3.25324L120.198 23.7749Z" fill="${fill}" stroke="var(--color-gold)" stroke-width="5.9185"/></svg>`;
const hexagonoSombra = (clase, fill) => `<svg class="vales__hexagono ${clase}" viewBox="0 0 161 144" aria-hidden="true" focusable="false"><path d="M74.7691 -7.43062e-05L151.514 26.5044L160.585 97.9166L89.3633 143.245L9.07073 117.162L3.07249e-05 45.7497L74.7691 -7.43062e-05Z" fill="${fill}"/></svg>`;

const renderVale = (vale, index) => `<article class="carrusel__slide vales__slide" role="group" aria-roledescription="slide" aria-label="Vale ${index + 1} de ${vales.length}">
  <img class="vales__sarcofago" src="img/vales/sarcofago.svg" alt="">
  <p class="vales__dilo">Dilo en caja:</p>
  <p class="vales__frase">${vale.frase}</p>
  <div class="vales__discount${vale.prefijo ? ' vales__discount--prefijo' : ''}${vale.unidad ? '' : ' vales__discount--combo'}" aria-label="${vale.descuentoTexto}">
    ${hexagonoSombra('vales__hexagono--sombra', 'var(--color-gold-mid)')}
    ${hexagono('vales__hexagono--cara', 'var(--color-sky)')}
    <div class="vales__price">
      ${vale.prefijo ? `<span class="vales__price-prefijo" aria-hidden="true">${vale.prefijo}</span>` : ''}
      <span class="vales__price-fila" aria-hidden="true">
        <span class="vales__price-euros">${vale.entero}</span>
        <span class="vales__price-resto"><span class="vales__price-centavos">${vale.centavos}</span>${vale.unidad ? `<span class="vales__price-dto">${vale.unidad}</span>` : ''}</span>
      </span>
    </div>
  </div>
  <img class="vales__producto" src="${vale.imagen}" alt="" decoding="async" fetchpriority="low">
  <div class="vales__texto">
    <h3 class="vales__titulo">${vale.titulo}</h3>
    ${vale.peso ? `<p class="vales__peso">${vale.peso}</p>` : ''}
  </div>
</article>`;

const root = document.querySelector('.vales');
const track = root?.querySelector('.carrusel__track');

if (root && track) {
  track.innerHTML = vales.map(renderVale).join('');
  inicializarCarrusel(root, { cantidad: vales.length, circular: true, clones: 4, visiblesEscritorio: 4 });
}
