'use client';

/**
 * Elegir qué se ve, pegando un enlace.
 *
 * Aquí se decide en qué modo trabaja la sala, y se le dice a la persona **antes
 * de darle a nada**: si el enlace se puede incrustar, la sincronización va sola;
 * si es Netflix o similar, la app coordina a las dos personas porque el DRM no
 * deja otra cosa. Mejor saberlo aquí que descubrirlo a mitad de película.
 */

import { useState } from 'react';

import type { ClientAction } from '@/domain/room';
import { drmServiceName, isEmbeddable, parseSource } from '@/domain/sources';

interface Props {
  busy: boolean;
  send: (action: ClientAction) => Promise<boolean>;
}

/** Lo que se le enseña a la persona sobre lo que acaba de pegar. */
function describe(raw: string): { tone: 'auto' | 'assist' | 'error'; text: string } | null {
  if (raw.trim() === '') return null;

  const parsed = parseSource(raw);
  if (!parsed.ok) return { tone: 'error', text: parsed.error };

  if (parsed.value.kind === 'youtube') {
    return { tone: 'auto', text: 'YouTube · se sincroniza solo' };
  }
  if (parsed.value.kind === 'video') {
    return { tone: 'auto', text: 'Archivo de vídeo · se sincroniza solo' };
  }

  const service = drmServiceName(raw);
  return {
    tone: 'assist',
    text: service
      ? `${service} va cifrado: no se puede incrustar. Iréis en modo asistido.`
      : 'Ese sitio no se puede incrustar. Iréis en modo asistido.',
  };
}

export function SourcePicker({ busy, send }: Props) {
  const [raw, setRaw] = useState('');
  const hint = describe(raw);
  const parsed = parseSource(raw);

  const submit = async () => {
    if (busy || !parsed.ok) return;
    if (await send({ type: 'set-source', url: raw })) setRaw('');
  };

  return (
    <section className="card stack">
      <h2>¿Qué ponemos?</h2>

      <button
        className="btn btn--primary btn--big"
        disabled={busy}
        onClick={() => void send({ type: 'set-source', file: null })}
      >
        Una peli que tengamos
      </button>
      <p className="faint" style={{ marginTop: -4 }}>
        Cada uno abre su copia desde su móvil u ordenador. No se sube nada a ningún sitio, y va
        sincronizado solo.
      </p>

      <p className="label" style={{ marginTop: 6 }}>
        O pegar un enlace
      </p>

      <input
        className="field"
        value={raw}
        placeholder="Pega un enlace de YouTube, Netflix…"
        inputMode="url"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        onChange={(event) => setRaw(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
        }}
        aria-label="Enlace de lo que vais a ver"
      />

      {hint && <p className={`hint hint--${hint.tone}`}>{hint.text}</p>}

      <button
        className="btn"
        disabled={busy || raw.trim() === '' || !parsed.ok}
        onClick={() => void submit()}
      >
        Poner esto
      </button>

      <button
        className="btn btn--ghost"
        disabled={busy}
        onClick={() => void send({ type: 'set-source', url: '' })}
      >
        Vamos a ver Netflix (modo asistido)
      </button>

      <details className="faint">
        <summary style={{ cursor: 'pointer' }}>¿Por qué no todo va solo?</summary>
        <p style={{ marginBottom: 0 }}>
          Vuestros archivos y YouTube se dejan controlar, así que la app mueve los dos
          reproductores: uno le da al play y al otro le arranca. Netflix, Prime, Disney+ y HBO van
          cifrados, y ninguna web puede reproducirlos ni tocar su reproductor: solo se puede desde{' '}
          <em>dentro</em> de su propia página. Por eso Teleparty es una extensión de ordenador, y
          por eso Rave tenía que ser una app nativa. Desde el iPhone, esta app hace lo único que se
          puede: sincronizaros a vosotros, al milisegundo.
        </p>
      </details>
    </section>
  );
}

export { isEmbeddable };
