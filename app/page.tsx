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
                Cada uno pone <strong>Netflix en su móvil o su tele</strong>, con el mismo título en
                pausa.
              </li>
              <li>
                Esta app cuenta <strong>5, 4, 3, 2, 1</strong> en los dos teléfonos a la vez, con el
                mismo reloj.
              </li>
              <li>
                Le dais al play en el <strong>¡dale!</strong> y a partir de ahí vais igual, con chat
                y reacciones.
              </li>
            </ol>
            <p className="faint" style={{ margin: 0 }}>
              Netflix va cifrado: ninguna web puede reproducirlo por dentro ni mover su reproductor
              desde fuera (por eso Rave y Teleparty eran extensiones de ordenador, y por eso en el
              iPhone eso no existe). Lo que sí se puede hacer es que los dos arranquéis en el mismo
              milisegundo y llevar la cuenta de por dónde vais. Eso es lo que hace esto.
            </p>
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
