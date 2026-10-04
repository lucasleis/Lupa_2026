import { irA } from './lenis.js';

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Sin desdeElTope: riel que contiene a su sticky. Con desdeElTope: riel posterior
// al sticky que mide su recorrido completo.
// DesdeElTope: p=0 cuando el riel asoma por abajo y p=1 cuando su fondo llega
// al fondo del viewport, el final del scroll disponible. No sumamos
// innerHeight al denominador: los rieles siguientes están en 0svh, así que ese
// scroll adicional no existe.
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
const anuncioRail = document.querySelector('.acertijo-panel-rail--anuncio');
const quizRail = document.querySelector('.acertijo-panel-rail--quiz');
const resultRail = document.querySelector('.acertijo-panel-rail--resultado');
const pyramidRail = document.querySelector('.acertijo-panel-rail--piramide');
const pyramidScene = document.querySelector('.piramide-escena');
const skipLink = document.querySelector('.hero__skip');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroTrack) {
  const panelRailsDesktop = window.matchMedia('(min-width: 900px)');
  const ALTURA_RESULTADO_MOBILE = 350;
  const ALTURA_RESULTADO_DESKTOP = 300;
  const ALTURA_MOVIMIENTO_SALIDA = 200;
  const INICIO_MOVIMIENTO_SALIDA = 0.3;
  const ALTURA_QUIZ_MOBILE = 200;
  const GLOBO_COMPLETO_EN = 0.5;
  const PAUSA_GLOBO_SVH = 50;
  const ENTRADA_CONTROLES_DESKTOP = 0.60; // 150svh en el riel de 250svh.
  const RESULTADO_TRAMOS = { quizSalidaFin: 0.29, resultadoEntradaInicio: 0.29, resultadoEntradaFin: 0.57 };
  const RESULTADO_TRAMOS_DESKTOP = {
    quizSalidaFin: 0.40, // salida: 0-120svh.
    resultadoEntradaInicio: 0.40, // entrada: empieza a 120svh.
    resultadoEntradaFin: 1, // entrada: termina a 300svh.
  };
  const alturaRielPanel = () => panelRailsDesktop.matches ? '0svh' : '200svh';
  const alturaRielSalida = () => panelRailsDesktop.matches
    ? '0svh'
    : `${ALTURA_MOVIMIENTO_SALIDA / (1 - INICIO_MOVIMIENTO_SALIDA)}svh`;
  const alturaRielQuiz = () => panelRailsDesktop.matches ? '250svh' : `${ALTURA_QUIZ_MOBILE}svh`;
  const alturaRielResultado = () => panelRailsDesktop.matches
    ? `${ALTURA_RESULTADO_DESKTOP}svh`
    : `${ALTURA_RESULTADO_MOBILE}svh`;
  const tramosResultado = () => panelRailsDesktop.matches ? RESULTADO_TRAMOS_DESKTOP : RESULTADO_TRAMOS;
  const alturaRielPiramide = () => panelRailsDesktop.matches ? '400svh' : '800svh';
  const entradaControles = () => panelRailsDesktop.matches
    ? ENTRADA_CONTROLES_DESKTOP
    : GLOBO_COMPLETO_EN + PAUSA_GLOBO_SVH / ALTURA_QUIZ_MOBILE;
  let ENTRADA_CONTROLES = entradaControles();

  // La participacion del panel se deriva de sus rieles, no del breakpoint.
  const RAIL_HEIGHTS = {
    entrada: alturaRielPanel(),
    salida: alturaRielSalida(),
    anuncio: '150svh',
    quiz: alturaRielQuiz(),
    resultado: alturaRielResultado(),
    piramide: alturaRielPiramide(),
  };
  const panelEstaEnJuego = () => Number.parseFloat(RAIL_HEIGHTS.entrada) > 0
    || Number.parseFloat(RAIL_HEIGHTS.salida) > 0;
  let panelEnJuego = panelEstaEnJuego();
  let puzzleStarted = !panelEnJuego;
  let puzzleComplete = !panelEnJuego;
  if (!panelEnJuego) {
    habilitarRiel(anuncioRail, '--anuncio-rail-height', RAIL_HEIGHTS.anuncio);
    habilitarRiel(quizRail, '--quiz-rail-height', RAIL_HEIGHTS.quiz);
  }
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
  //   Desktop libera con --piramide-p al 85%; mobile con --puerta-p al 85%.
  //   El riel piramide mide 150svh en desktop y 500svh en mobile. Se revela
  //   el resto de la pagina.
  const recalcularAlturasRielesPanel = () => {
    RAIL_HEIGHTS.entrada = alturaRielPanel();
    RAIL_HEIGHTS.salida = alturaRielSalida();
    RAIL_HEIGHTS.quiz = alturaRielQuiz();
    RAIL_HEIGHTS.resultado = alturaRielResultado();
    RAIL_HEIGHTS.piramide = alturaRielPiramide();
    ENTRADA_CONTROLES = entradaControles();
    panelEnJuego = panelEstaEnJuego();
    puzzleStarted = !panelEnJuego;
    puzzleComplete = !panelEnJuego;
    habilitarRiel(entryRail, '--panel-entry-rail-height', puzzleStarted ? RAIL_HEIGHTS.entrada : '0svh');
    habilitarRiel(exitRail, '--panel-exit-rail-height', puzzleComplete ? RAIL_HEIGHTS.salida : '0svh');
    habilitarRiel(anuncioRail, '--anuncio-rail-height', panelEnJuego ? '0svh' : RAIL_HEIGHTS.anuncio);
    habilitarRiel(quizRail, '--quiz-rail-height', panelEnJuego ? '0svh' : RAIL_HEIGHTS.quiz);
    habilitarRiel(resultRail, '--resultado-rail-height', answerSubmitted ? RAIL_HEIGHTS.resultado : '0svh');
    habilitarRiel(pyramidRail, '--piramide-rail-height', pyramidRailEnabled ? RAIL_HEIGHTS.piramide : '0svh');
    panel?.setAttribute('aria-hidden', 'true');
    setSceneState('intro');
  };

  panelRailsDesktop.addEventListener('change', recalcularAlturasRielesPanel);

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
    const exitRailHeight = exitRail?.getBoundingClientRect().height;
    const exitRailProgress = puzzleComplete
      ? (exitRailHeight === 0 ? 1 : progresoDeRiel(exitRail, { desdeElTope: true }))
      : 0;
    const exitProgress = panelRailsDesktop.matches
      ? exitRailProgress
      : clamp((exitRailProgress - INICIO_MOVIMIENTO_SALIDA) / (1 - INICIO_MOVIMIENTO_SALIDA));
    const anuncioProgress = panelEnJuego
      ? 1
      : progresoDeRiel(anuncioRail, { desdeElTope: true, destino: heroStage, propiedad: '--anuncio-p' });
    const anuncioListo = anuncioProgress >= 0.999;
    const quizProgress = (!panelEnJuego || (puzzleComplete && exitRailProgress >= 1))
      ? progresoDeRiel(quizRail, { desdeElTope: true, destino: heroStage, propiedad: '--quiz-p' })
      : 0;
    // Reparto: acercamiento (--piramide-p), puerta (--puerta-p), apertura y entrada.
    const REPARTO_PIRAMIDE = panelRailsDesktop.matches ? 0.40 : 0.5; // Desktop: acercamiento, 0-160svh.
    // El zoom de la puerta termina acá; el resto del riel es freno, con la
    // escena sostenida en su zoom final antes de que el hero se suelte.
    const FRENO_PIRAMIDE = panelRailsDesktop.matches ? 0.70 : 0.78; // Desktop: puerta, 160-280svh.
    const APERTURA_FIN = panelRailsDesktop.matches ? 0.85 : 0.88; // Desktop: apertura 280-340svh; entrada 340-400svh.
    const pyramidProgress = pyramidRailEnabled
      ? progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: 0, fin: REPARTO_PIRAMIDE, destino: heroStage, propiedad: '--piramide-p' })
      : 0;
    const doorProgress = pyramidRailEnabled
      ? progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: REPARTO_PIRAMIDE, fin: FRENO_PIRAMIDE, destino: heroStage, propiedad: '--puerta-p' })
      : 0;
    // Terminado el zoom, el freno abre las hojas y luego acerca al interior.
    if (pyramidRailEnabled) {
      progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: FRENO_PIRAMIDE, fin: APERTURA_FIN, destino: heroStage, propiedad: '--apertura-p' });
      const entradaProgress = progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: APERTURA_FIN, fin: 1, destino: heroStage, propiedad: '--entrada-p' });
      document.body.dataset.enSala = String(entradaProgress >= 0.999);
    }
    // Checkpoint final: desktop usa --piramide-p y mobile --puerta-p. No hay
    // fundido en .piramide-escena (el de .puerta__fundido usa otro --puerta-p,
    // el de .puerta__stage); el contenido aparece por debajo del viewport y no
    // desplaza nada de lo que se esta mirando.
    if (panelRailsDesktop.matches) {
      if (pyramidProgress >= 0.85) liberarScroll();
    } else if (doorProgress >= 0.85) {
      liberarScroll();
    }
    panelProgress = panelEnJuego ? entryProgress * 0.5 + exitProgress * 0.5 : 1;
    const effectivePanelProgress = panelProgress;
    if (skipLink) {
      skipLink.dataset.panelActive = String(panelEnJuego && puzzleStarted && effectivePanelProgress < 1);
    }
    document.body.style.setProperty('--intro-progress', String(progress));
    document.body.style.setProperty('--panel-progress', String(effectivePanelProgress));
    panel?.setAttribute('data-progress-state',
      effectivePanelProgress > 0.001 && effectivePanelProgress < 0.999 ? 'activo' : 'reposo');
    if (!puzzleComplete || exitProgress < 1) {
      heroStage?.style.setProperty('--quiz-p', String(quizProgress));
    }

    if (puzzleStarted) {
      if (puzzleComplete && (exitRailProgress <= 0.001 || !anuncioListo)) {
        setSceneState('intro');
      } else if (puzzleComplete && exitProgress > 0.001 && anuncioListo) {
        setSceneState('pregunta');
      }
      const controlsVisible = currentState === 'pregunta'
        && quizProgress > 0.001
        // Apareado con la rampa 0.15 de .piramide-escena para que el resultado
        // siga visible mientras la piramide lo tapa progresivamente.
        && pyramidProgress < 0.15;
      const resultadoRielTramos = tramosResultado();
      const resultExitProgress = answerSubmitted
        ? progresoDeRiel(resultRail, { desdeElTope: true, inicio: 0, fin: resultadoRielTramos.quizSalidaFin })
        : 0;
      const resultProgress = answerSubmitted ? progresoDeRiel(resultRail, { desdeElTope: true }) : 0;
      const resultEntryProgress = answerSubmitted
        ? progresoDeRiel(resultRail, { desdeElTope: true, inicio: resultadoRielTramos.resultadoEntradaInicio, fin: resultadoRielTramos.resultadoEntradaFin })
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

        questionUi.querySelectorAll('.hero__option').forEach((option, index) => {
          option.dataset.quizActive = String(
            controlsVisible && (answerSubmitted
              ? quizExitProgress >= 0.999
              : quizProgress >= ENTRADA_CONTROLES)
          );
        });
        const continueButton = questionUi.querySelector('.hero__continue');
        if (continueButton) {
          continueButton.dataset.quizActive = String(
            controlsVisible && (answerSubmitted
              ? quizExitProgress >= 0.999
              : quizProgress >= ENTRADA_CONTROLES)
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

  // Calibrable: 1.8 de CAMARA se siente lento para un click directo.
  const DURACION_SALTO_PANEL = 0.9;
  const habilitarRielYDesplazar = (rail, {
    propiedad,
    altura,
    progreso = 1,
  }) => {
    habilitarRiel(rail, propiedad, altura);
    window.requestAnimationFrame(() => {
      // Sin esto Lenis clampea el destino al largo del documento previo a habilitar el riel.
      window.lenis?.resize?.();
      if (progreso !== null) {
        const rect = rail?.getBoundingClientRect();
        const scrollRange = (rect?.height ?? 0) - window.innerHeight;
        const targetScroll = window.scrollY + (rect?.top ?? 0) + progreso * scrollRange;
        // Sin lock, el tap que dispara el salto cancela el scroll a los pocos píxeles.
        irA(targetScroll, { lock: true, duration: DURACION_SALTO_PANEL });
      }
      updateProgress();
    });
  };

  // Sin esto, SALTAR INTRO y el menú hamburguesa apuntan a secciones en display:none y no hacen nada.
  document.addEventListener('click', (event) => {
    if (event.target.closest('.hero__skip, .acertijo-panel__skip, .site-menu a[href^="#"]')) {
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
    if (!['intro', 'panel', 'quiz', 'resultado', 'piramide', 'interior', 'ofertas', 'vales', 'formulario', 'footer'].includes(tramo)) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    liberarScroll();

    if (tramo === 'intro') {
      irA(0, { immediate: true });
      return;
    }

    const respuesta = params.get('rta') === 'error' ? 'error' : 'acierto';
    puzzleStarted = true;
    panel?.setAttribute('aria-hidden', 'false');
    habilitarRiel(entryRail, '--panel-entry-rail-height', RAIL_HEIGHTS.entrada);

    if (tramo === 'panel') {
      irA(entryRail?.getBoundingClientRect().top + window.scrollY, { immediate: true });
      return;
    }

    puzzleComplete = true;
    habilitarRiel(exitRail, '--panel-exit-rail-height', RAIL_HEIGHTS.salida);
    habilitarRiel(quizRail, '--quiz-rail-height', RAIL_HEIGHTS.quiz);
    setSceneState('pregunta');

    if (tramo === 'quiz') {
      irA(quizRail?.getBoundingClientRect().top + window.scrollY, { immediate: true });
      return;
    }

    answerSubmitted = true;
    heroStage?.setAttribute('data-respondido', 'true');
    heroStage?.setAttribute('data-resultado', respuesta);
    habilitarRiel(resultRail, '--resultado-rail-height', RAIL_HEIGHTS.resultado);

    if (tramo === 'resultado') {
      irA(resultRail?.getBoundingClientRect().top + window.scrollY, { immediate: true });
      return;
    }

    pyramidRailEnabled = true;
    habilitarRiel(pyramidRail, '--piramide-rail-height', RAIL_HEIGHTS.piramide);
    if (tramo === 'piramide') {
      irA(pyramidRail?.getBoundingClientRect().top + window.scrollY, { immediate: true });
      return;
    }

    const escenaDestino = document.querySelector('.' + tramo);
    let antesDelDestino = true;
    document.querySelectorAll('.escena[data-entrada]').forEach((escena) => {
      if (!antesDelDestino) return;
      escena.dataset.entradaActiva = 'true';
      escena.querySelector('.escena__stage')?.style.setProperty('--escena-p', '1');
      if (escena === escenaDestino) antesDelDestino = false;
    });
    irA(escenaDestino.getBoundingClientRect().top + window.scrollY, { immediate: true });
  };

  const saltarCuandoHayaLayout = () => {
    const saltar = () => {
      window.lenis?.resize?.();
      saltarAInicioDeTramo();
    };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      saltar();
      requestAnimationFrame(() => requestAnimationFrame(saltar));
    }));
  };
  if (document.readyState === 'complete') saltarCuandoHayaLayout();
  else window.addEventListener('load', saltarCuandoHayaLayout, { once: true });

  if (reducedMotion.matches) {
    setProgress(1);
  } else {
    window.lenis.on('scroll', updateProgress);
    window.addEventListener('resize', requestProgressUpdate);
    window.addEventListener('orientationchange', requestProgressUpdate);
    updateProgress();
  }
}
