import { irA } from './lenis.js';

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Escribir el mismo valor igual invalida estilos (en body, el árbol entero) y fuerza
// layout al próximo getBoundingClientRect de otro handler de scroll.
export const fijar = (el, propiedad, valor) => {
  if (el && el.style.getPropertyValue(propiedad) !== valor) el.style.setProperty(propiedad, valor);
};
export const marcar = (el, clave, valor) => {
  if (el && el.dataset[clave] !== valor) el.dataset[clave] = valor;
};

export let altoViewportSVH = window.innerHeight;
if (!altoViewportSVH) throw new Error('--vh midió 0 al inicializar');
document.documentElement.style.setProperty('--vh', `${altoViewportSVH}px`);
let anchoViewport = window.innerWidth;
const medirViewport = () => {
  altoViewportSVH = window.innerHeight;
  if (!altoViewportSVH) throw new Error('--vh midió 0 al inicializar');
  document.documentElement.style.setProperty('--vh', `${altoViewportSVH}px`);
  anchoViewport = window.innerWidth;
};
window.addEventListener('resize', () => {
  if (window.innerWidth !== anchoViewport) {
    medirViewport();
  }
});
window.addEventListener('orientationchange', medirViewport);

// Sin desdeElTope: riel que contiene a su sticky. Con desdeElTope: riel posterior
// al sticky que mide su recorrido completo.
// DesdeElTope: p=0 cuando el riel asoma por abajo y p=1 cuando su fondo llega
// al fondo del viewport, el final del scroll disponible. Se mide en svh, igual
// que el CSS de los rieles.
export const progresoDeRiel = (rail, {
  inicio = 0,
  fin = 1,
  destino,
  propiedad,
  desdeElTope = false,
} = {}) => {
  const rect = rail?.getBoundingClientRect();
  const range = rect ? rect.height - altoViewportSVH : 0;
  const progresoDelRiel = desdeElTope
    ? (rect && rect.height > 0 ? (altoViewportSVH - rect.top) / rect.height : 0)
    : (rect && range > 0 ? -rect.top / range : 0);
  const tramo = fin - inicio;
  const progreso = tramo > 0 ? (progresoDelRiel - inicio) / tramo : 0;
  const resultado = clamp(progreso);

  if (destino && propiedad) fijar(destino, propiedad, String(resultado));
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
let salaEnFinal = false;
const pyramidScene = document.querySelector('.piramide-escena');
const skipLink = document.querySelector('.hero__skip');
if (heroTrack) {
  const panelRailsDesktop = window.matchMedia('(min-width: 900px)');
  const ALTURA_RESULTADO_MOBILE = 350;
  const ALTURA_RESULTADO_DESKTOP = 300;
  const ALTURA_PANEL_ENTRADA_DESKTOP = 300; // Recorrido de escritorio; ajustar a ojo.
  const ALTURA_PANEL_ENTRADA_MOBILE = 200;
  const ALTURA_MOVIMIENTO_SALIDA = 200;
  const INICIO_MOVIMIENTO_SALIDA = 0.3;
  const ALTURA_QUIZ_MOBILE = 200;
  const GLOBO_COMPLETO_EN = 0.5;
  const PAUSA_GLOBO_SVH = 50;
  const ENTRADA_CONTROLES_DESKTOP = 0.5; // Las opciones entran a 75svh, con el globo ya completo; ver css/sections.css.
  const RESULTADO_TRAMOS = { quizSalidaFin: 0.29, resultadoEntradaInicio: 0.29, resultadoEntradaFin: 0.57 };
  const RESULTADO_TRAMOS_DESKTOP = {
    quizSalidaFin: 0.40, // salida: 0-120svh.
    resultadoEntradaInicio: 0.40, // entrada: empieza a 120svh.
    resultadoEntradaFin: 1, // entrada: termina a 300svh.
  };
  const alturaViewport = (factor) => `calc(var(--vh) * ${factor})`;
  const alturaRielPanel = () => alturaViewport((panelRailsDesktop.matches
    ? ALTURA_PANEL_ENTRADA_DESKTOP
    : ALTURA_PANEL_ENTRADA_MOBILE) / 100);
  const alturaRielSalida = () => alturaViewport(ALTURA_MOVIMIENTO_SALIDA / (1 - INICIO_MOVIMIENTO_SALIDA) / 100);
  const alturaRielQuiz = () => alturaViewport(panelRailsDesktop.matches ? 1.5 : ALTURA_QUIZ_MOBILE / 100);
  const alturaRielResultado = () => panelRailsDesktop.matches
    ? alturaViewport(ALTURA_RESULTADO_DESKTOP / 100)
    : alturaViewport(ALTURA_RESULTADO_MOBILE / 100);
  const tramosResultado = () => panelRailsDesktop.matches ? RESULTADO_TRAMOS_DESKTOP : RESULTADO_TRAMOS;
  const alturaRielPiramide = () => alturaViewport(panelRailsDesktop.matches ? 1.65 : 5.4);
  const entradaControles = () => panelRailsDesktop.matches
    ? ENTRADA_CONTROLES_DESKTOP
    : GLOBO_COMPLETO_EN + PAUSA_GLOBO_SVH / ALTURA_QUIZ_MOBILE;
  let ENTRADA_CONTROLES = entradaControles();

  // La participacion del panel se deriva de sus rieles, no del breakpoint.
  const RAIL_HEIGHTS = {
    entrada: alturaRielPanel(),
    salida: alturaRielSalida(),
    anuncio: alturaViewport(1.5),
    quiz: alturaRielQuiz(),
    resultado: alturaRielResultado(),
    piramide: alturaRielPiramide(),
  };
  const panelEstaEnJuego = () => (panelRailsDesktop.matches
    ? ALTURA_PANEL_ENTRADA_DESKTOP
    : ALTURA_PANEL_ENTRADA_MOBILE) > 0 || ALTURA_MOVIMIENTO_SALIDA > 0;
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
  let introSaltada = false;

  const liberarScroll = () => {
    if ('introBloqueado' in document.body.dataset) delete document.body.dataset.introBloqueado;
  };

  // Checkpoints: un riel en 0svh no aporta altura al documento, asi que el
  // scroll hacia adelante se detiene solo y el de vuelta queda libre. Cada
  // riel se habilita al cumplirse su condicion:
  //   EMPEZAR -> entrada | 3 papiros -> salida + quiz
  //   respuesta -> resultado | resultado al 100% -> piramide
  //   Desktop libera con --piramide-p al 85%; mobile con --puerta-p al 85%.
  //   El riel piramide mide 165svh en desktop y 540svh en mobile. Se revela
  //   el resto de la pagina.
  const recalcularAlturasRielesPanel = () => {
    RAIL_HEIGHTS.anuncio = alturaViewport(1.5);
    RAIL_HEIGHTS.entrada = alturaRielPanel();
    RAIL_HEIGHTS.salida = alturaRielSalida();
    RAIL_HEIGHTS.quiz = alturaRielQuiz();
    RAIL_HEIGHTS.resultado = alturaRielResultado();
    RAIL_HEIGHTS.piramide = alturaRielPiramide();
    ENTRADA_CONTROLES = entradaControles();
    panelEnJuego = panelEstaEnJuego();
    puzzleStarted = !panelEnJuego;
    puzzleComplete = !panelEnJuego;
    habilitarRiel(entryRail, '--panel-entry-rail-height', puzzleStarted ? RAIL_HEIGHTS.entrada : '0px');
    habilitarRiel(exitRail, '--panel-exit-rail-height', puzzleComplete ? RAIL_HEIGHTS.salida : '0px');
    habilitarRiel(anuncioRail, '--anuncio-rail-height', panelEnJuego ? '0px' : RAIL_HEIGHTS.anuncio);
    habilitarRiel(quizRail, '--quiz-rail-height', panelEnJuego ? '0px' : RAIL_HEIGHTS.quiz);
    habilitarRiel(resultRail, '--resultado-rail-height', answerSubmitted ? RAIL_HEIGHTS.resultado : '0px');
    habilitarRiel(pyramidRail, '--piramide-rail-height', pyramidRailEnabled ? RAIL_HEIGHTS.piramide : '0px');
    panel?.setAttribute('aria-hidden', 'true');
    setSceneState('intro');
  };

  panelRailsDesktop.addEventListener('change', recalcularAlturasRielesPanel);

  document.body.dataset.introBloqueado = 'true';

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
    // Reparto: acercamiento (--piramide-p), puerta (--puerta-p) y entrada. Sin apertura de hojas.
    const REPARTO_PIRAMIDE = panelRailsDesktop.matches ? 120 / 165 : 300 / 540; // Desktop: acercamiento, 0-120svh.
    // Desktop no tiene tramo de puerta: su zoom no usa --puerta-p y ese tramo era
    // escena quieta. Mobile sí hace el zoom a la puerta con --puerta-p.
    const FRENO_PIRAMIDE = panelRailsDesktop.matches ? 120 / 165 : 468 / 540; // Desktop: entrada 120-165svh. Mobile: puerta 300-468, entrada 468-540.
    // Mobile: el vano ya cubre la pantalla al principio del tramo de entrada; esperar a 1 deja el pasillo quieto en la cola del ease-out.
    const POPUP_SALA_EN = panelRailsDesktop.matches ? 0.999 : 0.5;
    const pyramidProgress = pyramidRailEnabled
      ? progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: 0, fin: REPARTO_PIRAMIDE, destino: heroStage, propiedad: '--piramide-p' })
      : 0;
    const doorProgress = pyramidRailEnabled
      ? progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: REPARTO_PIRAMIDE, fin: FRENO_PIRAMIDE, destino: heroStage, propiedad: '--puerta-p' })
      : 0;
    if (pyramidRailEnabled) {
      const entradaProgress = progresoDeRiel(pyramidRail, { desdeElTope: true, inicio: FRENO_PIRAMIDE, fin: 1, destino: heroStage, propiedad: '--entrada-p' });
      // .pase-puerta cuelga de <body>, fuera de .hero__stage, y las custom
      // properties solo heredan hacia abajo: sin esto nunca ve --entrada-p.
      fijar(document.body, '--entrada-p', String(entradaProgress));
      marcar(document.body, 'enSala', String(entradaProgress >= 0.999));
      if (entradaProgress >= POPUP_SALA_EN && !salaEnFinal && heroTrack?.getBoundingClientRect().bottom > 0) {
        salaEnFinal = true;
        document.dispatchEvent(new CustomEvent('sala:final'));
      } else if (entradaProgress < POPUP_SALA_EN - 0.1) {
        salaEnFinal = false;
      }
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
    // Tras SALTAR INTRO el panel sale de pantalla (1 = arriba del viewport) aunque
    // los papiros no se hayan resuelto; si no, queda fijo tapando el destino.
    panelProgress = panelEnJuego && !introSaltada ? entryProgress * 0.5 + exitProgress * 0.5 : 1;
    const effectivePanelProgress = panelProgress;
    if (skipLink) {
      marcar(skipLink, 'panelActive', String(panelEnJuego && puzzleStarted && effectivePanelProgress < 1));
    }
    fijar(document.body, '--intro-progress', String(progress));
    fijar(document.body, '--panel-progress', String(effectivePanelProgress));
    const progressState = effectivePanelProgress > 0.001 && effectivePanelProgress < 0.999 ? 'activo' : 'reposo';
    if (panel?.getAttribute('data-progress-state') !== progressState) panel?.setAttribute('data-progress-state', progressState);
    if (!puzzleComplete || exitProgress < 1) {
      fijar(heroStage, '--quiz-p', String(quizProgress));
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
      fijar(heroStage, '--resultado-salida-p', String(resultExitProgress));
      fijar(heroStage, '--resultado-entrada-p', String(resultEntryProgress));

      if (answerSubmitted && resultProgress >= 0.999 && !pyramidRailEnabled) {
        pyramidRailEnabled = true;
        habilitarRiel(pyramidRail, '--piramide-rail-height', RAIL_HEIGHTS.piramide);
      }
      if (pyramidScene) {
        marcar(pyramidScene, 'piramideActive', String(pyramidProgress > 0));
      }

      if (questionUi) {
        if (questionUi.inert !== !controlsVisible) questionUi.inert = !controlsVisible;
        const questionHidden = String(!controlsVisible);
        if (questionUi.getAttribute('aria-hidden') !== questionHidden) questionUi.setAttribute('aria-hidden', questionHidden);
        marcar(questionUi, 'quizVisible', String(controlsVisible));

        // El umbral de --quiz-p va en ambas ramas para que la vuelta sea simétrica.
        questionUi.querySelectorAll('.hero__option').forEach((option, index) => {
          marcar(option, 'quizActive', String(
            controlsVisible
              && quizProgress >= ENTRADA_CONTROLES
              && (!answerSubmitted || quizExitProgress >= 0.999)
          ));
        });
        const continueButton = questionUi.querySelector('.hero__continue');
        if (continueButton) {
          marcar(continueButton, 'quizActive', String(
            controlsVisible
              && quizProgress >= ENTRADA_CONTROLES
              && (!answerSubmitted || quizExitProgress >= 0.999)
          ));
        }
        questionUi.querySelectorAll('.hero__result').forEach((result) => {
          marcar(result, 'resultadoActive', String(answerSubmitted && controlsVisible && resultEntryProgress > 0));
          const resultHidden = String(!(answerSubmitted && controlsVisible && resultEntryProgress > 0));
          if (result.getAttribute('aria-hidden') !== resultHidden) result.setAttribute('aria-hidden', resultHidden);
        });
      }
      if (skipLink) {
        // Se va con la entrada de la pirámide, apareado con la rampa 0.15 de
        // .piramide-escena que ya usa controlsVisible (:218).
        marcar(skipLink, 'quizActive', String(
          currentState === 'pregunta'
          && quizProgress >= ENTRADA_CONTROLES // Aparece con las opciones.
          && pyramidProgress < 0.15
          && !(answerSubmitted && resultEntryProgress > 0) // Se va con la pantalla de resultado.
        ));
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
  // El salto a la pirámide va a velocidad de cámara constante, no a duración fija:
  // mobile recorre ~7 pantallas (riel de 540svh + resto de resultado) y escritorio ~2.5.
  // Con 3.6s fijos, mobile iba al doble y el camino no se llegaba a ver.
  // Calibrables: velocidad en pantallas por segundo y piso (que deja escritorio como estaba).
  const PANTALLAS_POR_SEGUNDO_PIRAMIDE = 1.1;
  const DURACION_MIN_PIRAMIDE = 2.0;
  const duracionSaltoPiramide = (distancia) => Math.max(
    DURACION_MIN_PIRAMIDE,
    distancia / altoViewportSVH / PANTALLAS_POR_SEGUNDO_PIRAMIDE,
  );
  const habilitarRielYDesplazar = (rail, {
    propiedad,
    altura,
    progreso = 1,
    duration = DURACION_SALTO_PANEL,
  }) => {
    habilitarRiel(rail, propiedad, altura);
    window.requestAnimationFrame(() => {
      // Sin esto Lenis clampea el destino al largo del documento previo a habilitar el riel.
      window.lenis?.resize?.();
      if (progreso !== null) {
        const rect = rail?.getBoundingClientRect();
        const scrollRange = (rect?.height ?? 0) - altoViewportSVH;
        const targetScroll = window.scrollY + (rect?.top ?? 0) + progreso * scrollRange;
        // Sin lock, el tap que dispara el salto cancela el scroll a los pocos píxeles.
        const duracion = typeof duration === 'function'
          ? duration(Math.abs(targetScroll - window.scrollY))
          : duration;
        irA(targetScroll, { lock: true, duration: duracion });
      }
      updateProgress();
    });
  };

  // <base href> hace que href="#x" navegue a BASE#x y recargue la página:
  // los anclas internas se resuelven acá. SALTAR INTRO además libera el
    // bloqueo (si no, #formulario está en display:none).
  // Todos saltan sin animar: un scroll suave atravesaría la intro y el pase del interior a
  // ofertas.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]:not([href="#"])');
    const destino = link && document.querySelector(link.getAttribute('href'));
    if (!destino) return;
    if (link.matches('.site-menu a[href^="#"]')) liberarScroll();
    event.preventDefault();
    if (link.matches('.hero__skip, .acertijo-panel__skip')) {
      introSaltada = true;
      panel?.setAttribute('aria-hidden', 'true');
      if (panel) panel.inert = true;
      liberarScroll();
      // Las secciones estaban en display:none (css/base.css:84). Lenis cachea el
      // límite de scroll y lo actualiza en un frame posterior: sin esto, el primer
      // salto se recorta al alto viejo de la intro.
      window.lenis.resize();
      // Aterriza al 60% del riel de .prueba-superada: el stage termina de entrar al 10%
      // (--escena-entrada-tramo) y la capa del pasillo (.sala-fondo) se va al 55%.
      // Mismo cálculo que progresoDeRiel con desdeElTope: p = (vh - rail.top) / rail.height.
      const rail = destino.querySelector('.escena-rail');
      const rect = rail?.getBoundingClientRect();
      const top = rect ? window.scrollY + rect.top - altoViewportSVH + rect.height * 0.6 : destino;
      irA(top, { immediate: true });
      updateProgress();
    } else {
      irA(destino, { immediate: true });
    }
    destino.focus({ preventScroll: true });
  });

  document.addEventListener('acertijo:iniciado', () => {
    if (puzzleStarted) return;
    puzzleStarted = true;
    panel?.setAttribute('aria-hidden', 'false');
    // Sticky (100svh) + riel de entrada (300svh en escritorio, 200svh en móvil).
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

  document.addEventListener('resultado:continuar', () => {
    if (!pyramidRail) return;
    pyramidRailEnabled = true;
    // Un solo viaje hasta Ofertiti: antes el popup partía el movimiento en dos.
    habilitarRiel(pyramidRail, '--piramide-rail-height', RAIL_HEIGHTS.piramide);
    window.requestAnimationFrame(() => {
      // Sin esto Lenis clampea el destino al largo del documento previo a habilitar el riel.
      window.lenis?.resize?.();
      const rail = document.querySelector('.prueba-superada .escena-rail');
      const rect = rail?.getBoundingClientRect();
      if (rect) {
        // 0.6 = parada de reposo de Ofertiti (P_PRUEBA_SUPERADA en auto-pantalla.js).
        const destino = window.scrollY + rect.top - altoViewportSVH + 0.6 * rect.height;
        irA(destino, { lock: true, duration: duracionSaltoPiramide(Math.abs(destino - window.scrollY)) });
      }
      updateProgress();
    });
  });

  const saltarAInicioDeTramo = () => {
    const params = new URLSearchParams(window.location.search);
    const tramo = params.get('saltar');
    if (!['intro', 'panel', 'quiz', 'resultado', 'puerta', 'piramide', 'prueba-superada', 'interior', 'ofertas', 'vales', 'formulario', 'footer'].includes(tramo)) return;
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

  window.lenis.on('scroll', updateProgress);
  window.addEventListener('resize', requestProgressUpdate);
  window.addEventListener('orientationchange', requestProgressUpdate);
  updateProgress();
}
