import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

import { createRoomCode } from '@/domain/codes';
import { AVATARS, createRoom } from '@/domain/room';
import { parseDisplayName, parseEmoji, parsePin } from '@/domain/validation';
import {
  createSessionToken,
  hashPin,
  newMemberId,
  sessionCookieName,
  sessionCookieOptions,
} from '@/server/auth';
import { fail, json, readJsonBody } from '@/server/http';
import { getRoomStore } from '@/server/store';

export const dynamic = 'force-dynamic';

/** Colisionar seis caracteres es improbable, pero no imposible. */
const MAX_CODE_ATTEMPTS = 5;

export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request);

  const name = parseDisplayName(body.name);
  if (!name.ok) return fail(400, name.error);

  const emoji = parseEmoji(body.emoji, AVATARS);
  if (!emoji.ok) return fail(400, emoji.error);

  const pin = parsePin(body.pin);
  if (!pin.ok) return fail(400, pin.error);

  const store = getRoomStore();
  const serverMs = Date.now();
  const memberId = newMemberId();
  const pinHash = hashPin(pin.value);

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = createRoomCode((size) => new Uint8Array(randomBytes(size)));
    const room = createRoom({
      code,
      pinHash,
      serverMs,
      member: { id: memberId, name: name.value, emoji: emoji.value, lastSeenServerMs: serverMs },
    });

    if (!(await store.create(room))) continue;

    const jar = await cookies();
    jar.set(
      sessionCookieName(code),
      createSessionToken({ code, memberId, name: name.value, emoji: emoji.value, iat: serverMs }),
      sessionCookieOptions,
    );

    return json({ code, serverMs }, 201);
  }

  return fail(503, 'No se ha podido crear la sala. Inténtalo otra vez.');
}
