export const inicializarCarrusel = (root, {
  cantidad,
  circular = true,
  clones = 1,
  onChange = () => {},
  onTransitionEnd = () => {},
} = {}) => {
  const track = root?.querySelector('.carrusel__track');
  const dots = root?.querySelector('.carrusel__dots');
  const previous = root?.querySelector('.carrusel__arrow--prev');
  const next = root?.querySelector('.carrusel__arrow--next');
  if (!track || !cantidad) return;

  const viewport = root.querySelector('.carrusel__viewport');
  const desktopCoupons = root.classList.contains('cupones') ? window.matchMedia('(min-width: 900px)') : null;
  let current = circular ? clones : 0;
  let transitioning = false;
  const slides = [...track.children];
  const realSlides = slides.slice(0, cantidad);

  if (circular) {
    const marcarClon = (slide) => {
      slide.dataset.carruselClon = 'true';
      slide.setAttribute('aria-hidden', 'true');
      slide.inert = true;
      return slide;
    };
    track.prepend(...realSlides.slice(-clones).map((slide) => marcarClon(slide.cloneNode(true))));
    track.append(...realSlides.slice(0, clones).map((slide) => marcarClon(slide.cloneNode(true))));
  }

  const indiceReal = () => circular ? (current - clones + cantidad) % cantidad : current;

  const actualizarEstado = () => {
    track.style.setProperty('--carrusel-index', String(current));
    const desktop = desktopCoupons?.matches;
    track.querySelectorAll('.carrusel__slide').forEach((slide, index) => {
      const active = !slide.hasAttribute('data-carrusel-clon') && (desktop
        ? index >= current && index < current + 4
        : circular ? index === current : index === current);
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots?.querySelectorAll('[role="tab"]').forEach((dot, index) => {
      dot.setAttribute('aria-selected', String(index === indiceReal()));
    });
    onChange(indiceReal());
  };

  const reajustarClon = () => {
    if (current < clones) current += cantidad;
    if (current >= cantidad + clones) current -= cantidad;
    track.classList.add('carrusel__track--sin-transicion');
    actualizarEstado();
    window.requestAnimationFrame(() => {
      track.classList.remove('carrusel__track--sin-transicion');
      transitioning = false;
    });
  };

  const irA = (index) => {
    if (transitioning) return;
    const target = circular ? index : Math.max(0, Math.min(cantidad - 1, index));
    if (target === current) return;
    transitioning = true;
    current = target;
    actualizarEstado();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && circular) reajustarClon();
  };

  if (dots) dots.innerHTML = realSlides.map((slide, index) => `<button type="button" role="tab" aria-label="Ir al elemento ${index + 1}" aria-selected="${index === 0}"></button>`).join('');
  previous?.addEventListener('click', () => irA(current - 1));
  next?.addEventListener('click', () => irA(current + 1));
  dots?.querySelectorAll('[role="tab"]').forEach((dot, index) => dot.addEventListener('click', () => irA(circular ? index + clones : index)));
  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform' || !transitioning) return;
    if (circular && (current < clones || current >= cantidad + clones)) reajustarClon();
    else {
      transitioning = false;
      onTransitionEnd(indiceReal());
    }
  });

  let startX = 0;
  let startY = 0;
  let axis = null;
  let startTime = 0;
  viewport.addEventListener('touchstart', (event) => {
    if (desktopCoupons?.matches) return;
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = performance.now();
    axis = null;
  }, { passive: true });
  viewport.addEventListener('touchmove', (event) => {
    if (desktopCoupons?.matches) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 10) axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    if (axis === 'horizontal') event.preventDefault();
  }, { passive: false });
  viewport.addEventListener('touchend', (event) => {
    if (desktopCoupons?.matches) return;
    if (axis !== 'horizontal') return;
    const dx = event.changedTouches[0].clientX - startX;
    const elapsed = performance.now() - startTime;
    if (Math.abs(dx) > viewport.getBoundingClientRect().width * 0.25 || Math.abs(dx) / Math.max(elapsed, 1) > 0.5) irA(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  desktopCoupons?.addEventListener('change', actualizarEstado);
  actualizarEstado();
};
