const cortina = document.querySelector('.pase-puerta');
const ofertas = document.querySelector('.ofertas');
const popup = document.querySelector('.popup');

let armada = false;
// Enfriamiento: el pase puede repetirse, pero no dos veces seguidas al toque.
// Es defensa contra un re-disparo en rafaga desde el origen, que al tomar el
// lock de scroll dejaria la pagina encerrada.
const ENFRIAMIENTO = 1200;
let ultimoPase = 0;

const revelar = () => {
  if (!cortina || !ofertas || !armada) return;
  armada = false;
  // El alto del riel es lo que la seccion mide de mas sobre el viewport.
  // 0.35 va apareado con el --escena-entrada-tramo de .ofertas (0.30): aterriza
  // apenas pasado el final del fade, con la seccion ya visible. Si .ofertas se
  // queda sin riel, riel vale 0 y esto se comporta como antes.
  const riel = Math.max(0, ofertas.offsetHeight - window.innerHeight);
  const top = window.scrollY + ofertas.getBoundingClientRect().top + riel * 0.35;
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
  if (Date.now() - ultimoPase < ENFRIAMIENTO) return;
  ultimoPase = Date.now();
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
