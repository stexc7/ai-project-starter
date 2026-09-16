import { describe, expect, it } from 'vitest';

import { applyAction, createRoom } from '@/domain/room';
import {
  buildStateDelta,
  EMPTY_CLIENT_STATE,
  mergeDelta,
  type ClientRoomState,
} from '@/domain/sync';
import type { Room } from '@/domain/types';

const T0 = 1_700_000_000_000;

function roomWithChat(): Room {
  let room = createRoom({
    code: 'ABC234',
    pinHash: 'scrypt$aa$bb',
    serverMs: T0,
    member: { id: 'ella', name: 'Ella', emoji: '🦊', lastSeenServerMs: T0 },
  });

  let counter = 0;
  for (const text of ['uno', 'dos', 'tres']) {
    room = applyAction(room, { type: 'chat', text }, {
      memberId: 'ella',
      serverMs: T0,
      newId: () => `m${(counter += 1)}`,
    });
  }

  return room;
}

describe('lo que manda el servidor', () => {
  it('nunca incluye el hash del PIN', () => {
    const delta = buildStateDelta(roomWithChat(), { since: 0, serverMs: T0, viewerId: 'ella' });

    expect(delta.room).toBeDefined();
    expect(JSON.stringify(delta)).not.toContain('scrypt');
  });

  it('con since = 0 manda la sala entera', () => {
    const delta = buildStateDelta(roomWithChat(), { since: 0, serverMs: T0, viewerId: 'ella' });

    expect(delta.full).toBe(true);
    expect(delta.messages).toHaveLength(3);
  });

  it('si el cliente está al día, no manda la sala', () => {
    const room = roomWithChat();
    const delta = buildStateDelta(room, { since: room.version, serverMs: T0, viewerId: 'ella' });

    expect(delta.room).toBeUndefined();
    expect(delta.messages).toHaveLength(0);
    expect(delta.version).toBe(room.version);
  });

  it('manda solo los mensajes posteriores a la versión que trae el cliente', () => {
    const room = roomWithChat();
    const delta = buildStateDelta(room, { since: room.version - 1, serverMs: T0, viewerId: 'ella' });

    expect(delta.full).toBe(false);
    expect(delta.messages.map((message) => message.text)).toEqual(['tres']);
  });

  it('una versión futura (sala recreada) fuerza recarga completa', () => {
    const room = roomWithChat();
    const delta = buildStateDelta(room, { since: room.version + 99, serverMs: T0, viewerId: 'ella' });

    expect(delta.full).toBe(true);
    expect(delta.messages).toHaveLength(3);
  });

  it('sondea más a menudo durante la cuenta atrás que reproduciendo', () => {
    const room = roomWithChat();
    const counting = applyAction(room, { type: 'start', positionMs: 0, countdown: true }, {
      memberId: 'ella',
      serverMs: T0,
      newId: () => 'x',
    });

    expect(buildStateDelta(counting, { since: 0, serverMs: T0, viewerId: 'ella' }).nextPollMs).toBeLessThan(
      buildStateDelta(counting, { since: 0, serverMs: T0 + 60_000, viewerId: 'ella' }).nextPollMs,
    );
  });
});

describe('señales de la llamada', () => {
  function withSignal(to: string) {
    return applyAction(roomWithChat(), { type: 'signal', to, payload: '{"kind":"candidate"}' }, {
      memberId: 'ella',
      serverMs: T0,
      newId: () => 's1',
    });
  }

  it('cada quien recibe solo las suyas', () => {
    const room = withSignal('el');
    const since = room.version - 1;

    const paraEl = buildStateDelta(room, { since, serverMs: T0, viewerId: 'el' });
    const paraEllaFrom = buildStateDelta(room, { since, serverMs: T0, viewerId: 'ella' });

    expect(paraEl.signals).toHaveLength(1);
    // Quien la mandó no se la recibe de vuelta.
    expect(paraEllaFrom.signals).toHaveLength(0);
  });

  it('un tercero no ve la negociación de los otros dos', () => {
    const room = withSignal('el');
    const delta = buildStateDelta(room, { since: room.version - 1, serverMs: T0, viewerId: 'curioso' });
    expect(delta.signals).toHaveLength(0);
  });

  it('una respuesta completa no las reenvía', () => {
    // El endpoint de acciones responde con `since: 0`. Si ahí viajaran las
    // señales, cada acción reenviaría la oferta ya negociada y tumbaría la
    // llamada.
    const delta = buildStateDelta(withSignal('el'), { since: 0, serverMs: T0, viewerId: 'el' });

    expect(delta.full).toBe(true);
    expect(delta.signals).toHaveLength(0);
  });

  it('mientras se negocia, el sondeo se acelera', () => {
    const tranquila = buildStateDelta(roomWithChat(), { since: 1, serverMs: T0, viewerId: 'el' });
    const negociando = buildStateDelta(withSignal('el'), { since: 1, serverMs: T0, viewerId: 'el' });

    expect(negociando.nextPollMs).toBeLessThan(tranquila.nextPollMs);

    // Y vuelve al ritmo normal cuando la negociación ya no está en curso.
    const despues = buildStateDelta(withSignal('el'), { since: 1, serverMs: T0 + 20_000, viewerId: 'el' });
    expect(despues.nextPollMs).toBe(tranquila.nextPollMs);
  });

  it('se entregan una sola vez', () => {
    const room = withSignal('el');

    // Primer sondeo tras crearse la señal: llega.
    const primera = buildStateDelta(room, { since: room.version - 1, serverMs: T0, viewerId: 'el' });
    expect(primera.signals).toHaveLength(1);

    // El siguiente sondeo ya va con la versión nueva: no se repite, o se
    // aplicaría dos veces la misma oferta y la llamada se rompería.
    const segunda = buildStateDelta(room, { since: room.version, serverMs: T0, viewerId: 'el' });
    expect(segunda.signals).toHaveLength(0);
  });

  it('las viejas se caen solas: media hora después ya no sirven', () => {
    const room = withSignal('el');
    const later = applyAction(room, { type: 'ping' }, {
      memberId: 'ella',
      serverMs: T0 + 60_000,
      newId: () => 'x',
    });

    expect(later.signals).toHaveLength(0);
  });
});

describe('fusión en el cliente', () => {
  it('la primera respuesta reemplaza el estado vacío', () => {
    const merged = mergeDelta(EMPTY_CLIENT_STATE, buildStateDelta(roomWithChat(), { since: 0, serverMs: T0, viewerId: 'ella' }));

    expect(merged.messages).toHaveLength(3);
    expect(merged.core?.code).toBe('ABC234');
  });

  it('un delta añade lo nuevo sin perder lo anterior', () => {
    const room = roomWithChat();
    const state = mergeDelta(EMPTY_CLIENT_STATE, buildStateDelta(room, { since: 0, serverMs: T0, viewerId: 'ella' }));

    const withMore = applyAction(room, { type: 'chat', text: 'cuatro' }, {
      memberId: 'el',
      serverMs: T0,
      newId: () => 'm4',
    });
    const merged = mergeDelta(state, buildStateDelta(withMore, { since: state.version, serverMs: T0, viewerId: 'ella' }));

    expect(merged.messages.map((message) => message.text)).toEqual(['uno', 'dos', 'tres', 'cuatro']);
  });

  it('un mensaje repetido no se duplica', () => {
    const room = roomWithChat();
    const state = mergeDelta(EMPTY_CLIENT_STATE, buildStateDelta(room, { since: 0, serverMs: T0, viewerId: 'ella' }));
    // El mismo delta dos veces: pasa al reintentar una petición que sí llegó.
    const twice = mergeDelta(mergeDelta(state, buildStateDelta(room, { since: 0, serverMs: T0, viewerId: 'ella' })), buildStateDelta(room, { since: 0, serverMs: T0, viewerId: 'ella' }));

    expect(twice.messages).toHaveLength(3);
  });

  it('sin cambios devuelve el mismo objeto, para no repintar', () => {
    const room = roomWithChat();
    const state: ClientRoomState = mergeDelta(EMPTY_CLIENT_STATE, buildStateDelta(room, { since: 0, serverMs: T0, viewerId: 'ella' }));
    const again = mergeDelta(state, buildStateDelta(room, { since: room.version, serverMs: T0, viewerId: 'ella' }));

    expect(again).toBe(state);
  });

  it('las reacciones caducadas no se quedan pegadas en pantalla', () => {
    const room = applyAction(roomWithChat(), { type: 'react', emoji: '❤️' }, {
      memberId: 'ella',
      serverMs: T0,
      newId: () => 'r1',
    });

    const fresh = mergeDelta(EMPTY_CLIENT_STATE, buildStateDelta(room, { since: 0, serverMs: T0, viewerId: 'ella' }));
    const later = mergeDelta(fresh, buildStateDelta(room, { since: fresh.version - 1, serverMs: T0 + 30_000, viewerId: 'ella' }));

    expect(fresh.reactions).toHaveLength(1);
    expect(later.reactions).toHaveLength(0);
  });
});
