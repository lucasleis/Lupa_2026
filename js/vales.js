import { inicializarCarrusel } from './carrusel.js';

// Datos provisionales: las cuatro fichas repiten producto porque aún no hay catálogo real.
const vales = [
  { frase: '«Tú tanjamón y yo tan pimiento»', unidad: '2ª unidad', entero: '50', centavos: '%', unidad_dto: 'DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Salchichón Revilla Extra Lonchas', peso: '65GR' },
  { frase: '«Tú tanjamón y yo tan pimiento»', unidad: '2ª unidad', entero: '50', centavos: '%', unidad_dto: 'DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Salchichón Revilla Extra Lonchas', peso: '65GR' },
  { frase: '«Tú tanjamón y yo tan pimiento»', unidad: '2ª unidad', entero: '50', centavos: '%', unidad_dto: 'DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Salchichón Revilla Extra Lonchas', peso: '65GR' },
  { frase: '«Tú tanjamón y yo tan pimiento»', unidad: '2ª unidad', entero: '50', centavos: '%', unidad_dto: 'DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Salchichón Revilla Extra Lonchas', peso: '65GR' },
];

const hexagono = (clase, fill) => `<svg class="vales__hexagono ${clase}" viewBox="0 0 131 118" aria-hidden="true" focusable="false"><path d="M120.198 23.7749L127.186 78.7861L72.222 114.173L10.1581 93.6508L3.17059 38.6396L58.1331 3.25324L120.198 23.7749Z" fill="${fill}" stroke="var(--color-gold)" stroke-width="5.9185"/></svg>`;
const hexagonoSombra = (clase, fill) => `<svg class="vales__hexagono ${clase}" viewBox="0 0 161 144" aria-hidden="true" focusable="false"><path d="M74.7691 -7.43062e-05L151.514 26.5044L160.585 97.9166L89.3633 143.245L9.07073 117.162L3.07249e-05 45.7497L74.7691 -7.43062e-05Z" fill="${fill}"/></svg>`;

const renderVale = (vale, index) => `<article class="carrusel__slide vales__slide" role="group" aria-roledescription="slide" aria-label="Vale ${index + 1} de ${vales.length}">
  <img class="vales__sarcofago" src="img/vales/sarcofago.svg" alt="">
  <p class="vales__dilo">Dilo en caja:</p>
  <p class="vales__frase">${vale.frase}</p>
  <div class="vales__discount" aria-label="${vale.unidad} al ${vale.entero}${vale.centavos} de descuento">
    ${hexagonoSombra('vales__hexagono--sombra', 'var(--color-gold-mid)')}
    ${hexagono('vales__hexagono--cara', 'var(--color-sky)')}
    <div class="vales__price">
      <span class="vales__price-unidad2">${vale.unidad}</span>
      <div class="vales__price-row">
        <span class="vales__price-euros" aria-hidden="true">${vale.entero}</span>
        <span class="vales__price-resto" aria-hidden="true"><span class="vales__price-centavos" aria-hidden="true">${vale.centavos}</span><span class="vales__price-dto" aria-hidden="true">${vale.unidad_dto}</span></span>
      </div>
    </div>
  </div>
  <img class="vales__producto" src="${vale.imagen}" alt="">
  <h3 class="vales__titulo">${vale.titulo}</h3>
  <p class="vales__peso">${vale.peso}</p>
</article>`;

const root = document.querySelector('.vales');
const track = root?.querySelector('.carrusel__track');

if (root && track) {
  track.innerHTML = vales.map(renderVale).join('');
  inicializarCarrusel(root, { cantidad: vales.length, circular: true });
}
