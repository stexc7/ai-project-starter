'use client';

/**
 * El bucle que mantiene pegado el reproductor de este móvil al de la sala.
 *
 * Es el corazón de la sincronización automática. Cada 250 ms compara dónde
 * debería ir el vídeo (según el ancla de la sala) con dónde va de verdad, y
 * aplica la corrección que decide `reconcile`: no hacer nada, un ajuste de
 * velocidad que no se nota, o un salto cuando el desfase ya se vería.
 *
 * Y al revés: lo que la persona hace en el reproductor se manda a la sala, para
 * que al otro le pase lo mismo.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { phaseAt, positionAt, reconcile } from '@/domain/playback';
import type { ClientAction } from '@/domain/room';
import type { RoomCore } from '@/domain/sync';
import type { PlayerEvents, PlayerHandle } from './types';

/** Cada cuánto se compara. Más fino no mejora nada y gasta batería. */
const LOOP_MS = 250;

/**
 * Tras dar una orden al reproductor, sus eventos se ignoran este rato.
 *
 * Sin esto habría bucle: sincronizo → el reproductor emite «play» → lo mando a
 * la sala → al otro le llega → sincroniza → emite «play» → …
 */
const ECHO_GUARD_MS = 700;

/** Estando en pausa, por debajo de esto no vale la pena recolocar el vídeo. */
const PAUSED_TOLERANCE_S = 0.4;

/**
 * Tras una orden **de la persona**, el bucle se calla hasta que la sala se
 * entera.
 *
 * Sin esto el corrector pelea contra quien lo está usando: das al play, y 250 ms
 * después el bucle te pausa porque la sala todavía dice «en pausa». Saltas a un
 * minuto, y te devuelve al anterior. Con red de verdad, por lo que tarda una
 * petición, esto se nota siempre.
 */
const INTENT_MS = 2_000;
/** Margen tras confirmar, para que a React le dé tiempo a repintar el estado. */
const INTENT_SETTLE_MS = 300;

interface Options {
  handle: PlayerHandle | null;
  core: RoomCore;
  /** Hora del servidor. Estable entre repintados. */
  serverNow: () => number;
  send: (action: ClientAction) => Promise<boolean>;
  /**
   * `false` hasta que la persona ha tocado el reproductor una vez.
   *
   * iOS no deja arrancar un vídeo por código si nadie ha tocado nada, así que
   * hasta entonces el bucle no intenta reproducir: solo coloca la posición.
   */
  unlocked: boolean;
}

export function usePlayerSync({ handle, core, serverNow, send, unlocked }: Options): PlayerEvents {
  // El bucle vive fuera del ciclo de React: lee siempre lo último sin
  // remontarse en cada repintado.
  const latest = useRef({ core, serverNow, unlocked });
  latest.current = { core, serverNow, unlocked };

  const guardUntil = useRef(0);
  const intentUntil = useRef(0);

  /** Marca que lo siguiente que haga el reproductor lo hemos pedido nosotros. */
  const commanded = useCallback(<T,>(run: () => T): T => {
    guardUntil.current = Date.now() + ECHO_GUARD_MS;
    return run();
  }, []);

  const isEcho = () => Date.now() < guardUntil.current;

  useEffect(() => {
    if (!handle) return;

    const tick = () => {
      // Mientras esperamos a que la sala recoja lo que acaba de pedir la
      // persona, aquí no se corrige nada: mandaría ella, no el bucle.
      if (Date.now() < intentUntil.current) return;

      const { core: room, serverNow: now, unlocked: ready } = latest.current;
      const actual = handle.position();
      if (actual === null) return;

      const serverMs = now();
      const targetMs = positionAt(room, serverMs);
      const playing = phaseAt(room, serverMs) === 'playing';

      if (!playing) {
        if (handle.isPlaying()) commanded(() => handle.pause());
        handle.setRate(1);

        // En pausa se recoloca, para que al reanudar los dos salgan del mismo sitio.
        if (Math.abs(actual - targetMs / 1_000) > PAUSED_TOLERANCE_S) {
          commanded(() => handle.seek(targetMs / 1_000));
        }
        return;
      }

      if (!handle.isPlaying()) {
        // Sin el gesto previo iOS rechaza el play; se deja para cuando lo haya.
        if (!ready) return;
        commanded(() => handle.play());
      }

      const correction = reconcile(targetMs, actual * 1_000);
      if (correction.action === 'seek') commanded(() => handle.seek(correction.toMs / 1_000));
      handle.setRate(correction.rate);
    };

    const timer = setInterval(tick, LOOP_MS);
    tick();

    return () => {
      clearInterval(timer);
      handle.setRate(1);
    };
  }, [handle, commanded]);

  /**
   * Manda a la sala lo que ha pedido la persona, y calla al corrector mientras
   * tanto. Al confirmarse, `send` ya ha dejado el estado nuevo aplicado.
   */
  const announce = useCallback(
    async (action: ClientAction) => {
      intentUntil.current = Date.now() + INTENT_MS;
      const accepted = await send(action);

      // Tanto si se aceptó como si no, el bucle vuelve a mandar: si falló, la
      // verdad es la de la sala y toca volver a ella.
      intentUntil.current = Date.now() + INTENT_SETTLE_MS;
      return accepted;
    },
    [send],
  );

  /** Arrancar desde aquí. `countdown: false`: la app mueve los dos reproductores. */
  const playFrom = useCallback(
    (positionMs: number) => announce({ type: 'start', positionMs, countdown: false }),
    [announce],
  );

  return useMemo<PlayerEvents>(
    () => ({
      onUserPlay: (seconds) => {
        if (isEcho()) return;
        void playFrom(Math.round(seconds * 1_000));
      },

      // Un `seek` deja la sala en pausa, que es justo lo que se quiere al pausar.
      onUserPause: (seconds) => {
        if (isEcho()) return;
        void announce({ type: 'seek', positionMs: Math.round(seconds * 1_000) });
      },

      onUserSeek: (seconds) => {
        if (isEcho()) return;
        const positionMs = Math.round(seconds * 1_000);
        const { core: room, serverNow: now } = latest.current;

        // Arrastrar la barra con la peli en marcha no debe pararla: se sigue
        // reproduciendo, desde el punto nuevo y para los dos.
        if (phaseAt(room, now()) === 'playing') void playFrom(positionMs);
        else void announce({ type: 'seek', positionMs });
      },
    }),
    [announce, playFrom],
  );
}
