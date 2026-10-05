import { irA } from './lenis.js';

const cortina = document.querySelector('.pase-puerta');
const ofertas = document.querySelector('.ofertas');
const popup = document.querySelector('.popup');

let armada = false;

// Calibrable: duración del movimiento de cámara hacia .ofertas.
const DURACION_REVELADO = 1.2;

const revelar = () => {
  if (!cortina || !ofertas || !armada) return;
  armada = false;
  // El alto del riel es lo que la seccion mide de mas sobre el viewport.
  // 0.35 va apareado con el --escena-entrada-tramo de .ofertas (0.30): aterriza
  // apenas pasado el final del fade, con la seccion ya visible. Si .ofertas se
  // queda sin riel, riel vale 0 y esto se comporta como antes.
  const riel = Math.max(0, ofertas.offsetHeight - window.innerHeight);
  const top = window.scrollY + ofertas.getBoundingClientRect().top + riel * 0.35;
  document.body.dataset.puertaRevelada = 'true';
  document.documentElement.style.overflow = '';
  irA(top, { lock: true, duration: DURACION_REVELADO });
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
