/**
 * El camino de Upstash, que es el que corre en producción.
 *
 * Aquí se prueba lo que el almacén en memoria nunca ejercita: que las escrituras
 * simultáneas no se pierdan. El almacén en memoria es síncrono y no puede
 * chocar; el de Redis sí, y ahí es donde estaba el fallo — reintentar de
 * inmediato hacía que los que acababan de chocar volvieran a chocar.
 *
 * Pasa de verdad al negociar la llamada de voz, que manda varios candidatos ICE
 * casi a la vez.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRoom } from '@/domain/room';
import type { Room } from '@/domain/types';
import { getRoomStore, resetRoomStoreForTests } from '@/server/store';

const T0 = 1_700_000_000_000;

function newRoom(): Room {
  return createRoom({
    code: 'ABC234',
    pinHash: 'scrypt$aa$bb',
    serverMs: T0,
    member: { id: 'ella', name: 'Ella', emoji: '🦊', lastSeenServerMs: T0 },
  });
}

/**
 * Redis de mentira sobre `fetch`, con contención a demanda.
 *
 * `failCas` dice cuántos intentos de guardado se rechazan antes de dejar pasar
 * uno, que es lo que ocurre cuando otra escritura se ha colado por medio.
 */
function fakeRedis({ failCas = 0 }: { failCas?: number } = {}) {
  let stored: string | null = JSON.stringify(newRoom());
  let remainingFailures = failCas;
  const calls: string[] = [];

  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    const args = JSON.parse(String(init.body)) as unknown[];
    const command = String(args[0]).toUpperCase();
    calls.push(command);

    let result: unknown = null;
    if (command === 'GET') {
      result = stored;
    } else if (command === 'EVAL') {
      if (remainingFailures > 0) {
        remainingFailures -= 1;
        result = 0; // otra escritura ganó la carrera
      } else {
        stored = String(args[5]);
        result = 1;
      }
    }

    return new Response(JSON.stringify({ result }), { status: 200 });
  });

  return { fetchMock, calls, current: () => stored };
}

beforeEach(() => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://ejemplo.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'token-de-prueba';
  resetRoomStoreForTests();
});

afterEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  vi.unstubAllGlobals();
  resetRoomStoreForTests();
});

describe('escrituras que chocan', () => {
  it('una escritura sin competencia entra a la primera', async () => {
    const redis = fakeRedis();
    vi.stubGlobal('fetch', redis.fetchMock);

    const result = await getRoomStore().update('ABC234', (room) => ({ ...room, title: 'Dune' }));

    expect(result.ok).toBe(true);
    expect(result.ok && result.room.title).toBe('Dune');
    expect(redis.calls.filter((c) => c === 'EVAL')).toHaveLength(1);
  });

  it('aguanta una ráfaga de colisiones sin perder el cambio', async () => {
    // Seis choques seguidos es más de lo que produce una negociación de WebRTC.
    const redis = fakeRedis({ failCas: 6 });
    vi.stubGlobal('fetch', redis.fetchMock);

    const result = await getRoomStore().update('ABC234', (room) => ({ ...room, title: 'Dune' }));

    expect(result.ok).toBe(true);
    expect(JSON.parse(redis.current()!).title).toBe('Dune');
  });

  it('cada reintento vuelve a leer: la mutación se aplica sobre lo último', async () => {
    const redis = fakeRedis({ failCas: 3 });
    vi.stubGlobal('fetch', redis.fetchMock);

    await getRoomStore().update('ABC234', (room) => ({ ...room, version: room.version + 1 }));

    // Un GET por cada intento, no uno solo reutilizado.
    const lecturas = redis.calls.filter((c) => c === 'GET').length;
    const escrituras = redis.calls.filter((c) => c === 'EVAL').length;
    expect(lecturas).toBe(escrituras);
    expect(escrituras).toBe(4);
  });

  it('si la contención no cede, se rinde diciéndolo en vez de fingir que guardó', async () => {
    const redis = fakeRedis({ failCas: 999 });
    vi.stubGlobal('fetch', redis.fetchMock);

    const result = await getRoomStore().update('ABC234', (room) => ({ ...room, title: 'Dune' }));

    expect(result).toEqual({ ok: false, reason: 'conflict' });
  });

  it('una sala que no existe se distingue de una colisión', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ result: null }), { status: 200 })),
    );

    const result = await getRoomStore().update('NOEXIS', (room) => room);

    expect(result).toEqual({ ok: false, reason: 'not-found' });
  });
});

describe('errores de Redis', () => {
  it('no propaga el cuerpo de la respuesta, que puede llevar el token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('token=SECRETO-QUE-NO-DEBE-SALIR', { status: 500 })),
    );

    await expect(getRoomStore().get('ABC234')).rejects.toThrow(/Redis respondió 500/);
    await expect(getRoomStore().get('ABC234')).rejects.not.toThrow(/SECRETO/);
  });
});
