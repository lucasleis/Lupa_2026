import { irA } from './lenis.js';
import { altoViewportSVH } from './intro-scroll.js';
import { volverAlInterior, FUNDIDO as FUNDIDO_PASE } from './pase-puerta.js';

export const PANTALLAS_POR_SEGUNDO = 1.1;
export const PANTALLAS_POR_SEGUNDO_PASILLO = 2.2;
export const DURACION_MIN = 0.9;
export const ENFRIAMIENTO = 350;
// Apareado con el transition de .escena__track en css/sections.css (1.1s).
const DESLIZ_CUPONES = 1100;
export const VELOCIDAD_INTRO_ESCRITORIO = 1.25; // multiplicador del tramo pantalla 1 ↔ 2
export const VELOCIDAD_SALIDA_PAPIROS_ESCRITORIO = 1.5; // multiplicador al salir de los papiros hacia adelante
export const VELOCIDAD_PIRAMIDE_ESCRITORIO = 1 / 1.1; // multiplicador del tramo resultado ↔ Esfinge (10% más lento)
export const VELOCIDAD_SALIDA_PANEL_MOVIL = 1.5; // multiplicador del tramo papiros → quiz en mobile (salen los glifos, entra la nube)
export const VELOCIDAD_PASILLO_MOVIL = 1.6; // multiplicador del viaje pirámide → Esfinge en mobile (pasillo quieto tras el popup)
export const VELOCIDAD_VUELTA_PIRAMIDE_MOVIL = 2; // multiplicador del viaje Esfinge → resultado en mobile (~770svh de una)

const escritorio = window.matchMedia('(min-width: 481px)');
const layoutEscritorio = window.matchMedia('(min-width: 900px)');
const P_PRUEBA_SUPERADA = 0.6;

let bloqueadoHasta = 0;
let gestoTactilConsumido = false;
// La inercia del trackpad sigue mandando wheel 1-2s después del gesto; sin una pausa de
// PAUSA_RUEDA ms entre eventos, todo cuenta como el mismo gesto (igual que gestoTactilConsumido).
const PAUSA_RUEDA = 200;
let ultimaRueda = 0;
let gestoRuedaConsumido = false;
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
  if (event.cancelable
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
    // Desktop: del resultado a la Esfinge es un solo viaje, sin parar adentro de la pirámide.
    () => layoutEscritorio.matches ? null : paradaDeRiel(document.querySelector('.acertijo-panel-rail--piramide'), 1),
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
  const intro = paradaDeRiel(document.querySelector('.acertijo-panel-rail--intro'), 1);
  const esTramoIntro = escritorio.matches && intro !== null
    && Math.max(destino, window.scrollY) <= intro + 2;
  const papiros = paradaDeRiel(document.querySelector('.prueba-superada .escena-rail'), P_PRUEBA_SUPERADA);
  const saleDePapiros = escritorio.matches && papiros !== null
    && Math.abs(window.scrollY - papiros) <= 2 && destino > window.scrollY;
  const resultado = paradaDeRiel(document.querySelector('.acertijo-panel-rail--resultado'), 1);
  const esTramoPiramide = layoutEscritorio.matches && resultado !== null && papiros !== null
    && Math.abs(Math.min(destino, window.scrollY) - resultado) <= 2
    && Math.abs(Math.max(destino, window.scrollY) - papiros) <= 2;
  const entrada = paradaDeRiel(document.querySelector('.acertijo-panel-rail--entrada'), 1);
  const quiz = paradaDeRiel(document.querySelector('.acertijo-panel-rail--quiz'), 1);
  const esSalidaPanelMovil = !escritorio.matches && entrada !== null && quiz !== null
    && Math.abs(Math.min(destino, window.scrollY) - entrada) <= 2
    && Math.abs(Math.max(destino, window.scrollY) - quiz) <= 2;
  // Tras cerrar el popup el viaje no sale de la parada de la pirámide sino de donde se abrió el popup; basta con salir de adentro de la pirámide.
  const esPasilloMovil = !layoutEscritorio.matches && resultado !== null && papiros !== null
    && Math.abs(destino - papiros) <= 2 && window.scrollY > resultado + 2 && window.scrollY < destino;
  const piramide = paradaDeRiel(document.querySelector('.acertijo-panel-rail--piramide'), 1);
  // Mismo movimiento que el pasillo del interior (lineal, PANTALLAS_POR_SEGUNDO_PASILLO): con ease-out el pasillo se asentaba antes del popup.
  const esPiramideMovil = !layoutEscritorio.matches && resultado !== null && piramide !== null
    && Math.abs(window.scrollY - resultado) <= 2 && Math.abs(destino - piramide) <= 2;
  const esVueltaPiramideMovil = !layoutEscritorio.matches && resultado !== null && papiros !== null
    && Math.abs(destino - resultado) <= 2 && Math.abs(window.scrollY - papiros) <= 2;
  const pantallasPorSegundo = esPasillo || esPiramideMovil ? PANTALLAS_POR_SEGUNDO_PASILLO : PANTALLAS_POR_SEGUNDO;
  const duration = Math.max(DURACION_MIN, Math.abs(destino - window.scrollY) / altoViewportSVH
    / (pantallasPorSegundo * (esTramoIntro ? VELOCIDAD_INTRO_ESCRITORIO
      : saleDePapiros ? VELOCIDAD_SALIDA_PAPIROS_ESCRITORIO
      : esTramoPiramide ? VELOCIDAD_PIRAMIDE_ESCRITORIO
      : esSalidaPanelMovil ? VELOCIDAD_SALIDA_PANEL_MOVIL
      : esPasilloMovil ? VELOCIDAD_PASILLO_MOVIL
      : esVueltaPiramideMovil ? VELOCIDAD_VUELTA_PIRAMIDE_MOVIL : 1)));
  // Si un salto del código interrumpe el viaje, Lenis no llama onComplete; con el timestamp el bloqueo vence solo.
  bloqueadoHasta = performance.now() + duration * 1000 + ENFRIAMIENTO;
  // El cubic-out de CAMARA deja ~0,7s de arrastre subpíxel al final de los viajes largos y eso hace vibrar la pantalla.
  irA(destino, {
    lock: true,
    duration,
    force: false,
    easing: esPasillo || esPiramideMovil ? (t) => t : (t) => 1 - (1 - t) ** 2,
  });
};

window.autoPantalla = ({ deltaY, event }) => {
  const esRueda = event?.type === 'wheel';
  if (esRueda) {
    const ahora = performance.now();
    if (ahora - ultimaRueda > PAUSA_RUEDA) gestoRuedaConsumido = false;
    ultimaRueda = ahora;
  }
  const lenis = window.lenis;
  if (lenis.isStopped || lenis.isLocked) return true;
  const esTouch = event?.type?.startsWith('touch');
  if (esTouch && (!ejeTactil || ejeTactil === 'horizontal')) return true;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName)) return true;

  if (event?.cancelable) event.preventDefault();
  if (performance.now() < bloqueadoHasta || (esTouch && gestoTactilConsumido)
    || (esRueda && gestoRuedaConsumido)) return false;
  if (esTouch) gestoTactilConsumido = true;
  if (esRueda) gestoRuedaConsumido = true;

  const direccion = Math.sign(deltaY);
  if (!direccion) return false;
  const y = window.scrollY;

  // Desde la Esfinge, el primer gesto hacia abajo abre los cupones en vez de viajar.
  const esfinge = document.querySelector('.prueba-superada');
  const papiros = paradaDeRiel(esfinge?.querySelector('.escena-rail'), P_PRUEBA_SUPERADA);
  if (direccion > 0 && papiros !== null && Math.abs(y - papiros) <= 2
    && esfinge.dataset.cupones !== 'true') {
    esfinge.querySelector('.prueba-superada__cupones')?.click();
    bloqueadoHasta = performance.now() + DESLIZ_CUPONES + ENFRIAMIENTO;
    return false;
  }

  // Mobile: la parada de la pirámide solo sirve de ida (dispara el popup); de vuelta cortaba en el pasillo.
  const piramide = paradaDeRiel(document.querySelector('.acertijo-panel-rail--piramide'), 1);
  const lista = paradas().filter((parada) => direccion > 0 || layoutEscritorio.matches
    || piramide === null || Math.abs(parada - piramide) > 2);
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
  window.requestAnimationFrame(() => {
    const destino = paradaDeRiel(document.querySelector('.prueba-superada .escena-rail'), P_PRUEBA_SUPERADA);
    if (destino !== null && destino > window.scrollY + 2) viajar(destino);
  });
});
