'use client';

/**
 * Contrato común de todos los reproductores.
 *
 * Es la pieza que hace que el motor de sincronización no sepa —ni le importe—
 * si detrás hay un `<video>`, un iframe de YouTube o, desde la extensión de
 * escritorio, el reproductor de Netflix. Todos hablan este idioma.
 */

export interface PlayerHandle {
  play(): void;
  pause(): void;
  /** Posición absoluta, en segundos. */
  seek(seconds: number): void;
  /** Velocidad de reproducción. 1 es la normal. */
  setRate(rate: number): void;
  /** Dónde va ahora, en segundos. `null` si todavía no está listo. */
  position(): number | null;
  duration(): number | null;
  isPlaying(): boolean;
}

/**
 * Lo que hace la persona **en el reproductor**, para reenviarlo a la sala.
 *
 * El adaptador solo avisa de lo que hizo el usuario: las órdenes que vienen del
 * motor se marcan y se ignoran al volver, o se entraría en bucle
 * (yo sincronizo → salta un evento → lo mando → el otro sincroniza → …).
 */
export interface PlayerEvents {
  onUserPlay(positionSeconds: number): void;
  onUserPause(positionSeconds: number): void;
  onUserSeek(positionSeconds: number): void;
}

export interface PlayerProps {
  /** Id de YouTube o URL del archivo, según la fuente. */
  ref: string;
  events: PlayerEvents;
  /** Se llama cuando el reproductor ya acepta órdenes. */
  onHandle(handle: PlayerHandle | null): void;
}
