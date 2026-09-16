'use client';

/**
 * El vídeo incrustado, ya sincronizado.
 *
 * Aquí es donde la app deja de ser un coordinador y pasa a ser un reproductor:
 * uno le da al play y al otro le arranca solo, sin contar nada. Solo funciona
 * con fuentes que se dejan incrustar y controlar (YouTube y archivos de vídeo);
 * para Netflix y compañía está `SyncStage` en modo asistido.
 */

import { useCallback, useState } from 'react';

import { formatTimecode } from '@/domain/format';
import { phaseAt, positionAt } from '@/domain/playback';
import type { ClientAction } from '@/domain/room';
import type { RoomCore } from '@/domain/sync';
import { Html5Player } from './players/Html5Player';
import type { PlayerHandle } from './players/types';
import { usePlayerSync } from './players/usePlayerSync';
import { YouTubePlayer } from './players/YouTubePlayer';

interface Props {
  core: RoomCore;
  now: number;
  serverNow: () => number;
  busy: boolean;
  send: (action: ClientAction) => Promise<boolean>;
}

export function VideoStage({ core, now, serverNow, busy, send }: Props) {
  const [handle, setHandle] = useState<PlayerHandle | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const events = usePlayerSync({ handle, core, serverNow, send, unlocked });
  const onHandle = useCallback((next: PlayerHandle | null) => setHandle(next), []);

  const phase = phaseAt(core, now);
  const position = positionAt(core, now);
  const playing = phase === 'playing';

  /**
   * iOS no deja que una web arranque un vídeo por su cuenta: hace falta que la
   * persona toque algo primero. Este toque es el que abre la puerta, y a partir
   * de aquí el reproductor ya obedece al motor de sincronización.
   */
  const unlock = () => {
    if (!handle) return;
    handle.play();
    if (!playing) handle.pause();
    setUnlocked(true);
  };

  return (
    <section className="card stage stage--video">
      <div className="player-frame">
        {core.source.kind === 'youtube' ? (
          <YouTubePlayer ref={core.source.ref} events={events} onHandle={onHandle} />
        ) : (
          <Html5Player ref={core.source.ref} events={events} onHandle={onHandle} />
        )}

        {!unlocked && (
          <button className="player-gate" onClick={unlock} disabled={!handle}>
            <span className="player-gate__icon">▶</span>
            <strong>{handle ? 'Tocar para entrar' : 'Cargando…'}</strong>
            <span className="faint">Una vez, y ya se sincroniza solo</span>
          </button>
        )}
      </div>

      <div className="spread" style={{ marginTop: 12 }}>
        <span className={`badge ${playing ? 'badge--playing' : 'badge--paused'}`}>
          {playing ? 'En marcha' : 'En pausa'}
        </span>
        <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTimecode(position)}
        </span>
      </div>

      <p className="faint" style={{ marginTop: 8 }}>
        Dale al play o pausa donde quieras: se aplica en los dos. Si os separáis,
        se corrige solo.
      </p>

      <button
        className="btn btn--ghost btn--block"
        style={{ marginTop: 8 }}
        disabled={busy}
        onClick={() => void send({ type: 'set-source', url: '' })}
      >
        Cambiar de vídeo
      </button>
    </section>
  );
}
