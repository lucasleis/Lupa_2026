import { progresoDeRiel, habilitarRiel } from './intro-scroll.js';

const section = document.querySelector('.puerta');
const stage = section?.querySelector('.puerta__stage');
const rail = section?.querySelector('.puerta-rail');

if (section && stage && rail) {
  habilitarRiel(rail, '--puerta-rail-height', 'var(--puerta-track)');
  let framePending = false;
  // puerta:final es un FLANCO, no un nivel: sin esto se dispara en cada frame de
  // scroll en que el progreso queda clavado en 1. Se re-arma con histeresis
  // (recien por debajo de 0.9) para que el pase vuelva a ocurrir si el usuario
  // sube y baja de nuevo por la puerta, sin chatter en el borde del umbral.
  let enFinal = false;

  const actualizar = () => {
    framePending = false;
    // desdeElTope: .puerta-rail es hermano posterior a .escena__sticky, no su
    // contenedor, asi que el recorrido es el alto completo del riel.
    const progress = progresoDeRiel(rail, { desdeElTope: true, destino: stage, propiedad: '--puerta-p' });
    if (progress >= 0.999) {
      if (!enFinal) {
        enFinal = true;
        document.dispatchEvent(new CustomEvent('puerta:final'));
      }
    } else if (progress < 0.9) {
      enFinal = false;
    }
  };

  const solicitarActualizacion = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(actualizar);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.style.setProperty('--puerta-p', '1');
    enFinal = true;
    document.dispatchEvent(new CustomEvent('puerta:final'));
  } else {
    window.addEventListener('scroll', solicitarActualizacion, { passive: true });
    window.addEventListener('resize', solicitarActualizacion);
    window.addEventListener('orientationchange', solicitarActualizacion);
    solicitarActualizacion();
  }
}
