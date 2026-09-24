import { inicializarCarrusel } from './carrusel.js';

const vales = [
  { frase: '«Tú tanjamón y yo tan pimiento»', entero: '1', centavos: ',50', unidad: '€ DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Jamón cocido extra', peso: '250 g' },
  { frase: '«Más vale tarde que nunca»', entero: '2', centavos: ',00', unidad: '€ DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Pimientos asados', peso: '300 g' },
  { frase: '«A buen hambre no hay pan duro»', entero: '1', centavos: ',50', unidad: '€ DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Pan de pueblo', peso: '500 g' },
  { frase: '«Sobre gustos no hay nada escrito»', entero: '3', centavos: ',00', unidad: '€ DTO', imagen: 'img/vales/producto-ejemplo.webp', titulo: 'Selección gourmet', peso: '250 g' },
];

const hexagono = (clase, fill) => `<svg class="vales__hexagono ${clase}" viewBox="0 0 131 118" aria-hidden="true" focusable="false"><path d="M120.198 23.7749L127.186 78.7861L72.222 114.173L10.1581 93.6508L3.17059 38.6396L58.1331 3.25324L120.198 23.7749Z" fill="${fill}" stroke="var(--color-gold)" stroke-width="5.9185"/></svg>`;

const renderVale = (vale, index) => `<article class="carrusel__slide vales__slide" role="group" aria-roledescription="slide" aria-label="Vale ${index + 1} de ${vales.length}">
  <img class="vales__sarcofago" src="img/vales/sarcofago.svg" alt="">
  <p class="vales__dilo">Dilo en caja:</p>
  <p class="vales__frase">${vale.frase}</p>
  <div class="vales__discount" aria-label="${vale.entero}${vale.centavos} euros de descuento">
    ${hexagono('vales__hexagono--sombra', 'var(--color-gold-mid)')}
    ${hexagono('vales__hexagono--cara', 'var(--color-sky)')}
    <div class="vales__price">
      <span class="vales__price-euros" aria-hidden="true">${vale.entero}</span>
      <span class="vales__price-resto" aria-hidden="true"><span class="vales__price-centavos" aria-hidden="true">${vale.centavos}</span><span class="vales__price-dto" aria-hidden="true">${vale.unidad}</span></span>
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
