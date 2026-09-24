import { progresoDeRiel } from './intro-scroll.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.escena[data-entrada]').forEach((section) => {
  const stage = section.querySelector('.escena__stage');
  const rail = section.querySelector('.escena-rail');
  if (!stage || !rail) return;

  // Sin movimiento: la seccion se ve entera y el riel queda en 0, asi que no
  // cobra scroll vacio.
  if (reducedMotion.matches) {
    stage.style.setProperty('--prueba-p', '1');
    return;
  }

  section.dataset.entradaActiva = 'true';
  let framePending = false;

  const actualizar = () => {
    framePending = false;
    progresoDeRiel(rail, { desdeElTope: true, destino: stage, propiedad: '--prueba-p' });
  };
  const solicitarActualizacion = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(actualizar);
  };

  window.addEventListener('scroll', solicitarActualizacion, { passive: true });
  window.addEventListener('resize', solicitarActualizacion);
  window.addEventListener('orientationchange', solicitarActualizacion);
  solicitarActualizacion();
});
