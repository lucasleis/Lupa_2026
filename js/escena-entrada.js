import { progresoDeRiel } from './intro-scroll.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('.escena[data-entrada]').forEach((section) => {
  const stage = section.querySelector('.escena__stage');
  const rail = section.querySelector('.escena-rail');
  if (!stage || !rail) return;

  const stagePanel = stage.closest('.escena__panel');
  const couponsPanel = section.querySelector('.cupones__stage')?.closest('.escena__panel');
  const setCouponsOpen = (open) => {
    // No todas las escenas data-entrada tienen paneles; sin esta guarda el throw aborta el forEach para las siguientes.
    if (!stagePanel || !couponsPanel) return;
    section.dataset.cupones = String(open);
    stagePanel.inert = open;
    stagePanel.setAttribute('aria-hidden', String(open));
    couponsPanel.inert = !open;
    couponsPanel.setAttribute('aria-hidden', String(!open));
  };
  section.querySelector('.prueba-superada__cupones')?.addEventListener('click', () => setCouponsOpen(true));
  section.querySelector('.cupones__back')?.addEventListener('click', () => setCouponsOpen(false));
  document.querySelector('.site-menu a[href="#cupones"]')?.addEventListener('click', () => setCouponsOpen(true));
  if (section.classList.contains('prueba-superada') && stagePanel && couponsPanel) {
    // Va en stagePanel para no competir con el swipe propio de couponsPanel.
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let axis = null;
    stagePanel.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = performance.now();
      axis = null;
    }, { passive: true });
    stagePanel.addEventListener('touchmove', (event) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 10) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }
    }, { passive: true });
    stagePanel.addEventListener('touchend', (event) => {
      if (section.dataset.cupones === 'true' || axis !== 'horizontal') return;
      const dx = event.changedTouches[0].clientX - startX;
      const elapsed = performance.now() - startTime;
      if (dx < 0 && (Math.abs(dx) > stagePanel.getBoundingClientRect().width * 0.25
        || Math.abs(dx) / Math.max(elapsed, 1) > 0.5)) setCouponsOpen(true);
    }, { passive: true });
  }
  setCouponsOpen(false);

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
      document.body.dataset.salaSaliendo = String(p > 0);
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

  window.lenis.on('scroll', actualizar);
  window.addEventListener('resize', solicitarActualizacion);
  window.addEventListener('orientationchange', solicitarActualizacion);
  solicitarActualizacion();
});
