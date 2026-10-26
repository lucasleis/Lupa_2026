// Controla el suavizado del arrastre propio; ajustar en dispositivo.
export const SUAVIZADO = { lerp: 0.08 };

const lenis = new Lenis({
  smoothWheel: true,
  // Sin variante de reduced motion (decisión de diseño, ver css/base.css): Lenis 1.3 la
  // aplica por defecto y forzaría saltos secos en todo scroll programático.
  respectReducedMotion: false,
  ...SUAVIZADO,
});

// Controla la duración de los scrolls que dispara el código tras una acción del usuario.
export const CAMARA = {
  duration: 1.8,
  easing: (t) => 1 - (1 - t) ** 3,
};

// Anima siempre; quien necesite salto seco pasa { immediate: true } (anclas, pase a ofertas).
export const irA = (top, opciones = {}) => lenis.scrollTo(top, {
  ...CAMARA,
  ...opciones,
});

window.lenis = lenis;

function raf(time) {
  lenis.raf(time);
  window.requestAnimationFrame(raf);
}

window.requestAnimationFrame(raf);

export default lenis;
