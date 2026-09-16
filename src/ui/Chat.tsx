'use client';

import { useEffect, useRef, useState } from 'react';

import { LIMITS } from '@/domain/validation';
import type { ChatMessage, Member } from '@/domain/types';

interface Props {
  messages: ChatMessage[];
  members: Member[];
  meId: string;
  busy: boolean;
  onSend: (text: string) => Promise<boolean>;
}

export function Chat({ messages, members, meId, busy, onSend }: Props) {
  const list = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');

  // Se mueve el scroll del propio contenedor, no `scrollIntoView`: con pocos
  // mensajes el contenedor aún no desborda y el navegador desplazaría la página
  // entera, dejando el panel de sincronización fuera de la pantalla.
  useEffect(() => {
    const container = list.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length]);

  const submit = async () => {
    const text = draft.trim();
    if (text === '' || busy) return;

    setDraft('');
    if (!(await onSend(text))) setDraft(text);
  };

  const nameOf = (memberId: string) =>
    members.find((member) => member.id === memberId)?.name ?? 'Alguien';

  return (
    <>
      <div className="chat" ref={list}>
        {messages.length === 0 && (
          <p className="faint" style={{ textAlign: 'center', margin: 'auto' }}>
            Aquí aparecerá lo que os digáis.
          </p>
        )}

        {messages.map((message) => {
          const mine = message.memberId === meId;
          return (
            <div key={message.id} className={`bubble${mine ? ' bubble--mine' : ''}`}>
              {!mine && <p className="bubble__meta">{nameOf(message.memberId)}</p>}
              {message.text}
            </div>
          );
        })}
      </div>

      <div className="composer">
        <input
          className="field grow"
          value={draft}
          placeholder="Escribe algo…"
          maxLength={LIMITS.chat}
          enterKeyHint="send"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submit();
          }}
          aria-label="Mensaje"
        />
        <button
          className="btn btn--primary btn--icon"
          disabled={busy || draft.trim() === ''}
          onClick={() => void submit()}
          aria-label="Enviar mensaje"
        >
          ↑
        </button>
      </div>
    </>
  );
}
