/** Utilidades compartidas por las rutas de la API. */

import { cookies } from 'next/headers';

import { normalizeRoomCode, ROOM_CODE_LENGTH } from '@/domain/codes';
import type { Room } from '@/domain/types';
import { readSessionToken, sessionCookieName, type Session } from './auth';
import { getRoomStore } from './store';

/** Nada de lo que devuelve esta API se puede cachear: todo es estado vivo. */
const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return Response.json(data, { status, headers: { ...NO_STORE, ...headers } });
}

/** Error con mensaje ya redactado para enseñárselo a la persona. */
export function fail(status: number, error: string): Response {
  return json({ error }, status);
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export interface RoomRequest {
  room: Room;
  session: Session;
}

/**
 * De dónde sale el token de sesión.
 *
 * La app web usa una cookie `httpOnly`. La extensión de escritorio no puede:
 * sus peticiones salen desde netflix.com y la cookie es `SameSite=Lax`, así que
 * no viajaría. Por eso se acepta también `Authorization: Bearer`.
 */
function tokenFrom(request: Request, jar: Awaited<ReturnType<typeof cookies>>, code: string) {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length).trim();
  return jar.get(sessionCookieName(code))?.value;
}

/**
 * Resuelve `code` + sesión. Devuelve una `Response` de error lista para
 * retornar, o el par sala/sesión ya verificado.
 */
export async function resolveRoomRequest(
  request: Request,
  rawCode: string,
): Promise<RoomRequest | Response> {
  const code = normalizeRoomCode(rawCode);
  if (code.length !== ROOM_CODE_LENGTH) return fail(400, 'Ese código de sala no tiene buena pinta.');

  const jar = await cookies();
  const session = readSessionToken(tokenFrom(request, jar, code), code);
  if (!session) return fail(401, 'Tu sesión ha caducado. Vuelve a entrar con el PIN.');

  const room = await getRoomStore().get(code);
  if (!room) return fail(404, 'Esa sala ya no existe.');

  // La sesión es válida pero la persona pudo ser eliminada o la sala recreada.
  if (!room.members.some((member) => member.id === session.memberId)) {
    return fail(401, 'Ya no estás en esta sala. Vuelve a entrar con el PIN.');
  }

  return { room, session };
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
