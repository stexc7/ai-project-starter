'use client';

/**
 * Reproductor para un archivo de vídeo servido por https: MP4, WebM o HLS.
 *
 * Es el caso más limpio de todos: el elemento `<video>` es nuestro, así que se
 * puede leer y escribir `currentTime` sin restricciones y la sincronización sale
 * exacta.
 */

import { useCallback, useEffect, useRef } from 'react';

import type { PlayerProps } from './types';

export function Html5Player({ ref: source, events, onHandle, onError }: PlayerProps) {
  const video = useRef<HTMLVideoElement>(null);
  // Se guardan en una referencia para que el `useEffect` de abajo no vuelva a
  // montarse cada vez que el componente padre se repinta.
  const latestEvents = useRef(events);
  latestEvents.current = events;

  const latestError = useRef(onError);
  latestError.current = onError;

  const attach = useCallback(
    (element: HTMLVideoElement | null) => {
      video.current = element;
      if (!element) {
        onHandle(null);
        return;
      }

      onHandle({
        play: () => void element.play().catch(() => undefined),
        pause: () => element.pause(),
        seek: (seconds) => {
          element.currentTime = seconds;
        },
        setRate: (rate) => {
          if (element.playbackRate !== rate) element.playbackRate = rate;
        },
        position: () => (Number.isFinite(element.currentTime) ? element.currentTime : null),
        duration: () => (Number.isFinite(element.duration) ? element.duration : null),
        isPlaying: () => !element.paused && !element.ended,
      });
    },
    [onHandle],
  );

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    const onPlay = () => latestEvents.current.onUserPlay(element.currentTime);
    const onPause = () => latestEvents.current.onUserPause(element.currentTime);
    const onSeeked = () => latestEvents.current.onUserSeek(element.currentTime);

    const onFailure = () => {
      // El caso habitual con un archivo propio: un .mkv, o vídeo en un códec que
      // este navegador no lleva. Safari es el más estricto de todos.
      latestError.current?.(
        'Este navegador no puede reproducir ese archivo. Con .mp4 (H.264) funciona en todos.',
      );
    };

    element.addEventListener('play', onPlay);
    element.addEventListener('pause', onPause);
    element.addEventListener('seeked', onSeeked);
    element.addEventListener('error', onFailure);

    return () => {
      element.removeEventListener('play', onPlay);
      element.removeEventListener('pause', onPause);
      element.removeEventListener('seeked', onSeeked);
      element.removeEventListener('error', onFailure);
    };
  }, [source]);

  return (
    <video
      ref={attach}
      src={source}
      className="player"
      // `playsInline` es obligatorio en iOS: sin él, Safari se lleva el vídeo a
      // pantalla completa con sus propios controles y se pierde el control.
      playsInline
      controls
      preload="metadata"
    />
  );
}
