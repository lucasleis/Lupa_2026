// Pegá este archivo en la consola de DevTools de Chrome. frame: es layout normalizado por --ud y se compara con Figma;
// rect: incluye transform. medirReset() limpia estilos inline del stage. Ejemplo: medir({ set: {'--quiz-p': 0.4}, sel: ['.hero__option', '.hero__options'] })
function medir({ set = {}, sel = [] } = {}) {
  const stage = document.querySelector('.hero__stage');
  if (!stage) {
    console.log('medir | NO SE ENCONTRÓ .hero__stage');
    return;
  }

  for (const [property, value] of Object.entries(set)) {
    stage.style.setProperty(property, value);
  }

  console.log('Advertencia: escribir variables CSS no dispara el scroll handler de js/intro-scroll.js.');
  console.log('Advertencia: por eso, data-estado y data-quiz-active no cambian al aplicar set.');

  const probe = document.createElement('div');
  probe.style.cssText = 'all: initial; position: absolute; width: var(--ud); height: 0; padding: 0; border: 0; visibility: hidden;';
  stage.append(probe);
  const ud = Number.parseFloat(getComputedStyle(probe).width);
  probe.remove();
  const divisor = Number.isFinite(ud) && ud !== 0 ? ud : 1;
  const fallbackNote = divisor === 1 && (!Number.isFinite(ud) || ud === 0)
    ? ' | AVISO: --ud no legible o es 0; divisor usado: 1'
    : '';
  console.log(`Contexto | --ud: ${Number.isFinite(ud) ? `${ud.toFixed(2)}px` : 'no legible'} | data-estado: ${stage.getAttribute('data-estado') ?? '-'}${fallbackNote}`);

  for (const selector of sel) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      console.log(`${selector} | NO MATCHEA`);
      continue;
    }

    elements.forEach((element, index) => {
      const label = elements.length > 1 ? `${selector} [${index}]` : selector;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const frame = [element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight]
        .map((value) => (value / divisor).toFixed(2));
      const roundedRect = [rect.x, rect.y, rect.width, rect.height]
        .map((value) => (Math.round(value * 100) / 100).toFixed(2));
      const quizActive = element.getAttribute('data-quiz-active') ?? '-';
      console.log(`${label} | frame: ${frame.join(',')} | matrix: ${style.transform} | rect: ${roundedRect.join(',')} | vis: ${style.visibility} | data-quiz-active: ${quizActive}`);
    });
  }
}

function medirReset() {
  const stage = document.querySelector('.hero__stage');
  if (!stage) {
    console.log('stage limpio');
    return;
  }
  stage.removeAttribute('style');
  console.log('stage limpio');
}
