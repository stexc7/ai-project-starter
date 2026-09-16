'use client';

/**
 * La cuenta atrás a pantalla completa.
 *
 * Es el momento en el que la aplicación se juega su razón de ser: los dos
 * tienen que pulsar play en Netflix en el mismo instante. Por eso ocupa toda la
 * pantalla, suena y se ve desde el otro lado del sofá.
 */

import { useEffect, useRef } from 'react';

import { beepAt, buzz } from './beeps';

/** Cuánto se queda el "¡DALE!" en pantalla después del cero. */
const GO_VISIBLE_MS = 1_400;

interface Props {
  /** Instante del reloj **local** en que hay que pulsar play. */
  startsAtLocalMs: number;
  /** Segundos que faltan, ya redondeados hacia arriba. 0 significa "ahora". */
  secondsLeft: number;
  msSinceStart: number;
}

export function Countdown({ startsAtLocalMs, secondsLeft, msSinceStart }: Props) {
  const scheduledFor = useRef<number | null>(null);

  useEffect(() => {
    // Los pitidos se programan una sola vez por arranque, en el reloj del audio.
    if (scheduledFor.current === startsAtLocalMs) return;
    scheduledFor.current = startsAtLocalMs;

    for (let second = 3; second >= 1; second -= 1) {
      beepAt(startsAtLocalMs - second * 1_000, 'tick');
    }
    beepAt(startsAtLocalMs, 'go');

    const untilGo = startsAtLocalMs - Date.now();
    if (untilGo > 0) {
      const timer = setTimeout(() => buzz([0, 90, 60, 220]), untilGo);
      return () => clearTimeout(timer);
    }
  }, [startsAtLocalMs]);

  const isGo = msSinceStart >= 0;

  return (
    <div className={`countdown${isGo ? ' countdown--go' : ''}`} role="status" aria-live="assertive">
      <div>
        {isGo ? (
          <>
            <div className="countdown__go">¡DALE PLAY!</div>
            <p className="countdown__caption">Ahora mismo, los dos</p>
          </>
        ) : (
          <>
            <p className="countdown__caption">Dedo sobre el play</p>
            <div className="countdown__number">{secondsLeft}</div>
          </>
        )}
      </div>
    </div>
  );
}

export { GO_VISIBLE_MS };
