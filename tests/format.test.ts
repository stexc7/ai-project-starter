import { describe, expect, it } from 'vitest';

import { formatDelta, formatTimecode, parseTimecode } from '@/domain/format';

describe('mostrar el minuto', () => {
  it('usa el mismo formato que Netflix', () => {
    expect(formatTimecode(0)).toBe('0:00');
    expect(formatTimecode(9_000)).toBe('0:09');
    expect(formatTimecode(2_530_000)).toBe('42:10');
    expect(formatTimecode(3_753_000)).toBe('1:02:33');
  });

  it('trunca en vez de redondear: 41,9 s siguen siendo el segundo 41', () => {
    expect(formatTimecode(41_900)).toBe('0:41');
  });

  it('una posición negativa no rompe la pantalla', () => {
    expect(formatTimecode(-5_000)).toBe('0:00');
  });

  it('los desfases llevan signo', () => {
    expect(formatDelta(4_000)).toBe('+4 s');
    expect(formatDelta(-12_400)).toBe('−12 s');
  });
});

describe('leer el minuto que teclea una persona', () => {
  it('acepta los formatos que se ven en pantalla', () => {
    expect(parseTimecode('42:10')).toBe(2_530_000);
    expect(parseTimecode('1:02:33')).toBe(3_753_000);
    expect(parseTimecode('90')).toBe(90_000);
    expect(parseTimecode(' 42:10 ')).toBe(2_530_000);
  });

  it('rechaza lo que no sabe interpretar', () => {
    expect(parseTimecode('')).toBeNull();
    expect(parseTimecode('hola')).toBeNull();
    expect(parseTimecode('42:')).toBeNull();
    expect(parseTimecode('1:2:3:4')).toBeNull();
    expect(parseTimecode('-5')).toBeNull();
  });

  it('rechaza minutos y segundos fuera de rango en formato con dos puntos', () => {
    expect(parseTimecode('42:75')).toBeNull();
    expect(parseTimecode('1:90:00')).toBeNull();
  });

  it('ida y vuelta: lo que se muestra se puede volver a teclear', () => {
    for (const ms of [0, 9_000, 2_530_000, 3_753_000]) {
      expect(parseTimecode(formatTimecode(ms))).toBe(ms);
    }
  });
});
