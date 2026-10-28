import { irA } from './lenis.js';
import { altoViewportSVH } from './intro-scroll.js';
import { volverAlInterior, FUNDIDO as FUNDIDO_PASE } from './pase-puerta.js';

export const PANTALLAS_POR_SEGUNDO = 1.1;
export const PANTALLAS_POR_SEGUNDO_PASILLO = 2.2;
export const DURACION_MIN = 0.9;
export const ENFRIAMIENTO = 350;
const P_PRUEBA_SUPERADA = 0.6;

const mobile = window.matchMedia('(max-width: 480px)');
let bloqueadoHasta = 0;
let gestoTactilConsumido = false;
let touchX = 0;
let touchY = 0;
let ejeTactil = null;

window.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  touchX = touch.clientX;
  touchY = touch.clientY;
  ejeTactil = null;
  gestoTactilConsumido = false;
}, { passive: true });

window.addEventListener('touchmove', (event) => {
  // Sin esto, el scroll nativo arranca en los primeros 10px (antes de
  // decidir el eje), los touchmove siguientes ya no son cancelables y la
  // inercia nativa pelea con el viaje de Lenis: toda la pantalla vibra.
  if (mobile.matches && event.cancelable
    && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName)
    && !event.target.closest?.('.popup')) {
    event.preventDefault();
  }
  const touch = event.changedTouches[0];
  if (!touch) return;
  const dx = touch.clientX - touchX;
  const dy = touch.clientY - touchY;
  if (!ejeTactil && Math.max(Math.abs(dx), Math.abs(dy)) >= 10) {
    ejeTactil = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
  }
}, { passive: false });

window.addEventListener('touchend', () => {
  gestoTactilConsumido = false;
  ejeTactil = null;
}, { passive: true });
window.addEventListener('touchcancel', () => {
  gestoTactilConsumido = false;
  ejeTactil = null;
}, { passive: true });

const paradaDeRiel = (rail, p) => {
  if (!rail || getComputedStyle(rail).display === 'none') return null;
  const rect = rail.getBoundingClientRect();
  if (!rect.height) return null;
  return window.scrollY + rect.top - altoViewportSVH + p * rect.height;
};

const paradas = () => {
  const formulario = document.querySelector('.formulario');
  return [
    () => 0,
    () => paradaDeRiel(document.querySelector('.acertijo-panel-rail--intro'), 1),
    ...['entrada', 'anuncio', 'quiz', 'resultado'].map((nombre) =>
      () => paradaDeRiel(document.querySelector(`.acertijo-panel-rail--${nombre}`), 1)),
    () => paradaDeRiel(document.querySelector('.acertijo-panel-rail--piramide'), 1),
    () => paradaDeRiel(document.querySelector('.prueba-superada .escena-rail'), P_PRUEBA_SUPERADA),
    () => paradaDeRiel(document.querySelector('.interior .escena-rail'), 1),
    () => paradaDeRiel(document.querySelector('.ofertas .escena-rail'), 1),
    () => paradaDeRiel(document.querySelector('.vales .escena-rail'), 1),
    () => formulario ? window.scrollY + formulario.getBoundingClientRect().top : null,
    () => window.lenis.limit, // footer: es lo último del documento
  ].map((parada) => parada()).filter((y) => y !== null).sort((a, b) => a - b)
    .reduce((resultado, y) => {
      if (resultado.length && y - resultado.at(-1) < 0.5 * altoViewportSVH) resultado[resultado.length - 1] = y;
      else resultado.push(y);
      return resultado;
    }, []);
};

const viajar = (destino) => {
  const interior = paradaDeRiel(document.querySelector('.interior .escena-rail'), 1);
  const esPasillo = interior !== null
    && (Math.abs(destino - interior) <= 2 || Math.abs(window.scrollY - interior) <= 2);
  const pantallasPorSegundo = esPasillo ? PANTALLAS_POR_SEGUNDO_PASILLO : PANTALLAS_POR_SEGUNDO;
  const duration = Math.max(DURACION_MIN, Math.abs(destino - window.scrollY) / altoViewportSVH / pantallasPorSegundo);
  // Si un salto del código interrumpe el viaje, Lenis no llama onComplete; con el timestamp el bloqueo vence solo.
  bloqueadoHasta = performance.now() + duration * 1000 + ENFRIAMIENTO;
  // El cubic-out de CAMARA deja ~0,7s de arrastre subpíxel al final de los viajes largos y eso hace vibrar la pantalla.
  irA(destino, {
    lock: true,
    duration,
    force: false,
    easing: esPasillo ? (t) => t : (t) => 1 - (1 - t) ** 2,
  });
};

window.autoPantalla = ({ deltaY, event }) => {
  const lenis = window.lenis;
  if (!mobile.matches || lenis.isStopped || lenis.isLocked) return true;
  const esTouch = event?.type?.startsWith('touch');
  if (esTouch && (!ejeTactil || ejeTactil === 'horizontal')) return true;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName)) return true;

  if (esTouch && event.cancelable) event.preventDefault();
  if (performance.now() < bloqueadoHasta || (esTouch && gestoTactilConsumido)) return false;
  if (esTouch) gestoTactilConsumido = true;

  const direccion = Math.sign(deltaY);
  if (!direccion) return false;
  const y = window.scrollY;
  const lista = paradas();
  const destino = direccion > 0
    ? lista.find((parada) => parada > y + 2)
    : [...lista].reverse().find((parada) => parada < y - 2);
  if (destino === undefined || (direccion > 0 && destino > lenis.limit + 1)) return false;
  const interior = paradaDeRiel(document.querySelector('.interior .escena-rail'), 1);
  if (direccion < 0 && document.body.dataset.puertaRevelada === 'true'
    && interior !== null && Math.abs(destino - interior) <= 2) {
    volverAlInterior();
    bloqueadoHasta = Infinity; // que ningún gesto se cuele durante el fundido
    window.setTimeout(() => {
      bloqueadoHasta = 0;
      const destinoVuelta = paradaDeRiel(
        document.querySelector('.prueba-superada .escena-rail'), P_PRUEBA_SUPERADA);
      // +50: fijarDurante reanuda Lenis un frame después de los 600ms; antes viajar() sin force sería descartado.
      if (destinoVuelta !== null && destinoVuelta < window.scrollY - 2) viajar(destinoVuelta);
    }, FUNDIDO_PASE + 50);
    return false;
  }

  viajar(destino);
  return false;
};

document.addEventListener('popup:cerrado', () => {
  if (!mobile.matches) return;
  window.requestAnimationFrame(() => {
    const destino = paradaDeRiel(document.querySelector('.prueba-superada .escena-rail'), P_PRUEBA_SUPERADA);
    if (destino !== null && destino > window.scrollY + 2) viajar(destino);
  });
});
