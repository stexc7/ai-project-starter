'use client';

/**
 * La sala. Junta el reloj compartido, el sondeo y todos los paneles.
 */

import { useEffect, useState } from 'react';

import { phaseAt } from '@/domain/playback';
import { isOnline } from '@/domain/room';
import { isEmbeddable } from '@/domain/sources';
import type { StateDelta } from '@/domain/sync';
import { unlockAudio } from './beeps';
import { Chat } from './Chat';
import { Countdown, GO_VISIBLE_MS } from './Countdown';
import { ReactionBar, ReactionFloaters } from './Reactions';
import { SourcePicker } from './SourcePicker';
import { SyncStage } from './SyncStage';
import { useRoom } from './useRoom';
import { useServerClock, useTicker } from './useServerClock';
import { useVoiceCall } from './useVoiceCall';
import { VideoStage } from './VideoStage';
import { VoiceBar } from './VoiceBar';
import { Watchlist } from './Watchlist';

/** Latido de presencia: con esto la otra persona ve que sigues ahí. */
const PING_EVERY_MS = 20_000;
/** Refresco de pantalla: fino cuando corre el tiempo, tranquilo cuando no. */
const TICK_ACTIVE_MS = 200;
const TICK_CALM_MS = 1_000;

interface Props {
  code: string;
  meId: string;
  initial: StateDelta;
}

export function RoomScreen({ code, meId, initial }: Props) {
  const clock = useServerClock();
  const room = useRoom(code, initial);
  const { onSignal, send } = room;
  const [copied, setCopied] = useState(false);

  const peerId = room.core?.members.find((member) => member.id !== meId)?.id ?? null;
  const voice = useVoiceCall({ meId, peerId, send });

  // Las señales de WebRTC llegan por el mismo sondeo que el chat.
  useEffect(() => onSignal(voice.handleSignal), [onSignal, voice.handleSignal]);

  const now = clock.serverNow();
  const phase = room.core ? phaseAt(room.core, now) : 'idle';
  const running = phase === 'countdown' || phase === 'playing';
  useTicker(running ? TICK_ACTIVE_MS : TICK_CALM_MS);

  // iOS no deja sonar nada hasta que se ha tocado la pantalla una vez, y a
  // quien no pulsa "empezar" no le sonaría la cuenta atrás.
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener('pointerdown', unlock, { once: true });
    return () => document.removeEventListener('pointerdown', unlock);
  }, []);

  // `send` es estable: depende solo del código de sala.
  useEffect(() => {
    const timer = setInterval(() => void send({ type: 'ping' }), PING_EVERY_MS);
    return () => clearInterval(timer);
  }, [send]);

  if (room.expired) {
    return (
      <main className="screen" style={{ justifyContent: 'center' }}>
        <div className="card stack">
          <h2>Se ha cerrado la sesión</h2>
          <p className="muted">Vuelve a entrar con el código y el PIN.</p>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Volver a entrar
          </button>
        </div>
      </main>
    );
  }

  if (!room.core) {
    return (
      <main className="screen" style={{ justifyContent: 'center' }}>
        <p className="muted" style={{ textAlign: 'center' }}>
          Cargando la sala…
        </p>
      </main>
    );
  }

  const core = room.core;
  const embedded = isEmbeddable(core.source.kind);
  /** Con la sala ya en marcha no se cambia de fuente sin querer. */
  const started = core.status !== 'idle';
  const msSinceStart = now - core.anchor.atServerMs;

  // La cuenta atrás es solo del modo asistido: con el vídeo incrustado la app le
  // da al play ella misma y no hay nada que contar.
  const showCountdown = !embedded && core.status === 'running' && msSinceStart < GO_VISIBLE_MS;
  const clockOffsetMs = now - Date.now();

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1_500);
    } catch {
      // Sin permiso de portapapeles el código sigue visible en pantalla.
    }
  };

  return (
    <main className="screen">
      <header className="topbar">
        <button className="chip chip--code" onClick={() => void copyCode()} aria-label="Copiar código de sala">
          {copied ? '¡Copiado!' : code}
        </button>

        <div className="presence">
          {core.members.map((member) => (
            <span
              key={member.id}
              className="avatar"
              data-online={isOnline(member, now)}
              title={`${member.name}${isOnline(member, now) ? '' : ' (sin conexión)'}`}
            >
              {member.emoji}
            </span>
          ))}
        </div>
      </header>

      {!room.connected && <p className="error">Sin conexión con la sala. Reintentando…</p>}
      {room.error && (
        <p className="error" onClick={room.dismissError}>
          {room.error}
        </p>
      )}

      {core.source.kind === 'external' && core.source.ref === '' && !started ? (
        <SourcePicker busy={room.busy} send={room.send} />
      ) : embedded ? (
        <VideoStage
          core={core}
          now={now}
          serverNow={clock.serverNow}
          busy={room.busy}
          send={room.send}
        />
      ) : (
        <SyncStage core={core} now={now} busy={room.busy} send={room.send} />
      )}

      <VoiceBar voice={voice} peerPresent={peerId !== null} />

      <ReactionBar busy={room.busy} onReact={(emoji) => void room.send({ type: 'react', emoji })} />

      <Chat
        messages={room.messages}
        members={core.members}
        meId={meId}
        busy={room.busy}
        onSend={(text) => room.send({ type: 'chat', text })}
      />

      <Watchlist items={core.watchlist} busy={room.busy} send={room.send} />

      <HowItWorks />

      <p className="faint" style={{ textAlign: 'center' }}>
        {clock.accuracyMs === null
          ? 'Ajustando el reloj…'
          : `Relojes sincronizados · ±${clock.accuracyMs} ms`}
      </p>

      <ReactionFloaters reactions={room.reactions} now={now} />

      {showCountdown && (
        <Countdown
          startsAtLocalMs={core.anchor.atServerMs - clockOffsetMs}
          secondsLeft={Math.max(0, Math.ceil(-msSinceStart / 1_000))}
          msSinceStart={msSinceStart}
        />
      )}
    </main>
  );
}

function HowItWorks() {
  return (
    <details className="card panel">
      <summary>Cómo se usa</summary>
      <p className="faint" style={{ marginTop: 0 }}>
        Con <strong>YouTube o un archivo de vídeo</strong> no hay que hacer nada: le das al play y
        al otro le arranca solo. Lo de abajo es para Netflix y compañía, que van cifradas.
      </p>
      <ol className="steps">
        <li>
          Cada uno abre <strong>Netflix en su móvil o su tele</strong> y busca el mismo título.
        </li>
        <li>
          Lo dejáis <strong>en pausa</strong>, en el minuto que diga esta pantalla.
        </li>
        <li>
          Uno pulsa <strong>Empezar juntos</strong>: suena una cuenta atrás en los dos móviles.
        </li>
        <li>
          En el <strong>¡dale play!</strong>, los dos a la vez. A partir de ahí el timecode de
          arriba es el de los dos.
        </li>
        <li>
          Si uno se desfasa, <strong>Desfase</strong> propone un minuto redondo para
          reencontraros.
        </li>
      </ol>
    </details>
  );
}
