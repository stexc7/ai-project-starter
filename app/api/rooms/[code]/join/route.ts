import { cookies } from 'next/headers';

import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/domain/codes';
import { AVATARS, upsertMember } from '@/domain/room';
import { parseDisplayName, parseEmoji, parsePin } from '@/domain/validation';
import {
  createSessionToken,
  newMemberId,
  readSessionToken,
  sessionCookieName,
  sessionCookieOptions,
  verifyPin,
} from '@/server/auth';
import { fail, json, readJsonBody } from '@/server/http';
import { getRoomStore } from '@/server/store';

export const dynamic = 'force-dynamic';

/**
 * El PIN son cuatro dígitos: 10.000 combinaciones. El código de sala ya es el
 * secreto fuerte, pero sin freno alguien con el código podría probarlas todas.
 */
const MAX_PIN_ATTEMPTS = 10;
const LOCKOUT_SECONDS = 15 * 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const code = normalizeRoomCode((await params).code);
  if (code.length !== ROOM_CODE_LENGTH) return fail(400, 'Ese código de sala no tiene buena pinta.');

  const body = await readJsonBody(request);

  const name = parseDisplayName(body.name);
  if (!name.ok) return fail(400, name.error);

  const emoji = parseEmoji(body.emoji, AVATARS);
  if (!emoji.ok) return fail(400, emoji.error);

  const pin = parsePin(body.pin);
  if (!pin.ok) return fail(400, pin.error);

  const store = getRoomStore();

  if ((await store.attempts(code)) >= MAX_PIN_ATTEMPTS) {
    return fail(429, 'Demasiados intentos fallidos. Prueba dentro de 15 minutos.');
  }

  const room = await store.get(code);
  // Mismo mensaje que con el PIN incorrecto: así no se puede averiguar qué
  // códigos de sala existen probando uno a uno.
  if (!room || !verifyPin(pin.value, room.pinHash)) {
    await store.recordAttempt(code, LOCKOUT_SECONDS);
    return fail(401, 'El código o el PIN no son correctos.');
  }

  // Si ya había una sesión válida para esta sala, se conserva el mismo miembro:
  // volver a entrar desde el mismo móvil no debe crear un duplicado.
  const jar = await cookies();
  const existing = readSessionToken(jar.get(sessionCookieName(code))?.value, code);
  const memberId = existing?.memberId ?? newMemberId();

  const serverMs = Date.now();
  const updated = await store.update(code, (current) =>
    upsertMember(current, {
      id: memberId,
      name: name.value,
      emoji: emoji.value,
      lastSeenServerMs: serverMs,
    }),
  );

  if (!updated.ok) {
    return updated.reason === 'not-found'
      ? fail(404, 'Esa sala ya no existe.')
      : fail(409, 'La sala estaba ocupada escribiendo. Inténtalo otra vez.');
  }

  const token = createSessionToken({
    code,
    memberId,
    name: name.value,
    emoji: emoji.value,
    iat: serverMs,
  });

  jar.set(sessionCookieName(code), token, sessionCookieOptions);

  /*
   * La extensión de escritorio necesita el token en el cuerpo: no puede leer una
   * cookie `httpOnly`, y desde netflix.com la cookie ni siquiera viaja.
   *
   * Solo se entrega a quien acaba de acertar el PIN, así que no abre nada que no
   * estuviera ya abierto. La app web no lo pide y conserva su cookie `httpOnly`.
   */
  const wantToken = body.wantToken === true;

  return json(wantToken ? { code, serverMs, token, memberId } : { code, serverMs });
}
