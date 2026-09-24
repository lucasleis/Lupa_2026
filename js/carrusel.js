export const inicializarCarrusel = (root, {
  cantidad,
  circular = true,
  onChange = () => {},
  onTransitionEnd = () => {},
} = {}) => {
  const track = root?.querySelector('.carrusel__track');
  const dots = root?.querySelector('.carrusel__dots');
  const previous = root?.querySelector('.carrusel__arrow--prev');
  const next = root?.querySelector('.carrusel__arrow--next');
  if (!track || !cantidad) return;

  let current = circular ? 1 : 0;
  let transitioning = false;
  const slides = [...track.children];
  const realSlides = slides.slice(0, cantidad);
  const viewport = root.querySelector('.carrusel__viewport');

  if (circular) {
    const last = realSlides[realSlides.length - 1].cloneNode(true);
    const first = realSlides[0].cloneNode(true);
    last.setAttribute('aria-hidden', 'true');
    last.inert = true;
    first.setAttribute('aria-hidden', 'true');
    first.inert = true;
    track.prepend(last);
    track.append(first);
  }

  const indiceReal = () => circular
    ? (current - 1 + cantidad) % cantidad
    : current;

  const actualizarEstado = () => {
    track.style.setProperty('--carrusel-index', String(current));
    track.querySelectorAll('.carrusel__slide').forEach((slide, index) => {
      const active = circular
        ? index === current && index > 0 && index <= cantidad
        : index === current;
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots?.querySelectorAll('[role="tab"]').forEach((dot, index) => {
      dot.setAttribute('aria-selected', String(index === indiceReal()));
    });
    onChange(indiceReal());
  };

  const reajustarClon = () => {
    if (current === 0) current = cantidad;
    if (current === cantidad + 1) current = 1;
    track.classList.add('carrusel__track--sin-transicion');
    actualizarEstado();
    window.requestAnimationFrame(() => {
      track.classList.remove('carrusel__track--sin-transicion');
      transitioning = false;
    });
  };

  const irA = (index) => {
    if (transitioning) return;
    const target = circular
      ? (index < 1 ? 0 : index > cantidad ? cantidad + 1 : index)
      : Math.max(0, Math.min(cantidad - 1, index));
    if (target === current) return;
    transitioning = true;
    current = target;
    actualizarEstado();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && circular) reajustarClon();
  };

  if (dots) dots.innerHTML = realSlides.map((slide, index) => `<button type="button" role="tab" aria-label="Ir al elemento ${index + 1}" aria-selected="${index === 0}"></button>`).join('');
  previous?.addEventListener('click', () => irA(current - 1));
  next?.addEventListener('click', () => irA(current + 1));
  dots?.querySelectorAll('[role="tab"]').forEach((dot, index) => dot.addEventListener('click', () => irA(circular ? index + 1 : index)));
  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform' || !transitioning) return;
    if (circular && (current === 0 || current === cantidad + 1)) reajustarClon();
    else {
      transitioning = false;
      onTransitionEnd(indiceReal());
    }
  });

  let startX = 0;
  let startY = 0;
  let axis = null;
  let startTime = 0;
  track.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = performance.now();
    axis = null;
  }, { passive: true });
  track.addEventListener('touchmove', (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) >= 10) axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    if (axis === 'horizontal') event.preventDefault();
  }, { passive: false });
  track.addEventListener('touchend', (event) => {
    if (axis !== 'horizontal') return;
    const dx = event.changedTouches[0].clientX - startX;
    const elapsed = performance.now() - startTime;
    if (Math.abs(dx) > viewport.getBoundingClientRect().width * 0.25 || Math.abs(dx) / Math.max(elapsed, 1) > 0.5) irA(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  actualizarEstado();
};
