import { progresoDeRiel, habilitarRiel } from './intro-scroll.js';

const section = document.querySelector('.prueba-superada');
const stage = section?.querySelector('.prueba-superada__stage');
const rail = section?.querySelector('.prueba-superada-rail');

if (section && stage && rail) {
  habilitarRiel(rail, '--prueba-rail-height', 'var(--prueba-track)');
  let framePending = false;

  const actualizar = () => {
    framePending = false;
    progresoDeRiel(rail, {
      destino: stage,
      propiedad: '--prueba-p',
    });
  };

  const solicitarActualizacion = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(actualizar);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.style.setProperty('--prueba-p', '1');
  } else {
    window.addEventListener('scroll', solicitarActualizacion, { passive: true });
    window.addEventListener('resize', solicitarActualizacion);
    window.addEventListener('orientationchange', solicitarActualizacion);
    solicitarActualizacion();
  }
}
