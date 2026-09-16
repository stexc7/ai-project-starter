/**
 * Tipos del dominio.
 *
 * Todo instante de tiempo que se comparte entre los dos móviles se expresa en
 * "ms del reloj del servidor". El reloj de cada iPhone puede ir desviado varios
 * segundos; el del servidor es el único que ambos comparten. Ver `clock.ts`.
 */

/** Estado persistido de la reproducción. `countdown` no se guarda: se deriva. */
export type PlaybackStatus = 'idle' | 'running' | 'paused';

/** Lo que ve el usuario. Se calcula con `phaseAt()`. */
export type PlaybackPhase = 'idle' | 'countdown' | 'playing' | 'paused';

/**
 * Ancla de reproducción: "en el instante `atServerMs` la película iba por
 * `positionMs`". Con este único par, cualquier cliente reconstruye el timecode
 * exacto en cualquier momento, sin depender de mensajes que lleguen a tiempo.
 *
 * Si `atServerMs` está en el futuro, estamos en cuenta atrás.
 */
export interface Anchor {
  atServerMs: number;
  positionMs: number;
}

/**
 * De dónde sale el vídeo.
 *
 * - `youtube` y `video` se incrustan en la propia página: la sincronización es
 *   **automática**. Uno le da al play y al otro le arranca solo.
 * - `external` es Netflix, Prime, HBO… y cualquier cosa con DRM. No se pueden
 *   incrustar ni controlar desde una web, así que ahí la app coordina a las dos
 *   personas en vez de a los dos reproductores.
 */
export type SourceKind = 'external' | 'youtube' | 'video';

export interface Source {
  kind: SourceKind;
  /** Id del vídeo de YouTube, URL del archivo, o cadena vacía si es externa. */
  ref: string;
}

export interface Member {
  id: string;
  name: string;
  emoji: string;
  lastSeenServerMs: number;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  text: string;
  atServerMs: number;
  /** Versión de la sala en la que nació. Permite pedir solo lo nuevo. */
  seq: number;
}

export interface Reaction {
  id: string;
  memberId: string;
  emoji: string;
  atServerMs: number;
  /** Versión de la sala en la que nació. Permite pedir solo lo nuevo. */
  seq: number;
}

export interface WatchlistItem {
  id: string;
  title: string;
  addedBy: string;
  addedAtServerMs: number;
}

/**
 * Mensaje de señalización de WebRTC (oferta, respuesta o candidato ICE).
 *
 * Viaja por el mismo sondeo que el chat: son cuatro o cinco mensajes al
 * establecer la llamada, no un flujo continuo.
 */
export interface Signal {
  id: string;
  from: string;
  to: string;
  /** JSON serializado del `RTCSessionDescriptionInit` o `RTCIceCandidateInit`. */
  payload: string;
  atServerMs: number;
  seq: number;
}

export interface Room {
  code: string;
  /** Hash scrypt del PIN. Nunca sale de `src/server/`. */
  pinHash: string;
  createdAtServerMs: number;
  title: string;
  source: Source;
  status: PlaybackStatus;
  anchor: Anchor;
  members: Member[];
  messages: ChatMessage[];
  reactions: Reaction[];
  watchlist: WatchlistItem[];
  signals: Signal[];
  /** Se incrementa en cada cambio. El cliente sondea con `?since=<version>`. */
  version: number;
}

/*
 * La sala completa nunca viaja al navegador: lo que se manda lo construye
 * `buildStateDelta` en `sync.ts`, y ahí el hash del PIN no está incluido.
 */
