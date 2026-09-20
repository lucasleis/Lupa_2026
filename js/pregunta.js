const opciones = [
  { label: 'SANDÍA', correcta: false },
  { label: 'PIÑA', correcta: false },
  { label: 'CALABAZA', correcta: false },
  { label: 'MELÓN', correcta: true }
];

const hero = document.querySelector('.hero');
const startButton = document.querySelector('.hero__start');
const optionsRoot = document.querySelector('.hero__options');
const continueButton = document.querySelector('.hero__continue');
const puzzlePanel = document.querySelector('.acertijo-panel');
const stage = document.querySelector('.hero__stage');
const questionUi = document.querySelector('.hero__question-ui');

if (hero && optionsRoot && continueButton) {
  let selected = -1;

  opciones.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'hero__option';
    button.type = 'button';
    button.setAttribute('role', 'radio');
    button.tabIndex = -1;
    button.dataset.index = String(index);
    button.textContent = option.label;
    button.setAttribute('aria-checked', 'false');
    optionsRoot.append(button);
  });

  const optionButtons = () => [...optionsRoot.querySelectorAll('.hero__option')];

  const selectOption = (index) => {
    selected = index;
    optionButtons().forEach((button, buttonIndex) => {
      const isSelected = buttonIndex === index;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-checked', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    });
    continueButton.disabled = false;
  };

  optionsRoot.addEventListener('click', (event) => {
    const option = event.target.closest('.hero__option');
    if (option) selectOption(Number(option.dataset.index));
  });

  optionsRoot.addEventListener('keydown', (event) => {
    const option = event.target.closest('.hero__option');
    if (!option) return;
    const current = Number(option.dataset.index);
    let next = current;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % opciones.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current - 1 + opciones.length) % opciones.length;
    if (next !== current) {
      event.preventDefault();
      selectOption(next);
      optionButtons()[next].focus();
    }
  });

  document.addEventListener('acertijo:completado', () => {
    // La transición visual reversible la gobierna intro-scroll según el progreso.
  });

  document.addEventListener('intro:estado', (event) => {
    const isQuestion = event.detail.estado === 'pregunta';
    if (isQuestion) {
      questionUi?.removeAttribute('inert');
      questionUi?.setAttribute('aria-hidden', 'false');
      startButton?.setAttribute('inert', '');
      startButton?.setAttribute('aria-hidden', 'true');
    } else {
      questionUi?.setAttribute('inert', '');
      questionUi?.setAttribute('aria-hidden', 'true');
      startButton?.removeAttribute('inert');
      startButton?.removeAttribute('aria-hidden');
    }
  });

  continueButton.addEventListener('click', () => {
    if (selected < 0) return;
    optionsRoot.setAttribute('inert', '');
    continueButton.setAttribute('inert', '');
    document.dispatchEvent(new CustomEvent('pregunta:respondida', {
      detail: { acierto: opciones[selected].correcta }
    }));
  });
}
