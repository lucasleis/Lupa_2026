export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Sin desdeElTope: riel que contiene a su sticky. Con desdeElTope: riel posterior
// al sticky que mide su recorrido completo.
export const progresoDeRiel = (rail, {
  inicio = 0,
  fin = 1,
  destino,
  propiedad,
  desdeElTope = false,
} = {}) => {
  const rect = rail?.getBoundingClientRect();
  const range = rect ? rect.height - window.innerHeight : 0;
  const progresoDelRiel = desdeElTope
    ? (rect && rect.height > 0 ? (window.innerHeight - rect.top) / rect.height : 0)
    : (rect && range > 0 ? -rect.top / range : 0);
  const tramo = fin - inicio;
  const progreso = tramo > 0 ? (progresoDelRiel - inicio) / tramo : 0;
  const resultado = clamp(progreso);

  if (destino && propiedad) destino.style.setProperty(propiedad, String(resultado));
  return resultado;
};

export const habilitarRiel = (rail, propiedad, altura) => {
  rail?.style.setProperty(propiedad, altura);
};

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
const pyramidScene = document.querySelector('.piramide-escena');
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

  const liberarScroll = () => {
    delete document.body.dataset.introBloqueado;
  };

  // Checkpoints: un riel en 0svh no aporta altura al documento, asi que el
  // scroll hacia adelante se detiene solo y el de vuelta queda libre. Cada
  // riel se habilita al cumplirse su condicion:
  //   EMPEZAR -> entrada | 3 papiros -> salida + quiz
  //   respuesta -> resultado | resultado al 100% -> piramide
  //   puerta al 85% -> se revela el resto de la pagina
  const RAIL_HEIGHTS = {
    entrada: '200svh',
    salida: '200svh',
    quiz: '150svh',
    resultado: '200svh',
    piramide: '400svh',
  };

  if (!reducedMotion.matches) {
    document.body.dataset.introBloqueado = 'true';
  }

  const setSceneState = (state) => {
    if (state === currentState) return;
    currentState = state;
    heroStage?.setAttribute('data-estado', state);
    document.dispatchEvent(new CustomEvent('intro:estado', { detail: { estado: state } }));
  };

  const setProgress = (progress) => {
    // Entry conserva el punto cero antiguo: habilitarRielYDesplazar calcula su smooth-scroll con esa geometría.
    const entryProgress = progresoDeRiel(entryRail);
    const exitProgress = puzzleComplete
      ? progresoDeRiel(exitRail, { desdeElTope: true })
      : 0;
    const quizProgress = puzzleComplete && exitProgress >= 1
      ? progresoDeRiel(quizRail, { desdeElTope: true, destino: heroStage, propiedad: '--quiz-p' })
      : 0;
    const pyramidProgress = pyramidRailEnabled
      ? progresoDeRiel(pyramidRail, { inicio: 0, fin: 0.5, destino: heroStage, propiedad: '--piramide-p' })
      : 0;
    const doorProgress = pyramidRailEnabled
      ? progresoDeRiel(pyramidRail, { inicio: 0.5, fin: 1, destino: heroStage, propiedad: '--puerta-p' })
      : 0;
    // Checkpoint final: se revela el resto de la pagina detras del fundido
    // de la puerta (--puerta-p 0.85 a 1), asi el contenido nuevo aparece con
    // la pantalla ya oscurecida y el scroll no topa con una pared.
    if (doorProgress >= 0.85) liberarScroll();
    panelProgress = entryProgress * 0.5 + exitProgress * 0.5;
    const effectivePanelProgress = panelProgress;
    if (skipLink) {
      skipLink.dataset.panelActive = String(puzzleStarted && effectivePanelProgress < 1);
    }
    document.body.style.setProperty('--intro-progress', String(progress));
    document.body.style.setProperty('--panel-progress', String(effectivePanelProgress));
    panel?.setAttribute('data-progress-state',
      effectivePanelProgress > 0.001 && effectivePanelProgress < 0.999 ? 'activo' : 'reposo');
    if (!puzzleComplete || exitProgress < 1) {
      heroStage?.style.setProperty('--quiz-p', String(quizProgress));
    }

    if (puzzleStarted) {
      if (puzzleComplete && exitProgress <= 0.001) {
        setSceneState('intro');
      } else if (puzzleComplete && exitProgress > 0.001) {
        setSceneState('pregunta');
      }
      const controlsVisible = currentState === 'pregunta'
        && quizProgress > 0.001
        && pyramidProgress <= 0;
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
        habilitarRiel(pyramidRail, '--piramide-rail-height', RAIL_HEIGHTS.piramide);
      }
      if (pyramidScene) {
        pyramidScene.dataset.piramideActive = String(pyramidProgress > 0);
      }

      if (questionUi) {
        questionUi.inert = !controlsVisible;
        questionUi.setAttribute('aria-hidden', String(!controlsVisible));
        questionUi.dataset.quizVisible = String(controlsVisible);

        const optionStarts = [0.30, 0.42, 0.54, 0.66];
        // optionStarts queda SOLO para la salida (orden inverso sobre el riel de
        // resultado). La entrada ya no usa umbrales: las opciones entran juntas y
        // el escalonado lo hace transition-delay en CSS.
        const ENTRADA_CONTROLES = 0.5; // el globo termina de escalar acá
        questionUi.querySelectorAll('.hero__option').forEach((option, index) => {
          option.dataset.quizActive = String(
            controlsVisible && (answerSubmitted
              ? quizExitProgress >= (optionStarts[index] ?? 1)
              : quizProgress >= ENTRADA_CONTROLES)
          );
        });
        const continueButton = questionUi.querySelector('.hero__continue');
        if (continueButton) {
          continueButton.dataset.quizActive = String(
            controlsVisible && (answerSubmitted ? quizExitProgress >= 0.8 : quizProgress >= ENTRADA_CONTROLES)
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
    setProgress(progresoDeRiel(introRail, { desdeElTope: true }));
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
    habilitarRiel(rail, propiedad, altura);
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

  // Sin esto, SALTAR INTRO y el menú hamburguesa apuntan a secciones en display:none y no hacen nada.
  document.addEventListener('click', (event) => {
    if (event.target.closest('.hero__skip, .site-menu a[href^="#"]')) {
      liberarScroll();
    }
  });

  document.addEventListener('acertijo:iniciado', () => {
    if (puzzleStarted) return;
    puzzleStarted = true;
    panel?.setAttribute('aria-hidden', 'false');
    // Sticky (100svh) + riel de entrada (200svh), sin espacio posterior.
    habilitarRielYDesplazar(entryRail, {
      propiedad: '--panel-entry-rail-height',
      altura: RAIL_HEIGHTS.entrada,
    });
  });

  document.addEventListener('acertijo:completado', () => {
    if (puzzleComplete) return;
    puzzleComplete = true;
    // Se agrega únicamente el riel de salida al completar la compuerta.
    habilitarRiel(exitRail, '--panel-exit-rail-height', RAIL_HEIGHTS.salida);
    habilitarRiel(quizRail, '--quiz-rail-height', RAIL_HEIGHTS.quiz);
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
      altura: RAIL_HEIGHTS.resultado,
    });
  });

  const saltarAInicioDeTramo = () => {
    const params = new URLSearchParams(window.location.search);
    const tramo = params.get('saltar');
    const tramos = ['acertijo', 'quiz', 'resultado', 'piramide', 'puerta'];
    if (!tramos.includes(tramo)) return false;
    liberarScroll();

    const respuesta = params.get('rta') === 'error' ? 'error' : 'acierto';
    puzzleStarted = true;
    panel?.setAttribute('aria-hidden', 'false');
    habilitarRiel(entryRail, '--panel-entry-rail-height', RAIL_HEIGHTS.entrada);

    if (tramo === 'acertijo') {
      window.scrollTo({ top: entryRail?.getBoundingClientRect().top + window.scrollY, behavior: 'auto' });
      return true;
    }

    puzzleComplete = true;
    habilitarRiel(exitRail, '--panel-exit-rail-height', RAIL_HEIGHTS.salida);
    habilitarRiel(quizRail, '--quiz-rail-height', RAIL_HEIGHTS.quiz);
    setSceneState('pregunta');

    if (tramo === 'quiz') {
      window.scrollTo({ top: quizRail?.getBoundingClientRect().top + window.scrollY, behavior: 'auto' });
      return true;
    }

    answerSubmitted = true;
    heroStage?.setAttribute('data-respondido', 'true');
    heroStage?.setAttribute('data-resultado', respuesta);
    habilitarRiel(resultRail, '--resultado-rail-height', RAIL_HEIGHTS.resultado);

    if (tramo === 'resultado') {
      window.scrollTo({ top: resultRail?.getBoundingClientRect().top + window.scrollY, behavior: 'auto' });
      return true;
    }

    pyramidRailEnabled = true;
    habilitarRiel(pyramidRail, '--piramide-rail-height', RAIL_HEIGHTS.piramide);
    if (tramo === 'piramide') {
      window.scrollTo({ top: pyramidRail?.getBoundingClientRect().top + window.scrollY, behavior: 'auto' });
      return true;
    }

    const pyramidRect = pyramidRail?.getBoundingClientRect();
    const pyramidScrollRange = (pyramidRect?.height ?? 0) - window.innerHeight;
    const puertaScrollTop = window.scrollY + (pyramidRect?.top ?? 0) + 0.5 * pyramidScrollRange;
    window.scrollTo({ top: puertaScrollTop, behavior: 'auto' });
    return true;
  };

  if (saltarAInicioDeTramo()) {
    requestProgressUpdate();
  }

  if (reducedMotion.matches) {
    setProgress(1);
  } else {
    window.addEventListener('scroll', requestProgressUpdate, { passive: true });
    window.addEventListener('resize', requestProgressUpdate);
    window.addEventListener('orientationchange', requestProgressUpdate);
    updateProgress();
  }
}
