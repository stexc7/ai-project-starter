import { describe, expect, it } from 'vitest';

import { COUNTDOWN_MS, phaseAt, positionAt } from '@/domain/playback';
import { applyAction, createRoom, isOnline, upsertMember, type ActionContext } from '@/domain/room';
import type { Member, Room } from '@/domain/types';
import { LIMITS } from '@/domain/validation';

const T0 = 1_700_000_000_000;

const ella: Member = { id: 'ella', name: 'Ella', emoji: '🦊', lastSeenServerMs: T0 };
const el: Member = { id: 'el', name: 'Él', emoji: '🐻', lastSeenServerMs: T0 };

function newRoom(): Room {
  return createRoom({ code: 'ABC234', pinHash: 'scrypt$aa$bb', serverMs: T0, member: ella });
}

/** Identificadores predecibles: así se puede afirmar sobre ellos en el test. */
function context(memberId: string, serverMs: number): ActionContext {
  let counter = 0;
  return { memberId, serverMs, newId: () => `id-${(counter += 1)}` };
}

describe('entrada en la sala', () => {
  it('quien entra se suma a la lista', () => {
    const room = upsertMember(newRoom(), el);

    expect(room.members.map((member) => member.id)).toEqual(['ella', 'el']);
    expect(room.version).toBe(2);
  });

  it('volver a entrar desde el mismo móvil no duplica a la persona', () => {
    const room = upsertMember(upsertMember(newRoom(), el), {
      ...el,
      name: 'Él otra vez',
      lastSeenServerMs: T0 + 5_000,
    });

    expect(room.members).toHaveLength(2);
    expect(room.members[1].name).toBe('Él otra vez');
  });

  it('sin señales durante 45 segundos se considera desconectada', () => {
    expect(isOnline(ella, T0 + 44_000)).toBe(true);
    expect(isOnline(ella, T0 + 46_000)).toBe(false);
  });
});

describe('acciones sobre la sala', () => {
  it('cada acción sube la versión y refresca la presencia de quien actúa', () => {
    const room = applyAction(upsertMember(newRoom(), el), { type: 'ping' }, context('el', T0 + 30_000));

    expect(room.version).toBe(3);
    expect(room.members.find((member) => member.id === 'el')!.lastSeenServerMs).toBe(T0 + 30_000);
    expect(room.members.find((member) => member.id === 'ella')!.lastSeenServerMs).toBe(T0);
  });

  it('empezar programa el arranque con el margen de la cuenta atrás', () => {
    const room = applyAction(newRoom(), { type: 'start', positionMs: 0, countdown: true }, context('ella', T0));

    expect(room.anchor.atServerMs).toBe(T0 + COUNTDOWN_MS);
    expect(phaseAt(room, T0)).toBe('countdown');
    expect(phaseAt(room, T0 + COUNTDOWN_MS + 1)).toBe('playing');
  });

  it('cancelar durante la cuenta atrás deja la película donde estaba', () => {
    const started = applyAction(newRoom(), { type: 'start', positionMs: 300_000, countdown: true }, context('ella', T0));
    const cancelled = applyAction(started, { type: 'pause' }, context('ella', T0 + 2_000));

    expect(cancelled.status).toBe('paused');
    expect(positionAt(cancelled, T0 + 2_000)).toBe(300_000);
  });

  it('el título es compartido', () => {
    const room = applyAction(newRoom(), { type: 'set-title', title: 'Dune' }, context('ella', T0));
    expect(room.title).toBe('Dune');
  });
});

describe('chat y reacciones', () => {
  it('los mensajes se sellan con la versión en la que nacen', () => {
    const room = applyAction(newRoom(), { type: 'chat', text: 'hola' }, context('ella', T0));

    expect(room.messages).toHaveLength(1);
    expect(room.messages[0]).toMatchObject({ memberId: 'ella', text: 'hola', seq: room.version });
  });

  it('el chat no crece sin límite', () => {
    let room = newRoom();
    for (let i = 0; i < 250; i += 1) {
      room = applyAction(room, { type: 'chat', text: `mensaje ${i}` }, context('ella', T0 + i));
    }

    expect(room.messages).toHaveLength(200);
    expect(room.messages[0].text).toBe('mensaje 50');
  });

  it('las reacciones viejas se caen solas', () => {
    const conReaccion = applyAction(newRoom(), { type: 'react', emoji: '❤️' }, context('ella', T0));
    const masTarde = applyAction(conReaccion, { type: 'ping' }, context('ella', T0 + 25_000));

    expect(conReaccion.reactions).toHaveLength(1);
    expect(masTarde.reactions).toHaveLength(0);
  });
});

describe('lista de qué ver', () => {
  it('se añade y se quita por identificador', () => {
    const added = applyAction(newRoom(), { type: 'watchlist-add', title: 'Dune' }, context('ella', T0));
    const itemId = added.watchlist[0].id;
    const removed = applyAction(added, { type: 'watchlist-remove', itemId }, context('el', T0));

    expect(added.watchlist[0]).toMatchObject({ title: 'Dune', addedBy: 'ella' });
    expect(removed.watchlist).toHaveLength(0);
  });

  it('con la lista llena, añadir no cambia nada', () => {
    let room = newRoom();
    for (let i = 0; i < LIMITS.watchlistItems; i += 1) {
      room = applyAction(room, { type: 'watchlist-add', title: `peli ${i}` }, context('ella', T0));
    }

    const rejected = applyAction(room, { type: 'watchlist-add', title: 'una más' }, context('ella', T0));

    expect(rejected.watchlist).toHaveLength(LIMITS.watchlistItems);
    expect(rejected.version).toBe(room.version);
  });
});
