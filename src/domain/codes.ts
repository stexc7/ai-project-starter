/**
 * Códigos de sala.
 *
 * El código es el secreto que hay que poder dictar en voz alta sin
 * malentendidos, así que el alfabeto excluye los caracteres que se confunden:
 * I, L, O, 0 y 1.
 */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const ROOM_CODE_LENGTH = 6;

export type RandomBytes = (size: number) => Uint8Array;

/**
 * Genera un código sin sesgo: se descartan los bytes que caen en el resto
 * incompleto del último ciclo del alfabeto.
 */
export function createRoomCode(randomBytes: RandomBytes): string {
  const limit = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
  let code = '';

  while (code.length < ROOM_CODE_LENGTH) {
    for (const byte of randomBytes(ROOM_CODE_LENGTH)) {
      if (byte >= limit) continue;
      code += ALPHABET[byte % ALPHABET.length];
      if (code.length === ROOM_CODE_LENGTH) break;
    }
  }

  return code;
}

/** Tolera minúsculas, espacios y guiones al escribir el código a mano. */
export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .split('')
    .filter((char) => ALPHABET.includes(char))
    .join('');
}

export function isValidRoomCode(raw: string): boolean {
  return normalizeRoomCode(raw).length === ROOM_CODE_LENGTH && raw.trim().length <= 12;
}
