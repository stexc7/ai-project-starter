/**
 * La sala como función pura: `applyAction(room, action, ctx) -> room`.
 *
 * Aquí no se toca red ni reloj del sistema. Todo lo que depende del exterior
 * (la hora, los identificadores) entra por `ActionContext`, para que la sala
 * entera sea reproducible en un test.
 */

import { COUNTDOWN_MS, pauseAt, scheduleStart, seekTo, stopPlayback } from './playback';
import { EMPTY_SOURCE } from './sources';
import type { ChatMessage, Member, Reaction, Room, Signal, Source, WatchlistItem } from './types';
import { LIMITS } from './validation';

/** Emoji que se pueden usar como reacción y como avatar. */
export const REACTIONS = ['❤️', '😂', '😱', '😭', '🔥', '👀', '🍿', '💀'] as const;
export const AVATARS = ['🐻', '🦊', '🐼', '🐨', '🐯', '🦉', '🐙', '🦄', '🌙', '⭐️'] as const;

/** Cuánto se guarda del chat. Es una sala de dos, no un foro. */
const MAX_MESSAGES = 200;
/** Las reacciones son efímeras: flotan y desaparecen. */
const REACTION_TTL_MS = 20_000;
const MAX_REACTIONS = 20;
/** Sin señales durante este tiempo, se considera que la otra persona no está. */
export const ONLINE_WINDOW_MS = 45_000;
/**
 * La señalización de WebRTC es efímera: si una oferta no se recogió en medio
 * minuto, la llamada ya se está reintentando con otra.
 */
const SIGNAL_TTL_MS = 30_000;
const MAX_SIGNALS = 40;

export type RoomAction =
  | { type: 'set-title'; title: string }
  | { type: 'set-source'; source: Source }
  | { type: 'start'; positionMs: number; countdown: boolean }
  | { type: 'pause' }
  | { type: 'seek'; positionMs: number }
  | { type: 'stop' }
  | { type: 'chat'; text: string }
  | { type: 'react'; emoji: string }
  | { type: 'watchlist-add'; title: string }
  | { type: 'watchlist-remove'; itemId: string }
  | { type: 'signal'; to: string; payload: string }
  | { type: 'ping' };

/**
 * Lo que manda el navegador.
 *
 * Es casi `RoomAction`, salvo la fuente: el cliente manda el enlace tal cual y
 * es el servidor quien decide si eso es YouTube, un archivo o algo con DRM. La
 * clasificación es una decisión de seguridad y no se delega en el navegador.
 */
export type ClientAction =
  | Exclude<RoomAction, { type: 'set-source' }>
  | { type: 'set-source'; url: string };

export interface ActionContext {
  memberId: string;
  serverMs: number;
  /** Generador de identificadores únicos; se inyecta para poder fijarlo en tests. */
  newId: () => string;
}

export interface NewRoomInput {
  code: string;
  pinHash: string;
  serverMs: number;
  member: Member;
}

export function createRoom({ code, pinHash, serverMs, member }: NewRoomInput): Room {
  return {
    code,
    pinHash,
    createdAtServerMs: serverMs,
    title: '',
    source: EMPTY_SOURCE,
    status: 'idle',
    anchor: { atServerMs: serverMs, positionMs: 0 },
    members: [member],
    messages: [],
    reactions: [],
    watchlist: [],
    signals: [],
    version: 1,
  };
}

export function isOnline(member: Member, serverMs: number): boolean {
  return serverMs - member.lastSeenServerMs <= ONLINE_WINDOW_MS;
}

export function findMember(room: Room, memberId: string): Member | undefined {
  return room.members.find((member) => member.id === memberId);
}

/**
 * Añade a alguien o actualiza sus datos si vuelve a entrar. Reentrar desde otro
 * móvil no debe duplicar a la persona en la lista.
 */
export function upsertMember(room: Room, member: Member): Room {
  const existing = room.members.some((current) => current.id === member.id);
  const members = existing
    ? room.members.map((current) => (current.id === member.id ? { ...current, ...member } : current))
    : [...room.members, member];

  return { ...room, members, version: room.version + 1 };
}

function touchMember(members: Member[], memberId: string, serverMs: number): Member[] {
  return members.map((member) =>
    member.id === memberId ? { ...member, lastSeenServerMs: serverMs } : member,
  );
}

function pruneReactions(reactions: Reaction[], serverMs: number): Reaction[] {
  return reactions.filter((reaction) => serverMs - reaction.atServerMs < REACTION_TTL_MS).slice(-MAX_REACTIONS);
}

function pruneSignals(signals: Signal[], serverMs: number): Signal[] {
  return signals.filter((signal) => serverMs - signal.atServerMs < SIGNAL_TTL_MS).slice(-MAX_SIGNALS);
}

/**
 * Aplica una acción ya validada.
 *
 * Cada mensaje y cada reacción se sella con la versión en la que nace (`seq`),
 * para que el cliente pueda pedir "solo lo posterior a la versión X" en vez de
 * descargarse el chat entero cada dos segundos.
 */
export function applyAction(room: Room, action: RoomAction, ctx: ActionContext): Room {
  const { memberId, serverMs, newId } = ctx;
  const version = room.version + 1;

  const base: Room = {
    ...room,
    version,
    members: touchMember(room.members, memberId, serverMs),
    reactions: pruneReactions(room.reactions, serverMs),
    signals: pruneSignals(room.signals, serverMs),
  };

  switch (action.type) {
    case 'ping':
      return base;

    case 'set-title':
      return { ...base, title: action.title };

    case 'set-source':
      // Cambiar de vídeo reinicia la reproducción: seguir en el minuto 42 de
      // otra película no tiene sentido.
      return stopPlayback({ ...base, source: action.source }, serverMs);

    case 'signal': {
      const signal: Signal = {
        id: newId(),
        from: memberId,
        to: action.to,
        payload: action.payload,
        atServerMs: serverMs,
        seq: version,
      };
      return { ...base, signals: [...base.signals, signal].slice(-MAX_SIGNALS) };
    }

    case 'start':
      // Con el vídeo incrustado no hace falta cuenta atrás: la app le da al play
      // a los dos reproductores. Solo se cuenta cuando hay que mover dedos.
      return scheduleStart(base, action.positionMs, serverMs + (action.countdown ? COUNTDOWN_MS : 0));

    case 'pause':
      return pauseAt(base, serverMs);

    case 'seek':
      return seekTo(base, action.positionMs, serverMs);

    case 'stop':
      return stopPlayback(base, serverMs);

    case 'chat': {
      const message: ChatMessage = {
        id: newId(),
        memberId,
        text: action.text,
        atServerMs: serverMs,
        seq: version,
      };
      return { ...base, messages: [...base.messages, message].slice(-MAX_MESSAGES) };
    }

    case 'react': {
      const reaction: Reaction = {
        id: newId(),
        memberId,
        emoji: action.emoji,
        atServerMs: serverMs,
        seq: version,
      };
      return { ...base, reactions: [...base.reactions, reaction].slice(-MAX_REACTIONS) };
    }

    case 'watchlist-add': {
      if (base.watchlist.length >= LIMITS.watchlistItems) return room;
      const item: WatchlistItem = {
        id: newId(),
        title: action.title,
        addedBy: memberId,
        addedAtServerMs: serverMs,
      };
      return { ...base, watchlist: [...base.watchlist, item] };
    }

    case 'watchlist-remove':
      return { ...base, watchlist: base.watchlist.filter((item) => item.id !== action.itemId) };
  }
}
