/**
 * Traduce el cuerpo JSON de `POST /api/rooms/[code]/actions` a una `RoomAction`.
 *
 * Todo lo que llega del navegador pasa por aquí antes de tocar la sala: el
 * reducer de `domain/room.ts` da por hecho que recibe acciones ya validadas.
 */

import { REACTIONS, type RoomAction } from '@/domain/room';
import { parseSource } from '@/domain/sources';
import {
  parseChatText,
  parseEmoji,
  parsePositionMs,
  parseTitle,
  parseWatchlistTitle,
  type Validated,
} from '@/domain/validation';

const fail = (error: string): Validated<RoomAction> => ({ ok: false, error });

/** Una oferta SDP ronda los 4 KB; 16 KB deja margen de sobra sin abrir la mano. */
const MAX_SIGNAL_BYTES = 16 * 1024;

export function parseAction(body: Record<string, unknown>): Validated<RoomAction> {
  const type = body.type;

  switch (type) {
    case 'ping':
    case 'pause':
    case 'stop':
      return { ok: true, value: { type } };

    case 'set-title': {
      const title = parseTitle(body.title);
      return title.ok ? { ok: true, value: { type, title: title.value } } : fail(title.error);
    }

    case 'seek': {
      const position = parsePositionMs(body.positionMs);
      return position.ok ? { ok: true, value: { type, positionMs: position.value } } : fail(position.error);
    }

    case 'start': {
      const position = parsePositionMs(body.positionMs);
      return position.ok
        ? { ok: true, value: { type, positionMs: position.value, countdown: body.countdown === true } }
        : fail(position.error);
    }

    case 'set-source': {
      const source = parseSource(body.url);
      return source.ok ? { ok: true, value: { type, source: source.value } } : fail(source.error);
    }

    case 'signal': {
      const to = body.to;
      const payload = body.payload;
      if (typeof to !== 'string' || to.length === 0) return fail('Falta a quién va la señal.');
      // Es JSON opaco de WebRTC: no se interpreta, solo se acota y se reenvía.
      if (typeof payload !== 'string' || payload.length === 0) return fail('Señal vacía.');
      if (payload.length > MAX_SIGNAL_BYTES) return fail('Señal demasiado grande.');
      return { ok: true, value: { type, to, payload } };
    }

    case 'chat': {
      const text = parseChatText(body.text);
      return text.ok ? { ok: true, value: { type, text: text.value } } : fail(text.error);
    }

    case 'react': {
      const emoji = parseEmoji(body.emoji, REACTIONS);
      return emoji.ok ? { ok: true, value: { type, emoji: emoji.value } } : fail(emoji.error);
    }

    case 'watchlist-add': {
      const title = parseWatchlistTitle(body.title);
      return title.ok ? { ok: true, value: { type, title: title.value } } : fail(title.error);
    }

    case 'watchlist-remove': {
      const itemId = body.itemId;
      if (typeof itemId !== 'string' || itemId.length === 0) return fail('Falta qué elemento borrar.');
      return { ok: true, value: { type, itemId } };
    }

    default:
      return fail('Esa acción no existe.');
  }
}
