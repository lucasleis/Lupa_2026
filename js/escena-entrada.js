import { progresoDeRiel } from './intro-scroll.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.escena[data-entrada]').forEach((section) => {
  const stage = section.querySelector('.escena__stage');
  const rail = section.querySelector('.escena-rail');
  if (!stage || !rail) return;

  // Sin movimiento: la seccion se ve entera y el riel queda en 0, asi que no
  // cobra scroll vacio.
  if (reducedMotion.matches) {
    stage.style.setProperty('--escena-p', '1');
    if (section.classList.contains('interior')) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('interior:final'));
      }));
    }
    return;
  }

  section.dataset.entradaActiva = 'true';
  let framePending = false;
  let interiorEnFinal = false;

  const actualizar = () => {
    framePending = false;
    const p = progresoDeRiel(rail, { desdeElTope: true, destino: stage, propiedad: '--escena-p' });
    // La capa fija del interior vive fuera de la seccion, asi que su fundido
    // de salida necesita este progreso en el body.
    if (section.classList.contains('prueba-superada')) {
      document.body.style.setProperty('--sala-salida-p', String(p));
    }
    if (section.classList.contains('interior')) {
      document.body.style.setProperty('--interior-p', String(p));
      if (p >= 0.999 && !interiorEnFinal) {
        interiorEnFinal = true;
        document.dispatchEvent(new CustomEvent('interior:final'));
      } else if (p < 0.9) {
        interiorEnFinal = false;
      }
    }
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
