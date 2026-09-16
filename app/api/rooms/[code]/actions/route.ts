import { randomUUID } from 'node:crypto';

import { applyAction } from '@/domain/room';
import { buildStateDelta } from '@/domain/sync';
import { parseAction } from '@/server/actions';
import { fail, isResponse, json, readJsonBody, resolveRoomRequest } from '@/server/http';
import { getRoomStore } from '@/server/store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const resolved = await resolveRoomRequest(request, (await params).code);
  if (isResponse(resolved)) return resolved;

  const parsed = parseAction(await readJsonBody(request));
  if (!parsed.ok) return fail(400, parsed.error);

  const serverMs = Date.now();
  const updated = await getRoomStore().update(resolved.room.code, (current) =>
    applyAction(current, parsed.value, {
      memberId: resolved.session.memberId,
      serverMs,
      newId: randomUUID,
    }),
  );

  if (!updated.ok) {
    return updated.reason === 'not-found'
      ? fail(404, 'Esa sala ya no existe.')
      : fail(409, 'Os habéis pisado al escribir. Repite la acción.');
  }

  // Se responde con la sala completa: quien acaba de actuar quiere verlo ya.
  return json(
    buildStateDelta(updated.room, {
      since: 0,
      serverMs,
      viewerId: resolved.session.memberId,
    }),
  );
}
