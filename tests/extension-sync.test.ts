/**
 * `extension/sync.js` es una copia a mano de la matemática de `domain/playback.ts`,
 * porque una extensión de Chrome carga archivos sueltos sin TypeScript ni
 * empaquetador.
 *
 * Una copia a mano se separa del original tarde o temprano. Este test lo impide:
 * compara las dos implementaciones con cientos de entradas, y falla en cuanto
 * discrepan en un milisegundo.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import {
  DEAD_ZONE_MS,
  HARD_SEEK_MS,
  MAX_RATE_ADJUST,
  phaseAt,
  positionAt,
  reconcile,
  type Correction,
  type PlaybackState,
} from '@/domain/playback';

interface Mirror {
  DEAD_ZONE_MS: number;
  HARD_SEEK_MS: number;
  MAX_RATE_ADJUST: number;
  positionAt(room: PlaybackState, serverMs: number): number;
  phaseAt(room: PlaybackState, serverMs: number): string;
  reconcile(targetMs: number, actualMs: number): Correction;
}

let mirror: Mirror;

beforeAll(() => {
  const source = readFileSync(join(process.cwd(), 'extension/sync.js'), 'utf8');
  // El archivo se asigna a `globalThis.JuntosSync`, igual que hace Chrome al
  // cargarlo como content script.
  new Function(source)();

  mirror = (globalThis as unknown as { JuntosSync: Mirror }).JuntosSync;
});

const T0 = 1_700_000_000_000;

describe('las constantes coinciden', () => {
  it('zona muerta, umbral de salto y margen de velocidad', () => {
    expect(mirror.DEAD_ZONE_MS).toBe(DEAD_ZONE_MS);
    expect(mirror.HARD_SEEK_MS).toBe(HARD_SEEK_MS);
    expect(mirror.MAX_RATE_ADJUST).toBe(MAX_RATE_ADJUST);
  });
});

describe('la corrección de deriva da lo mismo en las dos', () => {
  it('a lo largo de todo el rango, incluidos los bordes', () => {
    const drifts = [
      0, 1, -1,
      DEAD_ZONE_MS - 1, DEAD_ZONE_MS, DEAD_ZONE_MS + 1,
      HARD_SEEK_MS - 1, HARD_SEEK_MS, HARD_SEEK_MS + 1,
      500, -500, 1_499, -1_499, 60_000, -60_000,
    ];

    for (const drift of drifts) {
      expect(mirror.reconcile(T0, T0 + drift)).toEqual(reconcile(T0, T0 + drift));
    }
  });

  it('barrido fino: nada se escapa', () => {
    for (let drift = -3_000; drift <= 3_000; drift += 7) {
      expect(mirror.reconcile(600_000, 600_000 + drift)).toEqual(
        reconcile(600_000, 600_000 + drift),
      );
    }
  });

  it('también cerca del principio de la película, donde se recorta a cero', () => {
    for (const target of [0, 100, 1_000]) {
      for (const actual of [0, 5_000, 50_000]) {
        expect(mirror.reconcile(target, actual)).toEqual(reconcile(target, actual));
      }
    }
  });
});

describe('la posición y la fase dan lo mismo en las dos', () => {
  const rooms: PlaybackState[] = [
    { status: 'idle', anchor: { atServerMs: T0, positionMs: 0 } },
    { status: 'paused', anchor: { atServerMs: T0, positionMs: 600_000 } },
    { status: 'running', anchor: { atServerMs: T0, positionMs: 0 } },
    // Ancla en el futuro: cuenta atrás.
    { status: 'running', anchor: { atServerMs: T0 + 5_000, positionMs: 90_000 } },
  ];

  it('en cualquier instante, antes y después del ancla', () => {
    for (const room of rooms) {
      for (const offset of [-10_000, -5_000, -1, 0, 1, 2_500, 60_000]) {
        const at = T0 + offset;
        expect(mirror.positionAt(room, at)).toBe(positionAt(room, at));
        expect(mirror.phaseAt(room, at)).toBe(phaseAt(room, at));
      }
    }
  });
});
