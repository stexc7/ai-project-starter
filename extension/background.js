/*
 * El que habla con la sala.
 *
 * Vive aquí y no en el content script por dos motivos: las peticiones desde el
 * service worker no las frena CORS (tenemos permiso de host), y así la sesión no
 * queda expuesta en la página de Netflix.
 */

const STORAGE_KEY = 'juntos';

/** Cuánto se espera entre sondeos. Lo decide el servidor, esto es el respaldo. */
const FALLBACK_POLL_MS = 2000;
/** Muestras para estimar la diferencia con el reloj del servidor. */
const CLOCK_SAMPLES = 5;
/** Cada cuánto se vuelve a medir el reloj. */
const CLOCK_REFRESH_MS = 60_000;

let session = null; // { origin, code, token, memberId }
let clockOffsetMs = 0;
let clockMeasuredAt = 0;
let version = 0;
let pollTimer = null;
let lastRoom = null;

/**
 * Pestañas de streaming conectadas.
 *
 * Son un puerto abierto, y eso es lo que mantiene vivo este service worker: en
 * Manifest V3 Chrome lo duerme a los treinta segundos sin actividad, y una
 * cadena de `setTimeout` moriría a mitad de película. Además sirve para saber
 * cuándo sondear: sin ninguna pestaña abierta, no hay nada que sincronizar.
 */
const ports = new Set();

// ───────────────────────────── Almacenamiento ────────────────────────────

async function loadSession() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  session = stored[STORAGE_KEY] ?? null;
  return session;
}

async function saveSession(next) {
  session = next;
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
}

// ─────────────────────────────── Red ─────────────────────────────────────

async function api(path, options = {}) {
  if (!session) throw new Error('Sin sala');

  const response = await fetch(`${session.origin}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // La app web usa cookie; la extensión, token. La cookie es `SameSite=Lax`
      // y no viajaría desde netflix.com.
      Authorization: `Bearer ${session.token}`,
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? `Error ${response.status}`);
  return payload;
}

/** Diferencia con el reloj del servidor, al estilo NTP. */
async function measureClock() {
  const samples = [];

  for (let i = 0; i < CLOCK_SAMPLES; i += 1) {
    const sentAt = Date.now();
    try {
      const response = await fetch(`${session.origin}/api/time`, { cache: 'no-store' });
      const { serverMs } = await response.json();
      const receivedAt = Date.now();
      samples.push({ rtt: receivedAt - sentAt, offset: serverMs + (receivedAt - sentAt) / 2 - receivedAt });
    } catch {
      // Una muestra perdida no invalida las demás.
    }
  }

  if (samples.length === 0) return;

  samples.sort((a, b) => a.rtt - b.rtt);
  const best = samples.slice(0, 3).map((sample) => sample.offset).sort((a, b) => a - b);

  clockOffsetMs = Math.round(best[Math.floor(best.length / 2)]);
  clockMeasuredAt = Date.now();
}

const serverNow = () => Date.now() + clockOffsetMs;

// ───────────────────────────── Sondeo ────────────────────────────────────

function broadcast(message) {
  for (const port of ports) {
    try {
      port.postMessage(message);
    } catch {
      ports.delete(port);
    }
  }
}

async function poll() {
  clearTimeout(pollTimer);
  pollTimer = null;
  if (!session || ports.size === 0) return;

  let nextIn = FALLBACK_POLL_MS;

  try {
    if (Date.now() - clockMeasuredAt > CLOCK_REFRESH_MS) await measureClock();

    const delta = await api(`/api/rooms/${session.code}/state?since=${version}`);
    version = delta.version;
    nextIn = delta.nextPollMs ?? FALLBACK_POLL_MS;

    if (delta.room) {
      lastRoom = delta.room;
      broadcast({ type: 'room', room: delta.room, clockOffsetMs, serverMs: serverNow() });
    }
  } catch (cause) {
    broadcast({ type: 'problem', message: String(cause.message ?? cause) });
    nextIn = 4000;
  }

  pollTimer = setTimeout(poll, nextIn);
}

// ──────────────────────────── Mensajes ───────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  (async () => {
    await loadSession();

    switch (message.type) {
      case 'join': {
        const { origin, code, name, pin } = message;
        const response = await fetch(`${origin}/api/rooms/${code}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, emoji: '🐻', pin, wantToken: true }),
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error ?? 'No se ha podido entrar.');

        await saveSession({ origin, code, token: payload.token, memberId: payload.memberId });
        version = 0;
        clockMeasuredAt = 0;
        void poll();
        return { ok: true, code };
      }

      case 'leave':
        await chrome.storage.local.remove(STORAGE_KEY);
        session = null;
        lastRoom = null;
        clearTimeout(pollTimer);
        pollTimer = null;
        broadcast({ type: 'stopped' });
        return { ok: true };

      case 'status':
        return { ok: true, session: session ? { origin: session.origin, code: session.code } : null };

      // El content script cuenta lo que ha hecho la persona en el reproductor.
      case 'action': {
        const delta = await api(`/api/rooms/${session.code}/actions`, {
          method: 'POST',
          body: JSON.stringify(message.action),
        });
        version = delta.version;
        if (delta.room) {
          lastRoom = delta.room;
          broadcast({ type: 'room', room: delta.room, clockOffsetMs, serverMs: serverNow() });
        }
        return { ok: true };
      }

      default:
        return { ok: false, error: 'Mensaje desconocido' };
    }
  })()
    .then(respond)
    .catch((cause) => respond({ ok: false, error: String(cause.message ?? cause) }));

  // `true` mantiene abierto el canal para la respuesta asíncrona.
  return true;
});

// ────────────────────── Pestañas de streaming ────────────────────────────

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'juntos') return;

  ports.add(port);

  port.onDisconnect.addListener(() => {
    ports.delete(port);
    if (ports.size === 0) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  });

  // Lo que la persona hace en el reproductor de Netflix.
  port.onMessage.addListener((message) => {
    if (message?.type !== 'action') return;
    void sendAction(message.action);
  });

  void loadSession().then(() => {
    if (!session) return;
    // Lo último que se sepa, ya mismo: no hay que esperar al siguiente sondeo.
    if (lastRoom) port.postMessage({ type: 'room', room: lastRoom, clockOffsetMs, serverMs: serverNow() });
    void poll();
  });
});

async function sendAction(action) {
  try {
    await loadSession();
    const delta = await api(`/api/rooms/${session.code}/actions`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
    version = delta.version;
    if (delta.room) {
      lastRoom = delta.room;
      broadcast({ type: 'room', room: delta.room, clockOffsetMs, serverMs: serverNow() });
    }
  } catch (cause) {
    broadcast({ type: 'problem', message: String(cause.message ?? cause) });
  }
}

/*
 * Red de seguridad: si Chrome duerme el service worker de todas formas, la
 * alarma lo despierta y el sondeo se reanuda. Medio minuto es el mínimo que
 * permite la API.
 */
chrome.alarms.create('juntos-tick', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(() => {
  void loadSession().then(() => {
    if (session && ports.size > 0 && !pollTimer) void poll();
  });
});

chrome.runtime.onStartup.addListener(() => void loadSession());
chrome.runtime.onInstalled.addListener(() => void loadSession());
