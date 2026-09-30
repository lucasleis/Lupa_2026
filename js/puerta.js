import { progresoDeRiel, habilitarRiel } from './intro-scroll.js';

const section = document.querySelector('.puerta');
const stage = section?.querySelector('.puerta__stage');
const rail = section?.querySelector('.puerta-rail');
const interior = document.querySelector('.interior');
const cortina = document.querySelector('.pase-puerta');

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
    const interiorTop = interior && window.scrollY + interior.getBoundingClientRect().top;
    const enInterior = interior && window.scrollY >= interiorTop && window.scrollY < interiorTop + interior.offsetHeight;
    if (progress < 0.9 || enInterior) delete document.body.dataset.puertaRevelada;
    if (!document.body.dataset.puertaRevelada) document.body.style.setProperty('--puerta-progress', String(progress));
    if (progress < 0.999 || (interior && window.scrollY < interiorTop + interior.offsetHeight)) cortina?.setAttribute('data-entrada', 'true');
    else delete cortina?.dataset.entrada;
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
    document.body.style.setProperty('--puerta-progress', '1');
    document.querySelector('.pase-puerta')?.setAttribute('data-entrada', 'true');
    enFinal = true;
    document.dispatchEvent(new CustomEvent('puerta:final'));
  } else {
    window.lenis.on('scroll', actualizar);
    window.addEventListener('resize', solicitarActualizacion);
    window.addEventListener('orientationchange', solicitarActualizacion);
    solicitarActualizacion();
  }
}
