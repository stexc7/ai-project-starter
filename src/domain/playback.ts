/**
 * Matemática de la reproducción compartida.
 *
 * Toda la sincronización se apoya en un ancla (`Anchor`): un par
 * (instante del servidor, posición en la película). Nadie transmite "voy por el
 * minuto 42" cada segundo; con el ancla cada móvil calcula el timecode solo.
 */

import type { Anchor, PlaybackPhase, Room } from './types';

/**
 * Lo mínimo que hace falta para situar la reproducción. Se tipa así, y no como
 * `Room`, porque el navegador solo recibe el núcleo de la sala (ver `sync.ts`).
 */
export type PlaybackState = Pick<Room, 'status' | 'anchor'>;

/** Margen para que a los dos les dé tiempo a poner el dedo sobre el play. */
export const COUNTDOWN_MS = 5_000;

/** Por debajo de esto el desfase es imperceptible y no vale la pena corregirlo. */
export const DRIFT_TOLERANCE_MS = 1_500;

/** Un punto de reencuentro tiene que estar lo bastante lejos para llegar a él. */
export const RESYNC_LEAD_MS = 25_000;

/** Salto de los botones de retroceder / adelantar. */
export const SEEK_STEP_MS = 30_000;

export function phaseAt(room: PlaybackState, serverMs: number): PlaybackPhase {
  if (room.status === 'idle') return 'idle';
  if (room.status === 'paused') return 'paused';
  return serverMs < room.anchor.atServerMs ? 'countdown' : 'playing';
}

/** Posición esperada dentro del título, en ms, para un instante dado. */
export function positionAt(room: PlaybackState, serverMs: number): number {
  if (room.status !== 'running') return room.anchor.positionMs;
  const elapsed = serverMs - room.anchor.atServerMs;
  // Durante la cuenta atrás `elapsed` es negativo: la película sigue parada.
  return room.anchor.positionMs + Math.max(0, elapsed);
}

/** Milisegundos que faltan para el "¡dale!". 0 si no hay cuenta atrás. */
export function countdownRemainingMs(room: PlaybackState, serverMs: number): number {
  if (room.status !== 'running') return 0;
  return Math.max(0, room.anchor.atServerMs - serverMs);
}

function withAnchor<T extends PlaybackState>(room: T, status: Room['status'], anchor: Anchor): T {
  return { ...room, status, anchor };
}

/**
 * Programa el arranque: la película estará en `positionMs` cuando el reloj del
 * servidor marque `startServerMs`. Si ese instante es futuro, sale cuenta atrás.
 */
export function scheduleStart<T extends PlaybackState>(
  room: T,
  positionMs: number,
  startServerMs: number,
): T {
  return withAnchor(room, 'running', {
    atServerMs: startServerMs,
    positionMs: Math.max(0, Math.round(positionMs)),
  });
}

export function pauseAt<T extends PlaybackState>(room: T, serverMs: number): T {
  return withAnchor(room, 'paused', {
    atServerMs: serverMs,
    positionMs: positionAt(room, serverMs),
  });
}

/** Mueve la posición sin arrancar: deja la sala en pausa lista para contar. */
export function seekTo<T extends PlaybackState>(room: T, positionMs: number, serverMs: number): T {
  return withAnchor(room, 'paused', {
    atServerMs: serverMs,
    positionMs: Math.max(0, Math.round(positionMs)),
  });
}

export function stopPlayback<T extends PlaybackState>(room: T, serverMs: number): T {
  return withAnchor(room, 'idle', { atServerMs: serverMs, positionMs: 0 });
}

export type DriftVerdict = 'ok' | 'ahead' | 'behind';

export interface DriftAdvice {
  verdict: DriftVerdict;
  /** Positivo: el que reporta va adelantado. Negativo: va atrasado. */
  deltaMs: number;
  /** Punto de la película en el que volver a encontrarse. */
  resyncPositionMs: number;
}

/**
 * Redondea al siguiente minuto entero que esté al menos `RESYNC_LEAD_MS` por
 * delante: un número redondo es mucho más fácil de buscar arrastrando la barra
 * de Netflix que un "43:17".
 */
export function nextResyncPoint(positionMs: number): number {
  const minute = 60_000;
  return Math.ceil((positionMs + RESYNC_LEAD_MS) / minute) * minute;
}

/** Compara dónde dice ir una persona con dónde debería ir la sala. */
export function adviseOnDrift(expectedMs: number, reportedMs: number): DriftAdvice {
  const deltaMs = Math.round(reportedMs - expectedMs);
  const verdict: DriftVerdict =
    Math.abs(deltaMs) <= DRIFT_TOLERANCE_MS ? 'ok' : deltaMs > 0 ? 'ahead' : 'behind';

  return { verdict, deltaMs, resyncPositionMs: nextResyncPoint(expectedMs) };
}

// ─────────────────── Corrección de deriva del reproductor ────────────────

/**
 * Por debajo de esto no se toca nada: corregir se notaría más que el error.
 * 150 ms es el orden de magnitud de un fotograma a 6 fps; nadie lo percibe.
 */
export const DEAD_ZONE_MS = 150;

/** A partir de aquí no vale corregir suave: hay que saltar. */
export const HARD_SEEK_MS = 1_500;

/**
 * Cuánto se puede acelerar o frenar el reproductor, en tanto por uno.
 *
 * Un 5 % es imperceptible en diálogo y recupera un segundo de retraso en veinte
 * segundos. Por encima de eso se nota que las voces van raras.
 */
export const MAX_RATE_ADJUST = 0.05;

export type Correction =
  | { action: 'hold'; rate: 1 }
  | { action: 'nudge'; rate: number }
  | { action: 'seek'; toMs: number; rate: 1 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Decide qué hacerle al reproductor para que llegue a donde debería estar.
 *
 * Es la misma idea que usan Teleparty o Hearo: saltar solo cuando el desfase ya
 * es visible, y el resto del tiempo corregir cambiando la velocidad un pelín,
 * que no se nota. Saltar por cada décima daría tirones constantes.
 *
 * @param targetMs Dónde debería ir, según el ancla de la sala.
 * @param actualMs Dónde va de verdad el reproductor.
 */
export function reconcile(targetMs: number, actualMs: number): Correction {
  const driftMs = actualMs - targetMs;
  const magnitude = Math.abs(driftMs);

  if (magnitude <= DEAD_ZONE_MS) return { action: 'hold', rate: 1 };
  if (magnitude >= HARD_SEEK_MS) return { action: 'seek', toMs: Math.max(0, targetMs), rate: 1 };

  // Adelantado (drift > 0) → frenar. Atrasado → acelerar. Proporcional al
  // desfase, para que la corrección se suavice sola al acercarse.
  const ratio = clamp(driftMs / HARD_SEEK_MS, -1, 1);
  const rate = Number((1 - ratio * MAX_RATE_ADJUST).toFixed(3));

  return { action: 'nudge', rate };
}
