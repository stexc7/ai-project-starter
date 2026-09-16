import { describe, expect, it } from 'vitest';

import {
  adviseOnDrift,
  COUNTDOWN_MS,
  countdownRemainingMs,
  nextResyncPoint,
  pauseAt,
  phaseAt,
  positionAt,
  scheduleStart,
  seekTo,
  stopPlayback,
  type PlaybackState,
} from '@/domain/playback';

const T0 = 1_700_000_000_000;

const idle: PlaybackState = { status: 'idle', anchor: { atServerMs: T0, positionMs: 0 } };

describe('fases de la reproducción', () => {
  it('una sala sin empezar está parada en el minuto cero', () => {
    expect(phaseAt(idle, T0 + 60_000)).toBe('idle');
    expect(positionAt(idle, T0 + 60_000)).toBe(0);
  });

  it('con el ancla en el futuro está en cuenta atrás, no reproduciendo', () => {
    const room = scheduleStart(idle, 0, T0 + COUNTDOWN_MS);

    expect(phaseAt(room, T0)).toBe('countdown');
    expect(phaseAt(room, T0 + COUNTDOWN_MS - 1)).toBe('countdown');
    expect(phaseAt(room, T0 + COUNTDOWN_MS)).toBe('playing');
  });

  it('la película no avanza durante la cuenta atrás', () => {
    const room = scheduleStart(idle, 90_000, T0 + COUNTDOWN_MS);

    expect(positionAt(room, T0)).toBe(90_000);
    expect(positionAt(room, T0 + COUNTDOWN_MS)).toBe(90_000);
    expect(positionAt(room, T0 + COUNTDOWN_MS + 3_000)).toBe(93_000);
  });

  it('el tiempo que falta para el play baja hasta cero y ahí se queda', () => {
    const room = scheduleStart(idle, 0, T0 + 5_000);

    expect(countdownRemainingMs(room, T0)).toBe(5_000);
    expect(countdownRemainingMs(room, T0 + 4_000)).toBe(1_000);
    expect(countdownRemainingMs(room, T0 + 9_000)).toBe(0);
  });
});

describe('pausa y salto', () => {
  it('la pausa congela la posición exacta de ese instante', () => {
    const playing = scheduleStart(idle, 0, T0);
    const paused = pauseAt(playing, T0 + 42_000);

    expect(paused.status).toBe('paused');
    expect(positionAt(paused, T0 + 42_000)).toBe(42_000);
    // Y sigue congelada un minuto después.
    expect(positionAt(paused, T0 + 102_000)).toBe(42_000);
  });

  it('reanudar desde la pausa continúa por donde iba', () => {
    const paused = pauseAt(scheduleStart(idle, 0, T0), T0 + 42_000);
    const resumed = scheduleStart(paused, positionAt(paused, T0 + 42_000), T0 + 50_000);

    expect(positionAt(resumed, T0 + 50_000)).toBe(42_000);
    expect(positionAt(resumed, T0 + 60_000)).toBe(52_000);
  });

  it('saltar deja la sala en pausa: hay que buscar el minuto antes de seguir', () => {
    const playing = scheduleStart(idle, 0, T0);
    const sought = seekTo(playing, 600_000, T0 + 10_000);

    expect(sought.status).toBe('paused');
    expect(positionAt(sought, T0 + 99_000)).toBe(600_000);
  });

  it('nunca se guarda una posición negativa', () => {
    expect(seekTo(idle, -5_000, T0).anchor.positionMs).toBe(0);
    expect(scheduleStart(idle, -1, T0).anchor.positionMs).toBe(0);
  });

  it('terminar vuelve al principio', () => {
    const stopped = stopPlayback(scheduleStart(idle, 0, T0), T0 + 90_000);

    expect(stopped.status).toBe('idle');
    expect(positionAt(stopped, T0 + 90_000)).toBe(0);
  });
});

describe('corrección de desfase', () => {
  it('un segundo de diferencia no se toca', () => {
    expect(adviseOnDrift(600_000, 601_000).verdict).toBe('ok');
    expect(adviseOnDrift(600_000, 599_000).verdict).toBe('ok');
  });

  it('distingue ir adelantado de ir atrasado', () => {
    expect(adviseOnDrift(600_000, 612_000)).toMatchObject({ verdict: 'ahead', deltaMs: 12_000 });
    expect(adviseOnDrift(600_000, 588_000)).toMatchObject({ verdict: 'behind', deltaMs: -12_000 });
  });

  it('propone un minuto redondo con margen para llegar a él', () => {
    // 10:05 + 25 s de margen cae en el minuto 11.
    expect(nextResyncPoint(605_000)).toBe(660_000);
    // Justo en 10:00 el margen ya empuja al 11: no vale proponer el mismo punto.
    expect(nextResyncPoint(600_000)).toBe(660_000);
  });

  it('el punto de reencuentro siempre está por delante', () => {
    for (const position of [0, 1, 34_999, 35_000, 59_999, 3_600_000]) {
      expect(nextResyncPoint(position)).toBeGreaterThan(position);
    }
  });
});
