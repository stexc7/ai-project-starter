'use client';

/**
 * Abrir un archivo del propio dispositivo.
 *
 * Es la forma en que más se usaba Rave, y la única en que una web puede darte
 * una película entera sincronizada: **cada uno abre su copia**, y la app mueve
 * los dos reproductores a la vez.
 *
 * El archivo no se sube a ningún sitio ni pasa por ningún servidor. Se lee desde
 * el disco con `URL.createObjectURL`, que es una referencia local y nada más. Lo
 * único que viaja a la sala son el nombre y el tamaño, para poder avisar si no
 * estáis abriendo lo mismo.
 */

import { useEffect, useRef, useState } from 'react';

import type { ClientAction } from '@/domain/room';
import { readLocalSource, sameFile, type LocalFileInfo } from '@/domain/sources';
import type { Source } from '@/domain/types';

interface Props {
  source: Source;
  busy: boolean;
  send: (action: ClientAction) => Promise<boolean>;
  /** Se llama con la URL local del archivo elegido, o `null` al soltarlo. */
  onFile: (url: string | null, info: LocalFileInfo | null) => void;
}

/**
 * Con un decimal siempre.
 *
 * Redondeando a entero, 0,6 GB y 1,1 GB salen los dos como «1 GB» y el aviso de
 * archivos distintos queda diciendo «1 GB contra 1 GB», que parece un fallo.
 */
function formatSize(bytes: number): string {
  const gigabytes = bytes / 1_000_000_000;
  if (gigabytes >= 1) return `${gigabytes.toFixed(1)} GB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function LocalFileGate({ source, busy, send, onFile }: Props) {
  const [mine, setMine] = useState<LocalFileInfo | null>(null);
  const objectUrl = useRef<string | null>(null);

  // Una URL de objeto reserva el archivo en memoria hasta que se libera.
  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  const theirs = readLocalSource(source);

  const pick = (file: File | undefined) => {
    if (!file) return;

    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);

    const info = { name: file.name, sizeBytes: file.size };
    setMine(info);
    onFile(objectUrl.current, info);

    // El primero que abre un archivo marca qué se ve; el segundo solo se suma.
    if (!theirs) void send({ type: 'set-source', file: info });
  };

  const input = (
    <input
      type="file"
      accept="video/*"
      style={{ display: 'none' }}
      id="archivo"
      disabled={busy}
      onChange={(event) => pick(event.target.files?.[0])}
    />
  );

  if (!mine) {
    return (
      <div className="stack" style={{ textAlign: 'center' }}>
        {input}
        {theirs ? (
          <>
            <p className="label">Ya ha elegido</p>
            <p style={{ margin: 0, fontWeight: 650 }}>{theirs.name}</p>
            <p className="faint" style={{ margin: 0 }}>
              {formatSize(theirs.sizeBytes)} · abre tu copia del mismo archivo
            </p>
          </>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: 14.5 }}>
            Cada uno abre su copia de la película. No se sube nada a ningún sitio.
          </p>
        )}

        <label className="btn btn--primary btn--big btn--block" htmlFor="archivo">
          Abrir un archivo
        </label>
      </div>
    );
  }

  const mismatch = theirs !== null && !sameFile(mine, theirs);

  return (
    <div className="stack">
      {input}
      {mismatch && (
        <p className="hint hint--assist">
          Vuestros archivos no son iguales ({formatSize(mine.sizeBytes)} contra{' '}
          {formatSize(theirs.sizeBytes)}). Podéis seguir, pero los minutos no van a coincidir.
        </p>
      )}
      <label className="btn btn--ghost" htmlFor="archivo">
        Cambiar de archivo
      </label>
    </div>
  );
}
