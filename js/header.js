const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
const closeButton = menu.querySelector('.site-menu__close');
const links = [...menu.querySelectorAll('a[href^="#"]')];
const pageContent = [document.querySelector('main'), document.querySelector('footer')];
let abierto = false;

const cerrar = () => {
  if (!abierto) return;
  abierto = false;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
  menu.setAttribute('aria-hidden', 'true');
  menu.inert = true;
  pageContent.forEach((element) => { element.inert = false; });
  window.lenis.start();
  toggle.focus({ preventScroll: true });
};

toggle.addEventListener('click', () => {
  if (abierto) {
    cerrar();
    return;
  }
  abierto = true;
  window.lenis.stop();
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Cerrar menú');
  menu.setAttribute('aria-hidden', 'false');
  menu.inert = false;
  pageContent.forEach((element) => { element.inert = true; });
  links[0].focus({ preventScroll: true });
});

closeButton.addEventListener('click', cerrar);
menu.addEventListener('click', (event) => {
  if (event.target.closest('a[href^="#"]')) cerrar();
});
menu.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const focusables = [closeButton, ...links];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === focusables[0]) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    focusables[0].focus();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') cerrar();
});

const header = document.querySelector('.site-header');
const esMobile = window.matchMedia('(max-width: 899px)');
window.lenis.on('scroll', ({ scroll, direction }) => {
  if (!esMobile.matches) {
    header.classList.remove('site-header--hidden');
    return;
  }
  header.classList.toggle('site-header--hidden', direction === 1 && scroll > 10);
});
