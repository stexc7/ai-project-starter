/**
 * Sincronización de reloj estilo NTP.
 *
 * Es la pieza de la que depende todo lo demás: si los dos móviles no coinciden
 * en qué hora es, la cuenta atrás no sirve de nada. En vez de mandar "dale play
 * ya" (que llega tarde y desigual), el servidor fija un instante absoluto y cada
 * móvil lo traduce a su propio reloj.
 */

export interface ClockSample {
  /** `Date.now()` local justo antes de lanzar la petición. */
  requestedAtMs: number;
  /** `Date.now()` del servidor, tal y como lo devolvió. */
  serverMs: number;
  /** `Date.now()` local justo al recibir la respuesta. */
  receivedAtMs: number;
}

export interface ClockEstimate {
  /** Sumar esto a `Date.now()` local para obtener la hora del servidor. */
  offsetMs: number;
  /** Ida y vuelta de la mejor muestra. */
  rttMs: number;
  /** Margen de error razonable: la mitad del mejor RTT. */
  accuracyMs: number;
  samples: number;
}

/** Cuántas muestras (las de menor RTT) entran en la estimación final. */
const BEST_SAMPLES = 3;

export function sampleOffsetMs(sample: ClockSample): number {
  const rtt = sample.receivedAtMs - sample.requestedAtMs;
  // Se asume ida y vuelta simétricas: el servidor respondió a mitad de camino.
  return sample.serverMs + rtt / 2 - sample.receivedAtMs;
}

export function sampleRttMs(sample: ClockSample): number {
  return sample.receivedAtMs - sample.requestedAtMs;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Combina varias muestras quedándose con las de menor RTT: una petición lenta
 * arrastra un error grande, y en móvil siempre hay alguna.
 */
export function estimateClock(samples: ClockSample[]): ClockEstimate | null {
  if (samples.length === 0) return null;

  const best = [...samples]
    .sort((a, b) => sampleRttMs(a) - sampleRttMs(b))
    .slice(0, BEST_SAMPLES);

  const rttMs = sampleRttMs(best[0]);
  return {
    offsetMs: Math.round(median(best.map(sampleOffsetMs))),
    rttMs,
    accuracyMs: Math.round(rttMs / 2),
    samples: samples.length,
  };
}
