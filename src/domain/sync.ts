/**
 * Protocolo de sondeo entre el navegador y la API.
 *
 * No hay WebSockets: en Vercel las funciones son efímeras y mantener una
 * conexión abierta para dos personas no compensa. El cliente pregunta cada
 * pocos segundos, pero **la precisión del arranque no depende de eso**: viaja en
 * el ancla, con un instante absoluto del reloj del servidor. El sondeo solo
 * trae chat, presencia y cambios de estado, donde un par de segundos no importa.
 */

import { phaseAt } from './playback';
import type { ChatMessage, Member, Reaction, Room, Signal, Source, WatchlistItem } from './types';

/** Estado de la sala sin las listas incrementales. Es lo que se manda entero. */
export interface RoomCore {
  code: string;
  title: string;
  source: Source;
  status: Room['status'];
  anchor: Room['anchor'];
  members: Member[];
  watchlist: WatchlistItem[];
  version: number;
}

export interface StateDelta {
  serverMs: number;
  version: number;
  /** Cuándo volver a preguntar. Lo decide el servidor según la fase. */
  nextPollMs: number;
  /** `true` cuando el cliente debe reemplazar su estado en vez de fusionarlo. */
  full: boolean;
  /** Ausente si nada cambió desde `since`. */
  room?: RoomCore;
  messages: ChatMessage[];
  reactions: Reaction[];
  /** Solo las dirigidas a quien pregunta. Ver `buildStateDelta`. */
  signals: Signal[];
}

/** Durante la cuenta atrás conviene enterarse rápido de una cancelación. */
const POLL_COUNTDOWN_MS = 1_000;
/**
 * Mientras se está montando la llamada, el sondeo es el cable por el que viajan
 * la oferta, la respuesta y los candidatos de red. A ritmo normal, abrir el
 * audio tarda seis segundos; así tarda uno o dos. Dura lo que dura negociar.
 */
const POLL_NEGOTIATING_MS = 600;
const NEGOTIATION_WINDOW_MS = 10_000;
/** Reproduciendo no cambia nada salvo que alguien escriba. */
const POLL_PLAYING_MS = 2_500;
const POLL_IDLE_MS = 2_000;

export function pollIntervalFor(room: Room, serverMs: number): number {
  const negotiating = room.signals.some(
    (signal) => serverMs - signal.atServerMs < NEGOTIATION_WINDOW_MS,
  );
  if (negotiating) return POLL_NEGOTIATING_MS;

  switch (phaseAt(room, serverMs)) {
    case 'countdown':
      return POLL_COUNTDOWN_MS;
    case 'playing':
      return POLL_PLAYING_MS;
    default:
      return POLL_IDLE_MS;
  }
}

function toCore(room: Room): RoomCore {
  return {
    code: room.code,
    title: room.title,
    source: room.source,
    status: room.status,
    anchor: room.anchor,
    members: room.members,
    watchlist: room.watchlist,
    version: room.version,
  };
}

export interface DeltaRequest {
  /** Última versión que el cliente ya tiene. 0 para pedirlo todo. */
  since: number;
  serverMs: number;
  /** Quién pregunta. Decide qué señales de WebRTC le tocan. */
  viewerId: string;
}

/**
 * Construye la respuesta mínima para un cliente que ya está en la versión
 * `since`. Con `since = 0` devuelve la sala completa.
 *
 * Las señales de WebRTC **se filtran por destinatario**: son punto a punto y no
 * tienen por qué pasar por delante de nadie más.
 */
export function buildStateDelta(room: Room, { since, serverMs, viewerId }: DeltaRequest): StateDelta {
  const nextPollMs = pollIntervalFor(room, serverMs);
  const full = since <= 0 || since > room.version;

  /*
   * Las señales son **eventos**, no estado: reenviar una ya consumida rompe la
   * llamada, porque el otro lado vuelve a aplicar una oferta que ya negoció.
   * Por eso nunca van en una respuesta completa — y una respuesta completa es
   * justo lo que devuelve el endpoint de acciones.
   *
   * Con `since <= 0` el cliente acaba de llegar: lo que hubiera pendiente es de
   * antes de que estuviera, y ya no sirve.
   */
  const signals =
    since <= 0
      ? []
      : room.signals.filter((signal) => signal.to === viewerId && signal.seq > since);

  if (!full && since === room.version) {
    return { serverMs, version: room.version, nextPollMs, full: false, messages: [], reactions: [], signals };
  }

  return {
    serverMs,
    version: room.version,
    nextPollMs,
    full,
    room: toCore(room),
    messages: full ? room.messages : room.messages.filter((message) => message.seq > since),
    reactions: full ? room.reactions : room.reactions.filter((reaction) => reaction.seq > since),
    signals,
  };
}

// ───────────────────────── Fusión en el cliente ──────────────────────────

/** Lo que el navegador mantiene en memoria sobre la sala. */
export interface ClientRoomState {
  core: RoomCore | null;
  messages: ChatMessage[];
  reactions: Reaction[];
  version: number;
}

export const EMPTY_CLIENT_STATE: ClientRoomState = {
  core: null,
  messages: [],
  reactions: [],
  version: 0,
};

/** Debe coincidir con `REACTION_TTL_MS` de `room.ts`: son efímeras. */
const REACTION_VISIBLE_MS = 20_000;

function appendNew<T extends { id: string }>(current: T[], incoming: T[], limit: number): T[] {
  if (incoming.length === 0) return current;

  const known = new Set(current.map((item) => item.id));
  const added = incoming.filter((item) => !known.has(item.id));
  return added.length === 0 ? current : [...current, ...added].slice(-limit);
}

const MAX_CLIENT_MESSAGES = 200;
const MAX_CLIENT_REACTIONS = 20;

/**
 * Aplica una respuesta del servidor sobre el estado local.
 *
 * Si nada cambió devuelve **el mismo objeto**, para que React no vuelva a
 * pintar cada dos segundos sin motivo.
 */
export function mergeDelta(state: ClientRoomState, delta: StateDelta): ClientRoomState {
  // Las señales no se acumulan en el estado: se consumen al llegar (ver
  // `useVoiceCall`). Aquí solo interesa si cambió algo que haya que pintar.
  if (!delta.room) return state;

  if (delta.full) {
    return {
      core: delta.room,
      messages: delta.messages,
      reactions: delta.reactions,
      version: delta.version,
    };
  }

  return {
    core: delta.room,
    messages: appendNew(state.messages, delta.messages, MAX_CLIENT_MESSAGES),
    reactions: appendNew(state.reactions, delta.reactions, MAX_CLIENT_REACTIONS).filter(
      (reaction) => delta.serverMs - reaction.atServerMs < REACTION_VISIBLE_MS,
    ),
    version: delta.version,
  };
}
