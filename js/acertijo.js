const acertijoData = [
  {
    question: '¿Cabe en una mano?',
    answer: 'Ni de lejos. Hacen falta las dos y apretar.'
  },
  {
    question: '¿Cabe en una mano?',
    answer: 'Texto pendiente.'
  },
  {
    question: '¿Cabe en una mano?',
    answer: 'Texto pendiente.'
  }
];

const panel = document.querySelector('.acertijo-panel');
const questionsRoot = panel?.querySelector('.acertijo-panel__questions');
const startButton = document.querySelector('.hero__start');

if (panel && questionsRoot) {
  const opened = new Set();

  acertijoData.forEach((item, index) => {
    const answerId = `acertijo-respuesta-${index + 1}`;
    const question = document.createElement('article');
    question.className = 'acertijo-question';
    question.innerHTML = `
      <h2 class="acertijo-question__title">${item.question}</h2>
      <div class="acertijo-scroll" data-index="${index}">
        <picture>
          <source media="(min-width: 900px)" srcset="img/acertijo/papiro-abierto-desktop.svg" width="628" height="144">
          <img class="acertijo-scroll__open" src="img/acertijo/pergamino-abierto.webp" alt="" width="677" height="471">
        </picture>
        <p class="acertijo-scroll__answer" id="${answerId}">${item.answer}</p>
        <button class="acertijo-scroll__closed" type="button" aria-expanded="false" aria-controls="${answerId}" aria-label="Abrir pergamino ${index + 1}">
          <img src="img/acertijo/pergamino-cerrado.webp" alt="" width="177" height="406">
        </button>
      </div>
    `;
    questionsRoot.append(question);
  });

  questionsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('.acertijo-scroll__closed');
    if (!button) return;

    const scroll = button.closest('.acertijo-scroll');
    const index = Number(scroll.dataset.index);
    if (opened.has(index)) return;

    opened.add(index);
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', `Pergamino ${index + 1} abierto`);
    scroll.classList.add('is-open');

    if (opened.size === acertijoData.length) {
      // Punto de enganche para la transición a la pantalla de la esfinge.
      window.setTimeout(() => {
        document.dispatchEvent(new CustomEvent('acertijo:completado'));
      }, 250);
    }
  });
}

startButton?.addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('acertijo:iniciado'));
});
