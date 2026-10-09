import { irA } from './lenis.js';

const cortina = document.querySelector('.pase-puerta');
const ofertas = document.querySelector('.ofertas');
const popup = document.querySelector('.popup');

let armada = false;

// El fundido del pase dura lo mismo que las animaciones de 600ms de
// css/sections.css. Mientras corre, el scroll queda fijo: si el usuario sigue
// empujando, el fundido se ve a medias sobre una pantalla que ya se movio.
const FUNDIDO = 600;
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
  const riel = Math.max(0, ofertas.offsetHeight - window.innerHeight);
  const top = window.scrollY + ofertas.getBoundingClientRect().top + riel * 1;
  document.body.dataset.puertaRevelada = 'true';
  document.documentElement.style.overflow = '';
  irA(top, { lock: true, immediate: true });
  fijarDurante(FUNDIDO);
};

document.addEventListener('interior:final', () => {
  if (!cortina || armada) return;
  // El popup solo se muestra una vez por carga. En recorridos posteriores,
  // deja que el usuario continúe desplazándose sin volver a bloquearlo.
  if (popup?.classList.contains('popup--montado') && popup.getAttribute('aria-hidden') !== 'false') return;
  armada = true;
  // El popup abre en este mismo evento. Se resuelve en el siguiente
  // macrotask y leyendo el DOM, para no depender del orden en que popup.js
  // y este modulo registraron sus listeners.
  window.setTimeout(() => {
    if (popup?.getAttribute('aria-hidden') === 'false') return;
    // Sin popup no hay lock de scroll: lo toma la cortina, porque saltar el
    // scroll mientras el usuario lo esta empujando pelea con el momentum.
    document.documentElement.style.overflow = 'hidden';
    window.setTimeout(revelar, 200);
  }, 0);
});

document.addEventListener('popup:cerrado', revelar);

// Vuelta. El salto de ida teletransporta al final del riel de ofertas, asi que
// subir devuelve un recorrido que bajar nunca hizo. Esto lo espeja: al empezar
// a subir desde el principio de ofertas, salta al final del riel de .interior,
// que es donde el zoom de la entrada termina, con el mismo fundido de 600ms.
const interior = document.querySelector('.interior');
let volviendo = false;
let ultimoY = window.scrollY;

const alSubir = () => {
  const y = window.scrollY;
  const subiendo = y < ultimoY;
  ultimoY = y;
  if (!subiendo || volviendo || !interior || !ofertas) return;
  // Solo si el salto de ida ya ocurrio y ofertas llego a su tope.
  if (document.body.dataset.puertaRevelada !== 'true') return;
  if (ofertas.getBoundingClientRect().top < 0) return;
  volviendo = true;
  delete document.body.dataset.puertaRevelada;
  document.body.dataset.paseVolviendo = 'true';
  irA(interior.offsetTop + interior.offsetHeight - window.innerHeight, { lock: true, immediate: true });
  fijarDurante(FUNDIDO);
  window.setTimeout(() => {
    delete document.body.dataset.paseVolviendo;
    volviendo = false;
  }, FUNDIDO);
};

if (interior && ofertas) window.lenis.on('scroll', alSubir);
