const opciones = [
  { label: 'SANDÍA', correcta: false },
  { label: 'PIÑA', correcta: false },
  { label: 'CALABAZA', correcta: false },
  { label: 'MELÓN', correcta: true }
];

const hero = document.querySelector('.hero');
const riddle = document.querySelector('.hero__riddle');
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
    puzzlePanel?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('acertijo-is-open');
    stage?.setAttribute('data-estado', 'pregunta');
    questionUi?.removeAttribute('inert');
    questionUi?.setAttribute('aria-hidden', 'false');
    startButton?.setAttribute('inert', '');
    startButton?.setAttribute('aria-hidden', 'true');
    if (riddle) riddle.textContent = 'SE ACABARON LAS PREGUNTAS. ¿CUÁL ES?';
  });

  continueButton.addEventListener('click', () => {
    if (selected < 0) return;
    // Punto de enganche para las pantallas de resultado, todavía inexistentes.
    document.dispatchEvent(new CustomEvent('pregunta:respondida', {
      detail: { acierto: opciones[selected].correcta }
    }));
  });
}
