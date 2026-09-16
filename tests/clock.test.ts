import { describe, expect, it } from 'vitest';

import { estimateClock, sampleOffsetMs, sampleRttMs, type ClockSample } from '@/domain/clock';

/** Construye una muestra de un reloj desviado `offset` ms con un RTT dado. */
function sampleWith(offsetMs: number, rttMs: number, localStartMs = 1_000_000): ClockSample {
  return {
    requestedAtMs: localStartMs,
    // El servidor responde a mitad de camino: ahí es donde tiene esa hora.
    serverMs: localStartMs + rttMs / 2 + offsetMs,
    receivedAtMs: localStartMs + rttMs,
  };
}

describe('una muestra suelta', () => {
  it('recupera el desfase cuando la ida y la vuelta tardan lo mismo', () => {
    expect(sampleOffsetMs(sampleWith(4_000, 80))).toBe(4_000);
    expect(sampleOffsetMs(sampleWith(-2_500, 200))).toBe(-2_500);
  });

  it('mide el tiempo de ida y vuelta', () => {
    expect(sampleRttMs(sampleWith(0, 140))).toBe(140);
  });
});

describe('estimación con varias muestras', () => {
  it('sin muestras no se inventa un reloj', () => {
    expect(estimateClock([])).toBeNull();
  });

  it('se queda con las peticiones rápidas y descarta la lenta', () => {
    const estimate = estimateClock([
      sampleWith(3_000, 40),
      sampleWith(3_000, 50),
      sampleWith(3_000, 60),
      // Una petición que se atascó: su desfase aparente está muy mal medido.
      { requestedAtMs: 0, serverMs: 3_000, receivedAtMs: 4_000 },
    ]);

    expect(estimate).not.toBeNull();
    expect(estimate!.offsetMs).toBe(3_000);
    expect(estimate!.samples).toBe(4);
  });

  it('la mediana aguanta una muestra rápida pero mentirosa', () => {
    const estimate = estimateClock([
      sampleWith(1_000, 30),
      sampleWith(1_000, 32),
      // Rápida, pero con la hora disparatada: la mediana la deja fuera.
      { requestedAtMs: 0, serverMs: 999_999, receivedAtMs: 31 },
    ]);

    expect(estimate!.offsetMs).toBe(1_000);
  });

  it('el margen de error declarado es la mitad del mejor recorrido', () => {
    const estimate = estimateClock([sampleWith(0, 90), sampleWith(0, 300)]);

    expect(estimate!.rttMs).toBe(90);
    expect(estimate!.accuracyMs).toBe(45);
  });
});
