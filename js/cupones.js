// Provisional: los cupones llegarán de una fuente todavía no definida.
// El backend deberá devolver el descuento separado en euros y centavos.
const cupones = [
  { euros: '2', centavos: '50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000001' },
  { euros: '1', centavos: '50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000002' },
  { euros: '3', centavos: '', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000003' },
  { euros: '0', centavos: '50', unidad: '€ DTO', imagen: 'img/cupones/producto-ejemplo.png', titulo: 'Producto de ejemplo', detalle: '1 litro', codigo: '000000000004' },
];

const root = document.querySelector('.cupones');
const track = root?.querySelector('.cupones__track');
const dots = root?.querySelector('.cupones__dots');
const previous = root?.querySelector('.cupones__arrow--prev');
const next = root?.querySelector('.cupones__arrow--next');
let current = 1;
let transitioning = false;

const hexagon = (shadow = false) => `<svg class="cupones__hexagon${shadow ? ' cupones__hexagon--shadow' : ''}" viewBox="0 0 131 118" aria-hidden="true"><path d="M120.198 23.7749L127.186 78.7861L72.222 114.173L10.1581 93.6508L3.17059 38.6396L58.1331 3.25324L120.198 23.7749Z" fill="${shadow ? 'var(--color-gold-mid)' : 'var(--color-orange-hex)'}" stroke="${shadow ? 'var(--color-gold-mid)' : 'var(--color-gold)'}" stroke-width="5.9185"/></svg>`;

const renderCoupon = (coupon, index) => `<article class="cupones__slide" role="group" aria-roledescription="slide" aria-label="Cupón ${index + 1} de ${cupones.length}">
  <!-- Decisión de diseño: el SVG ya está orientado; se ignora el rect rotado del dump. -->
  <img class="cupones__card" src="img/cupones/tarjeta.svg" alt="">
  <div class="cupones__discount">${hexagon(true)}${hexagon()}<div class="cupones__price" aria-label="${coupon.euros}${coupon.centavos ? `,${coupon.centavos}` : ''} € de descuento"><span class="cupones__price-euros" aria-hidden="true">${coupon.euros}${coupon.centavos ? ',' : ''}</span>${coupon.centavos ? `<span class="cupones__price-resto" aria-hidden="true"><span class="cupones__price-centavos">${coupon.centavos}</span><span class="cupones__price-dto">${coupon.unidad}</span></span>` : ''}</div></div>
  <img class="cupones__product" src="${coupon.imagen}" alt="">
  <h3 class="cupones__product-title">${coupon.titulo}</h3>
  <p class="cupones__detail">${coupon.detalle}</p>
  <!-- Provisional: asset del código de barras pendiente. -->
  <div class="cupones__barcode" aria-label="Código ${coupon.codigo}"><span></span></div>
  <!-- Provisional: glifos del marco inferior pendientes. -->
  <div class="cupones__glyphs" aria-hidden="true"></div>
</article>`;

const indiceReal = () => (current - 1 + cupones.length) % cupones.length;

const actualizarEstado = () => {
  if (!track) return;
  track.style.setProperty('--cupon-index', String(current));
  track.querySelectorAll('.cupones__slide').forEach((slide, index) => {
    const active = index === current && index > 0 && index <= cupones.length;
    slide.inert = !active;
    slide.setAttribute('aria-hidden', String(!active));
  });
  dots?.querySelectorAll('[role="tab"]').forEach((dot, index) => dot.setAttribute('aria-selected', String(index === indiceReal())));
};

const reajustarClon = () => {
  if (current === 0) current = cupones.length;
  if (current === cupones.length + 1) current = 1;
  track?.classList.add('cupones__track--sin-transicion');
  actualizarEstado();
  window.requestAnimationFrame(() => {
    track?.classList.remove('cupones__track--sin-transicion');
    transitioning = false;
  });
};

const irA = (index) => {
  if (!track || transitioning) return;
  const target = index < 1 ? 0 : index > cupones.length ? cupones.length + 1 : index;
  if (target === current) return;
  transitioning = true;
  current = target;
  actualizarEstado();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reajustarClon();
  }
};

if (root && track && dots) {
  const ultimo = renderCoupon(cupones[cupones.length - 1], cupones.length - 1).replace('<article ', '<article inert aria-hidden="true" ');
  const primero = renderCoupon(cupones[0], 0).replace('<article ', '<article inert aria-hidden="true" ');
  track.innerHTML = `${ultimo}${cupones.map(renderCoupon).join('')}${primero}`;
  dots.innerHTML = cupones.map((coupon, index) => `<button type="button" role="tab" aria-label="Ir al cupón ${index + 1}" aria-selected="${index === 0}"></button>`).join('');
  previous?.addEventListener('click', () => irA(current - 1));
  next?.addEventListener('click', () => irA(current + 1));
  dots.querySelectorAll('[role="tab"]').forEach((dot, index) => dot.addEventListener('click', () => irA(index + 1)));
  track.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'transform' || !transitioning) return;
    if (current === 0 || current === cupones.length + 1) {
      reajustarClon();
    } else {
      transitioning = false;
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
    if (Math.abs(dx) > 70 || Math.abs(dx) / Math.max(elapsed, 1) > 0.5) irA(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  actualizarEstado();
}
