const heroTrack = document.querySelector('.hero');
const heroStage = document.querySelector('.hero__stage');
const questionUi = document.querySelector('.hero__question-ui');
const panel = document.querySelector('.acertijo-panel');
const introRail = document.querySelector('.acertijo-panel-rail--intro');
const entryRail = document.querySelector('.acertijo-panel-rail--entrada');
const exitRail = document.querySelector('.acertijo-panel-rail--salida');
const quizRail = document.querySelector('.acertijo-panel-rail--quiz');
const skipLink = document.querySelector('.hero__skip');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroTrack) {
  let puzzleStarted = false;
  let puzzleComplete = false;
  let currentState = 'intro';
  let framePending = false;
  let panelProgress = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const progresoDeRiel = (rail, {
    inicio = 0,
    fin = 1,
    destino,
    propiedad,
  } = {}) => {
    const rect = rail?.getBoundingClientRect();
    const range = rect ? rect.height - window.innerHeight : 0;
    const progresoDelRiel = rect && range > 0 ? -rect.top / range : 0;
    const tramo = fin - inicio;
    const progreso = tramo > 0 ? (progresoDelRiel - inicio) / tramo : 0;
    const resultado = clamp(progreso);

    if (destino && propiedad) {
      destino.style.setProperty(propiedad, String(resultado));
    }

    return resultado;
  };

  const setSceneState = (state) => {
    if (state === currentState) return;
    currentState = state;
    heroStage?.setAttribute('data-estado', state);
    document.dispatchEvent(new CustomEvent('intro:estado', { detail: { estado: state } }));
  };

  const setProgress = (progress) => {
    const entryProgress = progresoDeRiel(entryRail);
    const exitProgress = puzzleComplete ? progresoDeRiel(exitRail) : 0;
    const quizProgress = puzzleComplete && exitProgress >= 1
      ? progresoDeRiel(quizRail, { destino: heroStage, propiedad: '--quiz-p' })
      : 0;
    panelProgress = entryProgress * 0.5 + exitProgress * 0.5;
    const effectivePanelProgress = panelProgress;
    if (skipLink) {
      skipLink.dataset.panelActive = String(puzzleStarted && effectivePanelProgress < 1);
    }
    document.body.style.setProperty('--intro-progress', String(progress));
    document.body.style.setProperty('--panel-progress', String(effectivePanelProgress));
    if (!puzzleComplete || exitProgress < 1) {
      heroStage?.style.setProperty('--quiz-p', String(quizProgress));
    }

    if (puzzleStarted) {
      if (puzzleComplete && exitProgress <= 0.001) {
        setSceneState('intro');
      } else if (puzzleComplete && exitProgress > 0.001) {
        setSceneState('pregunta');
      }
      const controlsVisible = currentState === 'pregunta' && quizProgress > 0.001;
      if (questionUi) {
        questionUi.inert = !controlsVisible;
        questionUi.setAttribute('aria-hidden', String(!controlsVisible));
        questionUi.dataset.quizVisible = String(controlsVisible);

        const optionStarts = [0.30, 0.42, 0.54, 0.66];
        questionUi.querySelectorAll('.hero__option').forEach((option, index) => {
          option.dataset.quizActive = String(controlsVisible && quizProgress >= (optionStarts[index] ?? 1));
        });
        const continueButton = questionUi.querySelector('.hero__continue');
        if (continueButton) {
          continueButton.dataset.quizActive = String(controlsVisible && quizProgress >= 0.8);
        }
      }
      if (skipLink) {
        skipLink.dataset.quizActive = String(currentState === 'pregunta' && quizProgress >= 0.84);
      }
    }
  };

  const updateProgress = () => {
    framePending = false;
    setProgress(progresoDeRiel(introRail));
  };

  const requestProgressUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateProgress);
  };

  const enableEntryRail = (targetProgress) => {
    entryRail?.style.setProperty('--panel-entry-rail-height', '200svh');
    window.requestAnimationFrame(() => {
      if (targetProgress !== null) {
        const rect = entryRail?.getBoundingClientRect();
        const scrollRange = (rect?.height ?? 0) - window.innerHeight;
        const targetScroll = window.scrollY + (rect?.top ?? 0) + targetProgress * scrollRange;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
      requestProgressUpdate();
    });
  };

  document.addEventListener('acertijo:iniciado', () => {
    if (puzzleStarted) return;
    puzzleStarted = true;
    panel?.setAttribute('aria-hidden', 'false');
    // Sticky (100svh) + riel de entrada (200svh), sin espacio posterior.
    enableEntryRail(1);
  });

  document.addEventListener('acertijo:completado', () => {
    if (puzzleComplete) return;
    puzzleComplete = true;
    // Se agrega únicamente el riel de salida al completar la compuerta.
    exitRail?.style.setProperty('--panel-exit-rail-height', '200svh');
    quizRail?.style.setProperty('--quiz-rail-height', '400svh');
    // El cambio ocurre detrás del panel, en su máxima cobertura.
    setSceneState('pregunta');
  });

  if (reducedMotion.matches) {
    setProgress(1);
  } else {
    window.addEventListener('scroll', requestProgressUpdate, { passive: true });
    window.addEventListener('resize', requestProgressUpdate);
    window.addEventListener('orientationchange', requestProgressUpdate);
    updateProgress();
  }
}
