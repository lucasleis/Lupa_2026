import { progresoDeRiel, habilitarRiel } from './intro-scroll.js';

const section = document.querySelector('.puerta');
const stage = section?.querySelector('.puerta__stage');
const rail = section?.querySelector('.puerta-rail');

if (section && stage && rail) {
  habilitarRiel(rail, '--puerta-rail-height', 'var(--puerta-track)');
  let framePending = false;
  // ponytail: puerta:final no tiene consumidor desde que la cortina pasó
  // a gobernarse con data-en-sala y data-sala-saliendo (c4405b5). Se
  // conserva como enganche para conectar esta pantalla con el interior en
  // escritorio.
  // Si al cerrar ese tramo sigue sin escucharlo nadie, se borra con su
  // histéresis.
  // puerta:final es un FLANCO, no un nivel: sin esto se dispara en cada frame de
  // scroll en que el progreso queda clavado en 1. Se re-arma con histeresis
  // (recien por debajo de 0.9) para que el pase vuelva a ocurrir si el usuario
  // sube y baja de nuevo por la puerta, sin chatter en el borde del umbral.
  let enFinal = false;
  // El umbral sale del CSS, que es su unica fuente: no lo dupliques aca.
  const cruceInicio = parseFloat(
    getComputedStyle(document.body).getPropertyValue('--puerta-cruce-inicio')
  ) || 0.75;
  let cruzando = false;

  const actualizar = () => {
    framePending = false;
    const progress = progresoDeRiel(rail, { desdeElTope: true, destino: stage, propiedad: '--puerta-p' });
    // La capa fija vive fuera de la sección y necesita el progreso en body.
    document.body.style.setProperty('--puerta-p', String(progress));
    if (!cruzando && progress >= cruceInicio) {
      cruzando = true;
      stage.dataset.cruzando = 'true';
    } else if (cruzando && progress < cruceInicio - 0.02) {
      cruzando = false;
      delete stage.dataset.cruzando;
    }
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
    stage.dataset.cruzando = 'true';
    enFinal = true;
    document.dispatchEvent(new CustomEvent('puerta:final'));
  } else {
    window.lenis.on('scroll', actualizar);
    window.addEventListener('resize', solicitarActualizacion);
    window.addEventListener('orientationchange', solicitarActualizacion);
    solicitarActualizacion();
  }
}
