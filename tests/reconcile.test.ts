/**
 * La corrección de deriva: lo que mantiene los dos vídeos pegados.
 *
 * Es la diferencia entre «empezamos a la vez» y «vamos igual toda la película».
 */

import { describe, expect, it } from 'vitest';

import { DEAD_ZONE_MS, HARD_SEEK_MS, MAX_RATE_ADJUST, reconcile } from '@/domain/playback';

const T = 600_000; // vamos por el minuto 10

describe('cuándo no se toca nada', () => {
  it('ir clavado no provoca ninguna corrección', () => {
    expect(reconcile(T, T)).toEqual({ action: 'hold', rate: 1 });
  });

  it('una décima de desfase no se corrige: se notaría más el arreglo', () => {
    expect(reconcile(T, T + 100).action).toBe('hold');
    expect(reconcile(T, T - 100).action).toBe('hold');
    expect(reconcile(T, T + DEAD_ZONE_MS).action).toBe('hold');
  });
});

describe('correcciones suaves', () => {
  it('ir adelantado frena el reproductor', () => {
    const correction = reconcile(T, T + 600);

    expect(correction.action).toBe('nudge');
    expect(correction.rate).toBeLessThan(1);
    expect(correction.rate).toBeGreaterThanOrEqual(1 - MAX_RATE_ADJUST);
  });

  it('ir atrasado lo acelera', () => {
    const correction = reconcile(T, T - 600);

    expect(correction.action).toBe('nudge');
    expect(correction.rate).toBeGreaterThan(1);
    expect(correction.rate).toBeLessThanOrEqual(1 + MAX_RATE_ADJUST);
  });

  it('la corrección se suaviza según el desfase se reduce', () => {
    const lejos = reconcile(T, T + 1_400);
    const cerca = reconcile(T, T + 400);

    // Las dos frenan, pero la de lejos frena más.
    expect(lejos.rate).toBeLessThan(cerca.rate);
  });

  it('nunca se pasa del margen que no se nota', () => {
    for (let drift = DEAD_ZONE_MS + 1; drift < HARD_SEEK_MS; drift += 37) {
      for (const signo of [1, -1]) {
        const { rate } = reconcile(T, T + drift * signo);
        expect(Math.abs(rate - 1)).toBeLessThanOrEqual(MAX_RATE_ADJUST + 1e-9);
      }
    }
  });
});

describe('saltos', () => {
  it('a partir de segundo y medio ya no vale corregir suave', () => {
    expect(reconcile(T, T + HARD_SEEK_MS)).toEqual({ action: 'seek', toMs: T, rate: 1 });
    expect(reconcile(T, T - 10_000)).toEqual({ action: 'seek', toMs: T, rate: 1 });
  });

  it('al saltar se vuelve a velocidad normal', () => {
    expect(reconcile(T, T + 30_000).rate).toBe(1);
  });

  it('nunca manda saltar antes del principio', () => {
    expect(reconcile(0, 45_000)).toEqual({ action: 'seek', toMs: 0, rate: 1 });
  });
});

describe('el bucle converge', () => {
  it('un desfase que exige salto se resuelve en un solo paso', () => {
    const correction = reconcile(T, T + 4_000);

    expect(correction.action).toBe('seek');
    // Y tras el salto ya no hay nada que corregir.
    expect(reconcile(T, correction.action === 'seek' ? correction.toMs : 0).action).toBe('hold');
  });

  it('un desfase pequeño se reabsorbe reproduciendo, sin saltos', () => {
    // Medio segundo de retraso, corrigiendo a un 5 %: se recupera en unos diez
    // segundos de reproducción, sin que nadie note nada.
    let driftMs = -500;
    let steps = 0;

    while (Math.abs(driftMs) > DEAD_ZONE_MS && steps < 200) {
      const correction = reconcile(T, T + driftMs);
      expect(correction.action).toBe('nudge');

      // Cada paso son 250 ms de reproducción a la velocidad corregida.
      driftMs += (correction.rate - 1) * 250;
      steps += 1;
    }

    expect(Math.abs(driftMs)).toBeLessThanOrEqual(DEAD_ZONE_MS);
    expect(steps).toBeLessThan(200);
  });
});
