const heroTrack = document.querySelector('.hero');
const heroStage = document.querySelector('.hero__stage');
const questionUi = document.querySelector('.hero__question-ui');
const panel = document.querySelector('.acertijo-panel');
const introRail = document.querySelector('.acertijo-panel-rail--intro');
const entryRail = document.querySelector('.acertijo-panel-rail--entrada');
const exitRail = document.querySelector('.acertijo-panel-rail--salida');
const quizRail = document.querySelector('.acertijo-panel-rail--quiz');
const resultRail = document.querySelector('.acertijo-panel-rail--resultado');
const pyramidRail = document.querySelector('.acertijo-panel-rail--piramide');
const skipLink = document.querySelector('.hero__skip');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroTrack) {
  let puzzleStarted = false;
  let puzzleComplete = false;
  let currentState = 'intro';
  let framePending = false;
  let panelProgress = 0;
  let answerSubmitted = false;
  let pyramidRailEnabled = false;

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
      const resultExitProgress = answerSubmitted
        ? progresoDeRiel(resultRail, { inicio: 0, fin: 0.5 })
        : 0;
      const resultProgress = answerSubmitted ? progresoDeRiel(resultRail) : 0;
      const resultEntryProgress = answerSubmitted
        ? progresoDeRiel(resultRail, { inicio: 0.5, fin: 1 })
        : 0;
      const quizExitProgress = 1 - resultExitProgress;
      heroStage?.style.setProperty('--resultado-salida-p', String(resultExitProgress));
      heroStage?.style.setProperty('--resultado-entrada-p', String(resultEntryProgress));

      if (answerSubmitted && resultProgress >= 0.999 && !pyramidRailEnabled) {
        pyramidRailEnabled = true;
        pyramidRail?.style.setProperty('--piramide-rail-height', '200svh');
      }

      if (questionUi) {
        questionUi.inert = !controlsVisible;
        questionUi.setAttribute('aria-hidden', String(!controlsVisible));
        questionUi.dataset.quizVisible = String(controlsVisible);

        const optionStarts = [0.30, 0.42, 0.54, 0.66];
        questionUi.querySelectorAll('.hero__option').forEach((option, index) => {
          option.dataset.quizActive = String(
            controlsVisible && (answerSubmitted
              ? quizExitProgress >= (optionStarts[index] ?? 1)
              : quizProgress >= (optionStarts[index] ?? 1))
          );
        });
        const continueButton = questionUi.querySelector('.hero__continue');
        if (continueButton) {
          continueButton.dataset.quizActive = String(
            controlsVisible && (answerSubmitted ? quizExitProgress >= 0.8 : quizProgress >= 0.8)
          );
        }
        questionUi.querySelectorAll('.hero__result').forEach((result) => {
          result.dataset.resultadoActive = String(answerSubmitted && controlsVisible && resultEntryProgress > 0);
          result.setAttribute('aria-hidden', String(
            !(answerSubmitted && controlsVisible && resultEntryProgress > 0)
          ));
        });
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

  const habilitarRielYDesplazar = (rail, {
    propiedad,
    altura,
    progreso = 1,
  }) => {
    rail?.style.setProperty(propiedad, altura);
    window.requestAnimationFrame(() => {
      if (progreso !== null) {
        const rect = rail?.getBoundingClientRect();
        const scrollRange = (rect?.height ?? 0) - window.innerHeight;
        const targetScroll = window.scrollY + (rect?.top ?? 0) + progreso * scrollRange;
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
    habilitarRielYDesplazar(entryRail, {
      propiedad: '--panel-entry-rail-height',
      altura: '200svh',
    });
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

  document.addEventListener('pregunta:respondida', (event) => {
    if (answerSubmitted) return;
    answerSubmitted = true;
    heroStage?.setAttribute('data-respondido', 'true');
    heroStage?.setAttribute('data-resultado', event.detail.acierto ? 'acierto' : 'error');
    habilitarRielYDesplazar(resultRail, {
      propiedad: '--resultado-rail-height',
      altura: '200svh',
    });
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
