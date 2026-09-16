/*
 * Se mete dentro de la página de Netflix (o Prime, Disney+, Max) y sincroniza
 * su reproductor con la sala.
 *
 * Esto es lo que una web **no** puede hacer y una extensión sí: el DRM impide
 * incrustar o controlar el reproductor desde otro origen, pero desde dentro de
 * la propia página el elemento `<video>` es accesible como cualquier otro. Es
 * exactamente el truco de Teleparty y del plugin de escritorio de Hearo.
 */

const { positionAt, phaseAt, reconcile } = globalThis.JuntosSync;

const LOOP_MS = 250;
/** Tras una orden nuestra, los eventos del reproductor se ignoran este rato. */
const ECHO_GUARD_MS = 700;
/** Tras una orden de la persona, el corrector calla hasta que la sala se entera. */
const INTENT_MS = 2000;
const PAUSED_TOLERANCE_S = 0.4;
/** Netflix monta y desmonta su reproductor al navegar; hay que reengancharse. */
const RESCAN_MS = 2000;
/** Si el puerto se cae, cuánto se espera antes de volver a abrirlo. */
const RECONNECT_MS = 1000;

let room = null;
let clockOffsetMs = 0;
let video = null;
let loopTimer = null;
let guardUntil = 0;
let intentUntil = 0;

const serverNow = () => Date.now() + clockOffsetMs;
const isEcho = () => Date.now() < guardUntil;

function commanded(run) {
  guardUntil = Date.now() + ECHO_GUARD_MS;
  run();
}

function announce(action) {
  intentUntil = Date.now() + INTENT_MS;
  try {
    port?.postMessage({ type: 'action', action });
  } catch {
    // El puerto se cayó; el reconectador de abajo lo levanta.
  }
  // El servidor confirmará por el siguiente mensaje `room`; hasta entonces manda
  // lo que ha pedido la persona.
  setTimeout(() => {
    intentUntil = Date.now() + 300;
  }, 600);
}

// ───────────────────────── Enganche del reproductor ──────────────────────

/** El vídeo más largo de la página: descarta anuncios y avances. */
function findVideo() {
  const candidates = [...document.querySelectorAll('video')].filter(
    (element) => Number.isFinite(element.duration) && element.duration > 0,
  );
  if (candidates.length === 0) return null;

  return candidates.reduce((longest, element) =>
    element.duration > longest.duration ? element : longest,
  );
}

function onPlay() {
  if (isEcho() || !video) return;
  announce({ type: 'start', positionMs: Math.round(video.currentTime * 1000), countdown: false });
}

function onPause() {
  if (isEcho() || !video) return;
  announce({ type: 'seek', positionMs: Math.round(video.currentTime * 1000) });
}

function onSeeked() {
  if (isEcho() || !video || !room) return;

  const positionMs = Math.round(video.currentTime * 1000);
  // Arrastrar la barra con la peli en marcha no debe pararla.
  if (phaseAt(room, serverNow()) === 'playing') {
    announce({ type: 'start', positionMs, countdown: false });
  } else {
    announce({ type: 'seek', positionMs });
  }
}

function attach(element) {
  if (video === element) return;

  detach();
  video = element;
  if (!video) return;

  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('seeked', onSeeked);
  badge('Sincronizado con la sala');
}

function detach() {
  if (!video) return;
  video.removeEventListener('play', onPlay);
  video.removeEventListener('pause', onPause);
  video.removeEventListener('seeked', onSeeked);
  video.playbackRate = 1;
  video = null;
}

// ──────────────────────────── Bucle de sincronía ─────────────────────────

function tick() {
  if (!room) return;
  attach(findVideo());
  if (!video || Date.now() < intentUntil) return;

  const serverMs = serverNow();
  const targetMs = positionAt(room, serverMs);
  const playing = phaseAt(room, serverMs) === 'playing';
  const actualMs = video.currentTime * 1000;

  if (!playing) {
    if (!video.paused) commanded(() => video.pause());
    video.playbackRate = 1;

    if (Math.abs(actualMs - targetMs) > PAUSED_TOLERANCE_S * 1000) {
      commanded(() => {
        video.currentTime = targetMs / 1000;
      });
    }
    return;
  }

  if (video.paused) {
    // El navegador de escritorio sí deja arrancar por código; si lo rechaza, se
    // reintenta en el siguiente ciclo.
    commanded(() => void video.play().catch(() => undefined));
  }

  const correction = reconcile(targetMs, actualMs);
  if (correction.action === 'seek') {
    commanded(() => {
      video.currentTime = correction.toMs / 1000;
    });
  }
  if (video.playbackRate !== correction.rate) video.playbackRate = correction.rate;
}

// ──────────────────────────────── Aviso ──────────────────────────────────

let badgeElement = null;

function badge(text) {
  if (!badgeElement) {
    badgeElement = document.createElement('div');
    badgeElement.style.cssText = [
      'position:fixed', 'z-index:2147483647', 'left:16px', 'bottom:16px',
      'padding:8px 14px', 'border-radius:999px',
      'font:600 13px/1.2 -apple-system,system-ui,sans-serif', 'color:#fff',
      'background:linear-gradient(135deg,#8b5cf6,#fb7185)',
      'box-shadow:0 10px 24px -12px rgba(0,0,0,.9)', 'pointer-events:none',
      'opacity:0', 'transition:opacity .25s ease',
    ].join(';');
    document.documentElement.appendChild(badgeElement);
  }

  badgeElement.textContent = `Juntos · ${text}`;
  badgeElement.style.opacity = '1';
  clearTimeout(badge.timer);
  badge.timer = setTimeout(() => {
    badgeElement.style.opacity = '0';
  }, 3500);
}

// ──────────────────────────────── Mensajes ───────────────────────────────

/**
 * Puerto persistente con el service worker.
 *
 * No es solo un canal: mientras esté abierto, Chrome no duerme el worker. Sin
 * él, el sondeo se pararía a los treinta segundos y la sincronización moriría a
 * mitad de película.
 */
let port = null;
let reconnectTimer = null;

function handle(message) {
  switch (message.type) {
    case 'room':
      room = message.room;
      clockOffsetMs = message.clockOffsetMs ?? 0;
      if (!loopTimer) loopTimer = setInterval(tick, LOOP_MS);
      break;

    case 'stopped':
      room = null;
      clearInterval(loopTimer);
      loopTimer = null;
      detach();
      badge('Desconectado');
      break;

    case 'problem':
      badge(message.message);
      break;
  }
}

function connect() {
  clearTimeout(reconnectTimer);

  try {
    port = chrome.runtime.connect({ name: 'juntos' });
  } catch {
    // La extensión se está recargando; se reintenta.
    reconnectTimer = setTimeout(connect, RECONNECT_MS);
    return;
  }

  port.onMessage.addListener(handle);
  port.onDisconnect.addListener(() => {
    port = null;
    // Chrome corta el puerto al dormir el worker; volver a abrirlo lo despierta.
    reconnectTimer = setTimeout(connect, RECONNECT_MS);
  });
}

connect();

// Netflix reemplaza su reproductor al cambiar de episodio: hay que reengancharse.
setInterval(() => {
  if (room) attach(findVideo());
}, RESCAN_MS);
