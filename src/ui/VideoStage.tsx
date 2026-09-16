'use client';

/**
 * El vídeo, ya sincronizado, dentro de la app.
 *
 * Aquí la app no coordina personas: mueve reproductores. Uno le da al play y al
 * otro le arranca solo. Vale para todo lo que se deja incrustar y controlar —
 * YouTube, un archivo por https, y **un archivo del propio dispositivo**, que
 * era la forma en que más se usaba Rave.
 *
 * Netflix y compañía no entran aquí: para eso está `SyncStage` (modo asistido) o
 * la extensión de escritorio.
 */

import { useCallback, useState } from 'react';

import { formatTimecode } from '@/domain/format';
import { phaseAt, positionAt } from '@/domain/playback';
import type { ClientAction } from '@/domain/room';
import type { RoomCore } from '@/domain/sync';
import { LocalFileGate } from './LocalFileGate';
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
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const events = usePlayerSync({ handle, core, serverNow, send, unlocked });
  const onHandle = useCallback((next: PlayerHandle | null) => setHandle(next), []);
  const onError = useCallback((message: string) => setProblem(message), []);

  const phase = phaseAt(core, now);
  const position = positionAt(core, now);
  const playing = phase === 'playing';

  const isLocal = core.source.kind === 'local';
  // Con un archivo propio, la fuente del reproductor es la URL local de cada
  // uno, no lo que diga la sala: el archivo nunca sale del dispositivo.
  const playerSource = isLocal ? localUrl : core.source.ref;

  const onFile = useCallback((url: string | null) => {
    setLocalUrl(url);
    setProblem(null);
    setUnlocked(false);
  }, []);

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
      {playerSource !== null && (
        <div className="player-frame">
          {core.source.kind === 'youtube' ? (
            <YouTubePlayer ref={playerSource} events={events} onHandle={onHandle} />
          ) : (
            <Html5Player
              ref={playerSource}
              events={events}
              onHandle={onHandle}
              onError={onError}
            />
          )}

          {!unlocked && (
            <button className="player-gate" onClick={unlock} disabled={!handle}>
              <span className="player-gate__icon">▶</span>
              <strong>{handle ? 'Tocar para entrar' : 'Cargando…'}</strong>
              <span className="faint">Una vez, y ya se sincroniza solo</span>
            </button>
          )}
        </div>
      )}

      {problem && <p className="hint hint--error">{problem}</p>}

      {isLocal && (
        <div style={{ marginTop: playerSource ? 12 : 0 }}>
          <LocalFileGate source={core.source} busy={busy} send={send} onFile={onFile} />
        </div>
      )}

      {playerSource !== null && (
        <>
          <div className="spread" style={{ marginTop: 12 }}>
            <span className={`badge ${playing ? 'badge--playing' : 'badge--paused'}`}>
              {playing ? 'En marcha' : 'En pausa'}
            </span>
            <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTimecode(position)}
            </span>
          </div>

          <p className="faint" style={{ marginTop: 8 }}>
            Dale al play o pausa donde quieras: se aplica en los dos. Si os separáis, se corrige
            solo.
          </p>
        </>
      )}

      <button
        className="btn btn--ghost btn--block"
        style={{ marginTop: 8 }}
        disabled={busy}
        onClick={() => void send({ type: 'set-source', url: '' })}
      >
        Poner otra cosa
      </button>
    </section>
  );
}
