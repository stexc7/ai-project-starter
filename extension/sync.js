/*
 * Matemática de sincronización para la extensión.
 *
 * ⚠️ ESPEJO DE `src/domain/playback.ts`. Las dos copias tienen que dar
 * exactamente lo mismo: hay un test (`tests/extension-sync.test.ts`) que compara
 * las dos con cientos de entradas y falla si se separan.
 *
 * Existe duplicado porque una extensión de Chrome carga archivos sueltos, sin
 * empaquetador ni TypeScript, y meter un paso de build por cuarenta líneas
 * costaría más de lo que ahorra.
 */

globalThis.JuntosSync = (() => {
  const DEAD_ZONE_MS = 150;
  const HARD_SEEK_MS = 1500;
  const MAX_RATE_ADJUST = 0.05;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /** Posición esperada dentro del título, en ms, para un instante dado. */
  function positionAt(room, serverMs) {
    if (room.status !== 'running') return room.anchor.positionMs;
    return room.anchor.positionMs + Math.max(0, serverMs - room.anchor.atServerMs);
  }

  /** `'idle' | 'countdown' | 'playing' | 'paused'` */
  function phaseAt(room, serverMs) {
    if (room.status === 'idle') return 'idle';
    if (room.status === 'paused') return 'paused';
    return serverMs < room.anchor.atServerMs ? 'countdown' : 'playing';
  }

  /** Qué hacerle al reproductor para que llegue a donde debería estar. */
  function reconcile(targetMs, actualMs) {
    const driftMs = actualMs - targetMs;
    const magnitude = Math.abs(driftMs);

    if (magnitude <= DEAD_ZONE_MS) return { action: 'hold', rate: 1 };
    if (magnitude >= HARD_SEEK_MS) return { action: 'seek', toMs: Math.max(0, targetMs), rate: 1 };

    const ratio = clamp(driftMs / HARD_SEEK_MS, -1, 1);
    return { action: 'nudge', rate: Number((1 - ratio * MAX_RATE_ADJUST).toFixed(3)) };
  }

  return { DEAD_ZONE_MS, HARD_SEEK_MS, MAX_RATE_ADJUST, positionAt, phaseAt, reconcile };
})();
