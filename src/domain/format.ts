/** Conversión entre milisegundos y el timecode que enseña Netflix. */

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/** `2_530_000` → `"42:10"`. Con horas: `"1:02:33"`. */
export function formatTimecode(ms: number): string {
  const total = Math.max(0, Math.floor(ms / SECOND));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** Diferencia con signo, para avisar de desfases: `"+4 s"`, `"−12 s"`. */
export function formatDelta(ms: number): string {
  const seconds = Math.round(Math.abs(ms) / SECOND);
  const sign = ms >= 0 ? '+' : '−';
  return `${sign}${seconds} s`;
}

/**
 * Acepta lo que una persona teclea mirando su pantalla: `"42:10"`, `"1:02:33"`,
 * `"90"` (segundos sueltos). Devuelve `null` si no hay forma de entenderlo.
 */
export function parseTimecode(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (cleaned === '') return null;

  const parts = cleaned.split(':');
  if (parts.length > 3) return null;
  if (!parts.every((part) => /^\d{1,3}$/.test(part))) return null;

  const numbers = parts.map(Number);
  const [hours, minutes, seconds] =
    numbers.length === 3
      ? numbers
      : numbers.length === 2
        ? [0, numbers[0], numbers[1]]
        : [0, 0, numbers[0]];

  // En formato con dos puntos, 90 segundos o 90 minutos es un error de tecleo.
  if (numbers.length > 1 && (seconds > 59 || minutes > 59)) return null;

  return hours * HOUR + minutes * MINUTE + seconds * SECOND;
}
