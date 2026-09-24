const cortina = document.querySelector('.pase-puerta');
const ofertas = document.querySelector('.ofertas');

// Se arma solo si el popup realmente se abrio. Si yaAparecio corto la
// apertura, tampoco va a haber cierre, y el usuario baja scrolleando normal.
document.addEventListener('popup:abierto', () => {
  if (!cortina) return;
  cortina.dataset.activa = 'true';
});

document.addEventListener('popup:cerrado', () => {
  if (!cortina || !ofertas || cortina.dataset.activa !== 'true') return;
  const top = window.scrollY + ofertas.getBoundingClientRect().top;
  window.scrollTo({ top, behavior: 'auto' });
  // Dos frames: el primero aplica el salto, el segundo le da a la transicion
  // un estado inicial del que partir.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      delete cortina.dataset.activa;
    });
  });
});
