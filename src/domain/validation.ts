/**
 * Validación de entrada. Se ejecuta en el servidor: lo del cliente es cortesía.
 *
 * Cada función devuelve el valor ya normalizado o un mensaje accionable en
 * español, listo para enseñárselo a la persona tal cual.
 */

export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

export const LIMITS = {
  name: 24,
  title: 120,
  chat: 500,
  watchlistTitle: 120,
  watchlistItems: 50,
} as const;

const ok = <T>(value: T): Validated<T> => ({ ok: true, value });
const fail = <T>(error: string): Validated<T> => ({ ok: false, error });

const CONTROL_CHARS = new RegExp('[\\u0000-\\u001f\\u007f]', 'g');

/** Quita caracteres de control que romperían el renderizado o los logs. */
function clean(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(CONTROL_CHARS, ' ').trim();
}

export function parseDisplayName(raw: unknown): Validated<string> {
  const value = clean(raw);
  if (value.length === 0) return fail('Escribe tu nombre.');
  if (value.length > LIMITS.name) {
    return fail(`El nombre no puede pasar de ${LIMITS.name} caracteres.`);
  }
  return ok(value);
}

export function parsePin(raw: unknown): Validated<string> {
  const value = clean(raw);
  if (!/^\d{4}$/.test(value)) return fail('El PIN son 4 dígitos.');
  return ok(value);
}

export function parseTitle(raw: unknown): Validated<string> {
  const value = clean(raw);
  if (value.length > LIMITS.title) {
    return fail(`El título no puede pasar de ${LIMITS.title} caracteres.`);
  }
  return ok(value);
}

export function parseChatText(raw: unknown): Validated<string> {
  const value = clean(raw);
  if (value.length === 0) return fail('El mensaje está vacío.');
  if (value.length > LIMITS.chat) {
    return fail(`El mensaje no puede pasar de ${LIMITS.chat} caracteres.`);
  }
  return ok(value);
}

export function parseWatchlistTitle(raw: unknown): Validated<string> {
  const value = clean(raw);
  if (value.length === 0) return fail('Escribe qué quieres ver.');
  if (value.length > LIMITS.watchlistTitle) {
    return fail(`El título no puede pasar de ${LIMITS.watchlistTitle} caracteres.`);
  }
  return ok(value);
}

/** Solo se aceptan los emoji del selector: evita texto disfrazado de reacción. */
export function parseEmoji(raw: unknown, allowed: readonly string[]): Validated<string> {
  const value = clean(raw);
  if (!allowed.includes(value)) return fail('Ese emoji no está en la lista.');
  return ok(value);
}

/** Posiciones dentro de una película: nada de negativos, NaN ni 40 horas. */
const MAX_POSITION_MS = 12 * 60 * 60 * 1_000;

export function parsePositionMs(raw: unknown): Validated<number> {
  const value = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(value)) return fail('La posición no es un número.');
  if (value < 0) return fail('La posición no puede ser negativa.');
  if (value > MAX_POSITION_MS) return fail('Esa posición se sale de cualquier película.');
  return ok(Math.round(value));
}
