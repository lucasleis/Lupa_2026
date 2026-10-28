// Marca <html data-scrolling> mientras hay scroll y la quita 180ms después del
// último evento. El CSS la usa para promover a capa propia los
// elementos que ESCALAN con el scroll solo mientras se mueven: en reposo
// Chrome los vuelve a rasterizar a la escala real y quedan nítidos (con
// will-change fijo, el zoom x4 de la pirámide se ve borroso).
const root = document.documentElement;
let timer = 0;

const alTerminar = () => {
  // Durante un viaje programático los eventos llegan espaciados y la marca se prendía y apagaba, promoviendo y despromoviendo capas.
  if (window.lenis?.isScrolling) {
    timer = setTimeout(alTerminar, 180);
    return;
  }
  delete root.dataset.scrolling;
};

window.addEventListener('scroll', () => {
  if (!root.dataset.scrolling) root.dataset.scrolling = 'true';
  clearTimeout(timer);
  timer = setTimeout(alTerminar, 180);
}, { passive: true });
