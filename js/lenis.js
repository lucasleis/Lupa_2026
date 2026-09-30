const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Controla el suavizado del arrastre propio; ajustar en dispositivo.
export const SUAVIZADO = { lerp: 0.08 };

const lenis = new Lenis({
  smoothWheel: !reducedMotion.matches,
  ...SUAVIZADO,
});

// Controla la duración de los scrolls que dispara el código tras una acción del usuario.
export const CAMARA = {
  duration: 1.8,
  easing: (t) => 1 - (1 - t) ** 3,
};

export const irA = (top, opciones = {}) => lenis.scrollTo(top, {
  ...CAMARA,
  ...opciones,
  ...(reducedMotion.matches ? { immediate: true } : {}),
});

window.lenis = lenis;

function raf(time) {
  lenis.raf(time);
  window.requestAnimationFrame(raf);
}

window.requestAnimationFrame(raf);

export default lenis;
