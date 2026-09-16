'use client';

/**
 * Entrada a la sala: crearla o unirse.
 *
 * No hay cuentas, ni correos, ni contraseñas que recordar. El código de la sala
 * es el secreto fuerte; el PIN evita que entre quien vea el código por encima
 * del hombro.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from '@/domain/codes';
import { AVATARS } from '@/domain/room';
import { LIMITS } from '@/domain/validation';
import { post } from './api';

interface Props {
  mode: 'create' | 'join';
  /** Si se entra desde `/sala/CODIGO`, el código ya viene dado. */
  fixedCode?: string;
  onBack?: () => void;
}

export function AccessForm({ mode, fixedCode, onBack }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(fixedCode ?? '');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(AVATARS[0]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const creating = mode === 'create';
  const ready = name.trim() !== '' && /^\d{4}$/.test(pin) && (creating || isValidRoomCode(code));

  const submit = async () => {
    if (!ready || busy) return;

    setBusy(true);
    setError(null);
    try {
      const body = { name, emoji, pin };

      if (creating) {
        const created = await post<{ code: string }>('/api/rooms', body);
        router.push(`/sala/${created.code}`);
        return;
      }

      const target = normalizeRoomCode(code);
      await post(`/api/rooms/${target}/join`, body);

      // La página de la sala se pinta en el servidor a partir de la cookie:
      // hay que pedirle que se vuelva a generar con la sesión ya puesta.
      if (fixedCode) router.refresh();
      else router.push(`/sala/${target}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se ha podido conectar.');
      setBusy(false);
    }
  };

  return (
    <div className="card stack">
      <h2>{creating ? 'Crear vuestra sala' : 'Entrar en la sala'}</h2>

      {!creating && !fixedCode && (
        <div className="stack">
          <label className="label" htmlFor="code">
            Código de la sala
          </label>
          <input
            id="code"
            className="field field--code"
            value={code}
            maxLength={ROOM_CODE_LENGTH + 2}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="ABC234"
            onChange={(event) => setCode(normalizeRoomCode(event.target.value))}
          />
        </div>
      )}

      <div className="stack">
        <label className="label" htmlFor="name">
          Tu nombre
        </label>
        <input
          id="name"
          className="field"
          value={name}
          maxLength={LIMITS.name}
          enterKeyHint="next"
          placeholder="Cómo te llama"
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="stack">
        <p className="label">Tu emoji</p>
        <div className="emoji-grid">
          {AVATARS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={emoji === option}
              aria-label={`Elegir ${option}`}
              onClick={() => setEmoji(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <label className="label" htmlFor="pin">
          {creating ? 'PIN de 4 dígitos (os lo tenéis que saber los dos)' : 'PIN de la sala'}
        </label>
        <input
          id="pin"
          className="field field--pin"
          value={pin}
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          placeholder="••••"
          enterKeyHint="go"
          onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submit();
          }}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <button className="btn btn--primary btn--big" disabled={!ready || busy} onClick={() => void submit()}>
        {busy ? 'Un momento…' : creating ? 'Crear la sala' : 'Entrar'}
      </button>

      {onBack && (
        <button className="btn btn--ghost" onClick={onBack}>
          Volver
        </button>
      )}
    </div>
  );
}
