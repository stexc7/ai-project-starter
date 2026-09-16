'use client';

/**
 * Mantiene la diferencia entre el reloj de este móvil y el del servidor.
 *
 * Sin esto no hay nada: dos iPhone pueden llevar segundos de diferencia entre
 * sí, y una cuenta atrás que no coincide es peor que no tener cuenta atrás.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { estimateClock, type ClockSample } from '@/domain/clock';

const SAMPLES = 5;
const SAMPLE_GAP_MS = 120;
const RESYNC_EVERY_MS = 60_000;

export interface ServerClock {
  /** Hora del servidor, en ms. Estable: se puede usar dentro de callbacks. */
  serverNow: () => number;
  /** Margen de error estimado, en ms. `null` mientras no hay medida. */
  accuracyMs: number | null;
  resync: () => void;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function useServerClock(): ServerClock {
  const offsetRef = useRef(0);
  const [accuracyMs, setAccuracyMs] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  const serverNow = useCallback(() => Date.now() + offsetRef.current, []);
  const resync = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const measure = async () => {
      const samples: ClockSample[] = [];

      for (let i = 0; i < SAMPLES; i += 1) {
        if (signal.aborted) return;

        const requestedAtMs = Date.now();
        try {
          const response = await fetch('/api/time', { cache: 'no-store', signal });
          const { serverMs } = (await response.json()) as { serverMs: number };
          samples.push({ requestedAtMs, serverMs, receivedAtMs: Date.now() });
        } catch {
          // Una muestra perdida no invalida las demás; se sigue con el resto.
        }

        if (i < SAMPLES - 1) await delay(SAMPLE_GAP_MS, signal);
      }

      const estimate = estimateClock(samples);
      if (!estimate || signal.aborted) return;

      offsetRef.current = estimate.offsetMs;
      setAccuracyMs(estimate.accuracyMs);
    };

    void measure();
    const timer = setInterval(() => void measure(), RESYNC_EVERY_MS);

    // Al volver del bloqueo de pantalla el reloj puede haberse movido.
    const onVisible = () => {
      if (!document.hidden) void measure();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [nonce]);

  return { serverNow, accuracyMs, resync };
}

/**
 * Devuelve un contador que avanza solo mientras se le necesita.
 *
 * `intervalMs` a `null` detiene el bucle: cuando no hay nada en marcha no tiene
 * sentido repintar la pantalla, y en un móvil eso es batería.
 */
export function useTicker(intervalMs: number | null): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (intervalMs === null) return;

    const timer = setInterval(() => setTick((value) => value + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return tick;
}
