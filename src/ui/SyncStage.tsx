'use client';

/**
 * Modo asistido: para lo que la app **no puede** controlar.
 *
 * Netflix, Prime, Disney+ y HBO van cifrados con DRM: ninguna web puede
 * reproducirlos ni tocar su reproductor, y en el iPhone solo reproducen dentro
 * de su propia app. Cuando la fuente es una de esas, la app hace lo único que se
 * puede hacer: que los dos pulséis play en el mismo milisegundo y llevar la
 * cuenta de por dónde deberíais ir.
 *
 * Para YouTube y archivos de vídeo esto no se usa: ahí manda `VideoStage`, que
 * sí mueve los dos reproductores.
 */

import { useEffect, useState } from 'react';

import { formatDelta, formatTimecode, parseTimecode } from '@/domain/format';
import {
  adviseOnDrift,
  countdownRemainingMs,
  phaseAt,
  positionAt,
  SEEK_STEP_MS,
} from '@/domain/playback';
import type { ClientAction } from '@/domain/room';
import { drmServiceName } from '@/domain/sources';
import type { RoomCore } from '@/domain/sync';
import { unlockAudio } from './beeps';

interface Props {
  core: RoomCore;
  now: number;
  busy: boolean;
  send: (action: ClientAction) => Promise<boolean>;
}

type Panel = 'none' | 'seek' | 'drift';

const BADGES = {
  idle: { className: 'badge--idle', text: 'Sin empezar' },
  countdown: { className: 'badge--playing', text: 'Preparados' },
  playing: { className: 'badge--playing', text: 'En marcha' },
  paused: { className: 'badge--paused', text: 'En pausa' },
} as const;

export function SyncStage({ core, now, busy, send }: Props) {
  const phase = phaseAt(core, now);
  const position = positionAt(core, now);
  const [panel, setPanel] = useState<Panel>('none');

  const play = (positionMs: number) => {
    // El primer sonido de iOS necesita venir de un gesto; este es el bueno.
    unlockAudio();
    return send({ type: 'start', positionMs, countdown: true });
  };

  return (
    <section className="card stage">
      <span className={`badge ${BADGES[phase].className}`}>{BADGES[phase].text}</span>

      <TitleField core={core} busy={busy} send={send} />

      <p className={`timecode${phase === 'idle' ? ' timecode--idle' : ''}`}>
        {formatTimecode(position)}
      </p>

      {core.source.ref !== '' && (
        <a
          className="btn btn--block"
          href={core.source.ref}
          target="_blank"
          rel="noreferrer noopener"
          style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}
        >
          Abrir en {drmServiceName(core.source.ref) ?? 'el servicio'} ↗
        </a>
      )}

      <p className="stage__hint">
        {phase === 'idle' && 'Abrid Netflix, buscad el título y dejadlo en pausa.'}
        {phase === 'countdown' &&
          `En ${Math.ceil(countdownRemainingMs(core, now) / 1_000)} s, los dos a la vez.`}
        {phase === 'playing' && 'Por aquí deberíais ir los dos.'}
        {phase === 'paused' && 'Poned Netflix en este minuto exacto.'}
      </p>

      {phase === 'idle' && (
        <div className="stack">
          <button className="btn btn--primary btn--big btn--block" disabled={busy} onClick={() => play(0)}>
            ▶ Empezar juntos
          </button>
          <button className="btn btn--ghost" onClick={() => setPanel(panel === 'seek' ? 'none' : 'seek')}>
            Empezar por otro minuto
          </button>
        </div>
      )}

      {phase === 'countdown' && (
        <button className="btn btn--danger btn--block" disabled={busy} onClick={() => send({ type: 'pause' })}>
          Cancelar
        </button>
      )}

      {phase === 'playing' && (
        <div className="controls">
          <button className="btn" disabled={busy} onClick={() => send({ type: 'pause' })}>
            Pausa
          </button>
          <button className="btn" onClick={() => setPanel(panel === 'drift' ? 'none' : 'drift')}>
            Desfase
          </button>
          <button className="btn btn--danger" disabled={busy} onClick={() => send({ type: 'stop' })}>
            Terminar
          </button>
        </div>
      )}

      {phase === 'paused' && (
        <div className="stack">
          <button
            className="btn btn--primary btn--big btn--block"
            disabled={busy}
            onClick={() => play(position)}
          >
            ▶ Seguir desde {formatTimecode(position)}
          </button>
          <div className="controls">
            <button
              className="btn"
              disabled={busy}
              onClick={() => send({ type: 'seek', positionMs: Math.max(0, position - SEEK_STEP_MS) })}
            >
              −30 s
            </button>
            <button className="btn" onClick={() => setPanel(panel === 'seek' ? 'none' : 'seek')}>
              Ir a…
            </button>
            <button
              className="btn"
              disabled={busy}
              onClick={() => send({ type: 'seek', positionMs: position + SEEK_STEP_MS })}
            >
              +30 s
            </button>
          </div>
        </div>
      )}

      {panel === 'seek' && (
        <SeekPanel
          busy={busy}
          onCancel={() => setPanel('none')}
          onSubmit={async (positionMs) => {
            if (await send({ type: 'seek', positionMs })) setPanel('none');
          }}
        />
      )}

      {panel === 'drift' && (
        <DriftPanel
          expectedMs={position}
          busy={busy}
          onCancel={() => setPanel('none')}
          onResync={async (positionMs) => {
            if (await send({ type: 'seek', positionMs })) setPanel('none');
          }}
        />
      )}
    </section>
  );
}

/** El título se comparte: si uno lo escribe, el otro lo ve. */
function TitleField({ core, busy, send }: Omit<Props, 'now'>) {
  const [draft, setDraft] = useState(core.title);

  useEffect(() => setDraft(core.title), [core.title]);

  const commit = () => {
    if (draft.trim() !== core.title) void send({ type: 'set-title', title: draft });
  };

  return (
    <input
      className="field"
      style={{ textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 680 }}
      value={draft}
      placeholder="¿Qué vemos esta noche?"
      maxLength={120}
      disabled={busy}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      aria-label="Título que estáis viendo"
    />
  );
}

function SeekPanel({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  onCancel: () => void;
  onSubmit: (positionMs: number) => void;
}) {
  const [raw, setRaw] = useState('');
  const parsed = parseTimecode(raw);

  return (
    <div className="stack" style={{ marginTop: 14 }}>
      <p className="label">Minuto al que ir</p>
      <input
        className="field"
        inputMode="numeric"
        placeholder="42:10"
        value={raw}
        autoFocus
        onChange={(event) => setRaw(event.target.value)}
        aria-label="Minuto al que ir"
      />
      <div className="row">
        <button className="btn grow" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn btn--primary grow"
          disabled={busy || parsed === null}
          onClick={() => parsed !== null && onSubmit(parsed)}
        >
          Ir ahí
        </button>
      </div>
    </div>
  );
}

/**
 * Corrección de desfase.
 *
 * En vez de pedir a alguien que "adelante cuatro segundos" (imposible de clavar
 * arrastrando la barra de Netflix), se propone un punto de reencuentro en un
 * minuto redondo: los dos van ahí y se vuelve a contar desde cinco.
 */
function DriftPanel({
  expectedMs,
  busy,
  onCancel,
  onResync,
}: {
  expectedMs: number;
  busy: boolean;
  onCancel: () => void;
  onResync: (positionMs: number) => void;
}) {
  const [raw, setRaw] = useState('');
  const reported = parseTimecode(raw);
  const advice = reported === null ? null : adviseOnDrift(expectedMs, reported);

  return (
    <div className="stack" style={{ marginTop: 14 }}>
      <p className="label">¿Por qué minuto va tu Netflix?</p>
      <input
        className="field"
        inputMode="numeric"
        placeholder={formatTimecode(expectedMs)}
        value={raw}
        autoFocus
        onChange={(event) => setRaw(event.target.value)}
        aria-label="Minuto por el que va tu Netflix"
      />

      {advice && (
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>
          {advice.verdict === 'ok'
            ? 'Vais iguales. No hace falta tocar nada.'
            : `Vas ${advice.verdict === 'ahead' ? 'adelantado' : 'atrasado'} ${formatDelta(advice.deltaMs)}.`}
        </p>
      )}

      <div className="row">
        <button className="btn grow" onClick={onCancel}>
          Cerrar
        </button>
        <button
          className="btn btn--primary grow"
          disabled={busy || advice === null}
          onClick={() => advice && onResync(advice.resyncPositionMs)}
        >
          {advice ? `Reencuentro en ${formatTimecode(advice.resyncPositionMs)}` : 'Reencuentro'}
        </button>
      </div>
    </div>
  );
}
