(function () {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');

  if (!toggle || !menu) return;

  const setMenuState = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    menu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('menu-is-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    setMenuState(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
      toggle.focus();
    }
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuState(false);
  });
})();
