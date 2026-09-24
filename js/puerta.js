import { progresoDeRiel, habilitarRiel } from './intro-scroll.js';

const section = document.querySelector('.puerta');
const stage = section?.querySelector('.puerta__stage');
const rail = section?.querySelector('.puerta-rail');

if (section && stage && rail) {
  habilitarRiel(rail, '--puerta-rail-height', 'var(--puerta-track)');
  let framePending = false;

  const actualizar = () => {
    framePending = false;
    progresoDeRiel(rail, { destino: stage, propiedad: '--puerta-p' });
  };

  const solicitarActualizacion = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(actualizar);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.style.setProperty('--puerta-p', '1');
  } else {
    window.addEventListener('scroll', solicitarActualizacion, { passive: true });
    window.addEventListener('resize', solicitarActualizacion);
    window.addEventListener('orientationchange', solicitarActualizacion);
    solicitarActualizacion();
  }
}
