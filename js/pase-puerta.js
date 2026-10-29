import { irA } from './lenis.js';
import { altoViewportSVH, marcar } from './intro-scroll.js';

const cortina = document.querySelector('.pase-puerta');
const ofertas = document.querySelector('.ofertas');

let armada = false;

// El fundido del pase dura lo mismo que las animaciones de 600ms de
// css/sections.css. Mientras corre, el scroll queda fijo: si el usuario sigue
// empujando, el fundido se ve a medias sobre una pantalla que ya se movio.
export const FUNDIDO = 600;
// Vuelta: cuánto se frena el scroll antes de arrancar el viaje; el fundido sigue corriendo encima del movimiento.
export const ESPERA_VUELTA = 150;
const fijarDurante = (ms) => {
  // En el frame siguiente, para no cortar el scrollTo que acaba de ejecutarse.
  window.requestAnimationFrame(() => {
    window.lenis?.stop();
    window.setTimeout(() => window.lenis?.start(), ms);
  });
};

const revelar = () => {
  if (!cortina || !ofertas || !armada) return;
  armada = false;
  // El alto del riel es lo que la seccion mide de mas sobre el viewport.
  // El aterrizaje va al final del riel porque el tramo de entrada de .ofertas ahora es el riel completo.
  const riel = Math.max(0, ofertas.offsetHeight - altoViewportSVH);
  const top = window.scrollY + ofertas.getBoundingClientRect().top + riel * 1;
  document.body.dataset.puertaRevelada = 'true';
  document.documentElement.style.overflow = '';
  irA(top, { lock: true, immediate: true });
  fijarDurante(FUNDIDO);
};

const esperaPase = () => (window.matchMedia('(max-width: 480px)').matches ? 0 : 200);

document.addEventListener('interior:final', () => {
  if (!cortina || armada) return;
  armada = true;
  window.setTimeout(() => {
    document.documentElement.style.overflow = 'hidden';
    window.setTimeout(revelar, esperaPase());
  }, 0);
});

// Vuelta. El salto de ida teletransporta al final del riel de ofertas, asi que
// subir devuelve un recorrido que bajar nunca hizo. Esto lo espeja: al empezar
// a subir desde el principio de ofertas, salta al final del riel de .interior,
// que es donde el zoom de la entrada termina, con el mismo fundido de 600ms.
const interior = document.querySelector('.interior');
let volviendo = false;
let ultimoY = window.scrollY;

const alSubir = () => {
  const y = window.scrollY;
  // Un ancla que salta más allá de ofertas (LOS QUIERO → #formulario) nunca
  // pasa por revelar(): sin la marca, la capa del pasillo queda encima de todo.
  if (ofertas && !volviendo && document.body.dataset.puertaRevelada !== 'true'
    && ofertas.getBoundingClientRect().top < 0) {
    document.body.dataset.puertaRevelada = 'true';
  }
  const subiendo = y < ultimoY;
  ultimoY = y;
  if (!subiendo || !ofertas) return;
  if (ofertas.getBoundingClientRect().top < 0) return;
  volverAlInterior();
};

export const volverAlInterior = () => {
  if (volviendo || !interior || !ofertas) return;
  // Solo si el salto de ida ya ocurrio y ofertas llego a su tope.
  if (document.body.dataset.puertaRevelada !== 'true') return;
  volviendo = true;
  if ('puertaRevelada' in document.body.dataset) delete document.body.dataset.puertaRevelada;
  marcar(document.body, 'paseVolviendo', 'true');
  irA(interior.offsetTop + interior.offsetHeight - altoViewportSVH, { lock: true, immediate: true });
  fijarDurante(ESPERA_VUELTA);
  window.setTimeout(() => {
    delete document.body.dataset.paseVolviendo;
    volviendo = false;
  }, FUNDIDO);
};

if (interior && ofertas) window.lenis.on('scroll', alSubir);
