'use client';

import { useState } from 'react';

import { AccessForm } from '@/ui/AccessForm';

type View = 'home' | 'create' | 'join';

export default function HomePage() {
  const [view, setView] = useState<View>('home');

  return (
    <main className="screen">
      <div className="logo" style={{ marginTop: 18 }}>
        <span className="logo__mark" aria-hidden="true">
          ❤
        </span>
        <div>
          <h1>Juntos</h1>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Ver una peli a la vez, en dos casas
          </p>
        </div>
      </div>

      {view === 'home' ? (
        <>
          <div className="card stack">
            <button className="btn btn--primary btn--big" onClick={() => setView('create')}>
              Crear una sala
            </button>
            <button className="btn btn--big" onClick={() => setView('join')}>
              Entrar con un código
            </button>
          </div>

          <section className="card stack">
            <h2>Cómo funciona</h2>
            <ol className="steps">
              <li>
                <strong>YouTube o un archivo de vídeo</strong>: pegáis el enlace y ya está. Uno le
                da al play y al otro le arranca solo.
              </li>
              <li>
                <strong>Netflix desde el ordenador</strong>: con nuestra extensión, igual de
                automático.
              </li>
              <li>
                <strong>Netflix desde el iPhone</strong>: la app cuenta <strong>5, 4, 3, 2, 1</strong>{' '}
                en los dos teléfonos con el mismo reloj, y le dais al play a la vez.
              </li>
            </ol>
            <p className="muted" style={{ margin: 0, fontSize: 14.5 }}>
              Y podéis hablar mientras, sin abrir otra app.
            </p>

            <details className="faint">
              <summary style={{ cursor: 'pointer' }}>
                ¿Por qué Netflix en el iPhone es distinto?
              </summary>
              <p style={{ marginBottom: 0 }}>
                Netflix va cifrado: ninguna web puede reproducirlo ni tocar su reproductor desde
                fuera. Solo se puede desde <strong>dentro</strong> de la página donde vive ese
                reproductor. Eso es lo que hacía Rave —una app de móvil con Netflix incrustado— y
                lo que hace Teleparty, que es una extensión de escritorio. Una web no tiene dónde
                meterse. Así que en el iPhone esta app hace lo único que se puede: sincronizaros a
                vosotros, al milisegundo.
              </p>
            </details>
          </section>
        </>
      ) : (
        <AccessForm
          mode={view === 'create' ? 'create' : 'join'}
          onBack={() => setView('home')}
        />
      )}
    </main>
  );
}
