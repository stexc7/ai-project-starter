'use client';

/**
 * Los controles de la llamada.
 *
 * Poder hablar mientras veis algo es lo que separa «ver lo mismo a la vez» de
 * «verlo juntos», y es exactamente lo que hace que Hearo se llame Hearo.
 */

import type { VoiceCall } from './useVoiceCall';

const LABELS: Record<VoiceCall['state'], string> = {
  off: 'Hablar',
  connecting: 'Llamando…',
  live: 'En llamada',
  failed: 'Reintentar',
};

interface Props {
  voice: VoiceCall;
  /** `false` mientras la otra persona no esté en la sala. */
  peerPresent: boolean;
}

export function VoiceBar({ voice, peerPresent }: Props) {
  const live = voice.state === 'live';

  return (
    <div className="stack">
      <div className="row">
        <button
          className={`btn grow ${live ? 'btn--danger' : 'btn--primary'}`}
          disabled={!peerPresent && !live}
          onClick={() => (live || voice.state === 'connecting' ? voice.stop() : void voice.start())}
        >
          {live ? 'Colgar' : LABELS[voice.state]}
        </button>

        {live && (
          <button
            className="btn btn--icon"
            onClick={voice.toggleMute}
            aria-pressed={voice.muted}
            aria-label={voice.muted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {voice.muted ? '🔇' : '🎙️'}
          </button>
        )}
      </div>

      {voice.error && <p className="error">{voice.error}</p>}

      {live && (
        <p className="faint" style={{ margin: 0 }}>
          Poneos auriculares: sin ellos, el micro coge el sonido de la peli y se oye eco.
        </p>
      )}

      {!peerPresent && voice.state === 'off' && (
        <p className="faint" style={{ margin: 0 }}>
          Podréis hablar cuando entre la otra persona.
        </p>
      )}

      {/* El audio de la otra persona. Sin `playsInline`, iOS se lo lleva a
          pantalla completa como si fuese un vídeo. */}
      <audio ref={voice.remoteAudio} autoPlay playsInline />
    </div>
  );
}
