/**
 * Pitidos de la cuenta atrás.
 *
 * Se programan en el reloj del propio `AudioContext`, no con `setTimeout`: el
 * temporizador de JavaScript en un móvil se retrasa decenas de milisegundos, y
 * el "¡dale!" es justo lo que no puede llegar tarde.
 *
 * En iOS el audio no suena hasta que la persona ha tocado la pantalla al menos
 * una vez, así que `unlock()` se llama al primer toque en cualquier sitio.
 */

type BeepKind = 'tick' | 'go';

const TONES: Record<BeepKind, { frequency: number; durationMs: number; gain: number }> = {
  tick: { frequency: 660, durationMs: 90, gain: 0.16 },
  go: { frequency: 1040, durationMs: 340, gain: 0.3 },
};

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!context) {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }

  return context;
}

/** Llamar desde un gesto del usuario: sin eso, iOS mantiene el audio en silencio. */
export function unlockAudio(): void {
  void audioContext()?.resume();
}

/** Programa un pitido para un instante del reloj local (`Date.now()`). */
export function beepAt(localMs: number, kind: BeepKind): void {
  const ctx = audioContext();
  if (!ctx) return;

  const delaySeconds = (localMs - Date.now()) / 1_000;
  if (delaySeconds < -0.2) return;

  const { frequency, durationMs, gain } = TONES[kind];
  const startAt = ctx.currentTime + Math.max(0, delaySeconds);
  const endAt = startAt + durationMs / 1_000;

  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  // Rampa corta en lugar de corte seco: un corte suena a chasquido.
  volume.gain.setValueAtTime(0.0001, startAt);
  volume.gain.exponentialRampToValueAtTime(gain, startAt + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
}

/** Vibra donde se pueda. Safari en iOS no implementa la Vibration API. */
export function buzz(pattern: number | number[]): void {
  navigator.vibrate?.(pattern);
}
