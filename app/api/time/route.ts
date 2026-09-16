/**
 * El reloj compartido. Es el endpoint más importante de la aplicación y el más
 * simple: lo único que hace falta es que responda rápido y sin caché.
 */

export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json({ serverMs: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
}
