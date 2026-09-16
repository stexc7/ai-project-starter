'use client';

/**
 * Reacciones: emoji que suben flotando por la pantalla de los dos.
 *
 * Es lo más parecido a darle un codazo a la otra persona en el sofá cuando pasa
 * algo. Se envían y se olvidan: no se guardan más que unos segundos.
 */

import { REACTIONS } from '@/domain/room';
import type { Reaction } from '@/domain/types';

/** Cuánto dura la animación de subida. Debe coincidir con `float-up` en el CSS. */
const FLOAT_MS = 2_600;

interface BarProps {
  busy: boolean;
  onReact: (emoji: string) => void;
}

export function ReactionBar({ busy, onReact }: BarProps) {
  return (
    <div className="reaction-bar">
      {REACTIONS.map((emoji) => (
        <button key={emoji} disabled={busy} onClick={() => onReact(emoji)} aria-label={`Reaccionar ${emoji}`}>
          {emoji}
        </button>
      ))}
    </div>
  );
}

/** Posición horizontal estable por reacción: si cambiara, el emoji daría saltos. */
function leftPercent(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 1_000;
  return 12 + (hash % 76);
}

interface FloatersProps {
  reactions: Reaction[];
  /** Hora del servidor; las reacciones vienen selladas con ese reloj. */
  now: number;
}

export function ReactionFloaters({ reactions, now }: FloatersProps) {
  const visible = reactions.filter((reaction) => now - reaction.atServerMs < FLOAT_MS);
  if (visible.length === 0) return null;

  return (
    <div className="floaters" aria-hidden="true">
      {visible.map((reaction) => (
        <span
          key={reaction.id}
          className="floater"
          style={{
            left: `${leftPercent(reaction.id)}%`,
            // Si la reacción llegó a mitad de vuelo, se entra por donde toca.
            animationDelay: `${Math.min(0, reaction.atServerMs - now) / 1_000}s`,
          }}
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}
