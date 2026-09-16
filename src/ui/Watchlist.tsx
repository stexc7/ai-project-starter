'use client';

/**
 * La lista de "algún día vemos esto", con botón para que decida la suerte.
 *
 * Existe porque la discusión de qué ver dura más que la película.
 */

import { useState } from 'react';

import type { ClientAction } from '@/domain/room';
import type { WatchlistItem } from '@/domain/types';
import { LIMITS } from '@/domain/validation';

interface Props {
  items: WatchlistItem[];
  busy: boolean;
  send: (action: ClientAction) => Promise<boolean>;
}

export function Watchlist({ items, busy, send }: Props) {
  const [draft, setDraft] = useState('');

  const add = async () => {
    const title = draft.trim();
    if (title === '' || busy) return;

    setDraft('');
    if (!(await send({ type: 'watchlist-add', title }))) setDraft(title);
  };

  const pick = () => {
    if (items.length === 0) return;
    const chosen = items[Math.floor(Math.random() * items.length)];
    void send({ type: 'set-title', title: chosen.title });
  };

  return (
    <details className="card panel">
      <summary>
        <span>¿Qué vemos? {items.length > 0 && <span className="faint">· {items.length}</span>}</span>
      </summary>

      <div className="stack">
        <div className="composer">
          <input
            className="field grow"
            value={draft}
            placeholder="Añadir una peli o serie"
            maxLength={LIMITS.watchlistTitle}
            enterKeyHint="done"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void add();
            }}
            aria-label="Añadir a la lista"
          />
          <button
            className="btn btn--icon"
            disabled={busy || draft.trim() === ''}
            onClick={() => void add()}
            aria-label="Añadir a la lista"
          >
            +
          </button>
        </div>

        {items.length === 0 ? (
          <p className="faint" style={{ margin: 0 }}>
            Todavía no hay nada. Id apuntando lo que os apetezca.
          </p>
        ) : (
          <>
            <ul className="list">
              {items.map((item) => (
                <li key={item.id}>
                  <span className="grow">{item.title}</span>
                  <button
                    className="btn btn--ghost btn--icon"
                    disabled={busy}
                    onClick={() => void send({ type: 'watchlist-remove', itemId: item.id })}
                    aria-label={`Quitar ${item.title}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <button className="btn" disabled={busy} onClick={pick}>
              🎲 Que decida la suerte
            </button>
          </>
        )}
      </div>
    </details>
  );
}
