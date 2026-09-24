const cortina = document.querySelector('.pase-puerta');
const ofertas = document.querySelector('.ofertas');
const popup = document.querySelector('.popup');

let armada = false;

const revelar = () => {
  if (!cortina || !ofertas || !armada) return;
  armada = false;
  const top = window.scrollY + ofertas.getBoundingClientRect().top;
  document.documentElement.style.overflow = '';
  window.scrollTo({ top, behavior: 'auto' });
  // Dos frames: el primero aplica el salto, el segundo le da a la transicion
  // un estado inicial del que partir.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      delete cortina.dataset.activa;
    });
  });
};

document.addEventListener('puerta:final', () => {
  if (!cortina || armada) return;
  armada = true;
  cortina.dataset.activa = 'true';
  // El popup abre en este mismo evento. Se resuelve en el siguiente
  // macrotask y leyendo el DOM, para no depender del orden en que popup.js
  // y este modulo registraron sus listeners.
  window.setTimeout(() => {
    if (popup?.getAttribute('aria-hidden') === 'false') return;
    // Sin popup no hay lock de scroll: lo toma la cortina, porque saltar el
    // scroll mientras el usuario lo esta empujando pelea con el momentum.
    document.documentElement.style.overflow = 'hidden';
    window.setTimeout(revelar, 200);
  }, 0);
});

document.addEventListener('popup:cerrado', revelar);
