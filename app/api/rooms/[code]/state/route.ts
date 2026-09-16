import { buildStateDelta } from '@/domain/sync';
import { isResponse, json, resolveRoomRequest } from '@/server/http';

export const dynamic = 'force-dynamic';

/**
 * Sondeo. Con `?since=<version>` devuelve solo lo que ha cambiado; con
 * `since=0` la sala entera. Esto es lo que evita bajarse el chat completo cada
 * dos segundos.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<Response> {
  const resolved = await resolveRoomRequest(request, (await params).code);
  if (isResponse(resolved)) return resolved;

  const since = Number(new URL(request.url).searchParams.get('since') ?? 0);
  const safeSince = Number.isFinite(since) ? since : 0;

  return json(
    buildStateDelta(resolved.room, {
      since: safeSince,
      serverMs: Date.now(),
      viewerId: resolved.session.memberId,
    }),
  );
}
