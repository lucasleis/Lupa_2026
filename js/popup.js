const popup = document.querySelector('.popup');
const closeButton = popup?.querySelector('.popup__close');
const focusables = () => [...popup.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')];
let lastFocused = null;
let scrollPosition = 0;
let yaAparecio = false; // Decisión provisional: una aparición por carga; luego podrá pasar a localStorage.

const cerrar = () => {
  if (!popup || popup.getAttribute('aria-hidden') === 'true') return;
  const returnFocus = lastFocused && !popup.contains(lastFocused) ? lastFocused : document.body;
  returnFocus.focus?.({ preventScroll: true });
  popup.classList.remove('popup--visible', 'popup--contenido', 'popup--montado', 'popup--reduced');
  popup.setAttribute('aria-hidden', 'true');
  popup.inert = true;
  document.documentElement.style.overflow = '';
  window.scrollTo(0, scrollPosition);
  document.querySelectorAll('body > *:not(.popup)').forEach((element) => { element.inert = false; });
  document.dispatchEvent(new CustomEvent('popup:cerrado'));
};

const abrir = () => {
  if (!popup || yaAparecio) return;
  yaAparecio = true;
  lastFocused = document.activeElement;
  scrollPosition = window.scrollY;
  document.querySelectorAll('body > *:not(.popup)').forEach((element) => { element.inert = true; });
  document.documentElement.style.overflow = 'hidden';
  popup.inert = false;
  popup.setAttribute('aria-hidden', 'false');
  popup.classList.add('popup--montado');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mostrarContenido = () => {
    popup.classList.add('popup--contenido');
  };
  popup.focus({ preventScroll: true });
  if (reduced) popup.classList.add('popup--reduced');

  // Dos frames entre montar y animar: el primero renderiza el estado inicial
  // (opacity 0, clip-path cerrado, rodillos juntos), el segundo dispara las
  // transiciones. Con una sola clase el navegador no tiene de donde interpolar.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      popup.classList.add('popup--visible');
      if (reduced) {
        mostrarContenido();
      } else {
        // Apareado con --papiro-apertura en css/sections.css (duracion + 250ms).
        // Si se mueve uno, se mueve el otro.
        window.setTimeout(mostrarContenido, 1150);
      }
    });
  });
  document.dispatchEvent(new CustomEvent('popup:abierto'));
};

document.addEventListener('puerta:final', abrir);

popup?.addEventListener('click', (event) => {
  if (event.target === popup) cerrar();
});
closeButton?.addEventListener('click', cerrar);
popup?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    cerrar();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusables();
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (!event.shiftKey && document.activeElement === popup) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === popup) {
    event.preventDefault();
    last.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
