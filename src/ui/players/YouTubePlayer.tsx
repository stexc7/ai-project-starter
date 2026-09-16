'use client';

/**
 * Reproductor de YouTube sobre su IFrame API.
 *
 * YouTube es la excepción útil: es el único servicio grande que **permite
 * incrustarse y deja controlarse desde fuera**. Por eso aquí la sincronización
 * es automática de verdad, y por eso Hearo y los demás también lo soportan.
 */

import { useCallback, useEffect, useRef } from 'react';

import type { PlayerHandle, PlayerProps } from './types';

// Superficie mínima de la API de YouTube. Se declara a mano para no arrastrar
// un paquete de tipos entero por seis métodos.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setPlaybackRate(rate: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(): void;
        onStateChange(event: { data: number }): void;
      };
    },
  ) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = 'https://www.youtube.com/iframe_api';
let apiPromise: Promise<YTNamespace> | null = null;

/** Carga el script de YouTube una sola vez por pestaña. */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    // YouTube llama a este global cuando termina de cargarse. Se encadena por si
    // alguien más lo tenía puesto.
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error('YouTube cargó sin exponer su API.'));
    };

    const script = document.createElement('script');
    script.src = API_SRC;
    script.async = true;
    script.onerror = () => reject(new Error('No se ha podido cargar el reproductor de YouTube.'));
    document.head.appendChild(script);
  });

  return apiPromise;
}

export function YouTubePlayer({ ref: videoId, events, onHandle }: PlayerProps) {
  const container = useRef<HTMLDivElement>(null);
  const latestEvents = useRef(events);
  latestEvents.current = events;

  const handleFor = useCallback(
    (player: YTPlayer): PlayerHandle => ({
      play: () => player.playVideo(),
      pause: () => player.pauseVideo(),
      seek: (seconds) => player.seekTo(seconds, true),
      setRate: (rate) => player.setPlaybackRate(rate),
      position: () => {
        const value = player.getCurrentTime();
        return Number.isFinite(value) ? value : null;
      },
      duration: () => {
        const value = player.getDuration();
        return Number.isFinite(value) && value > 0 ? value : null;
      },
      isPlaying: () => player.getPlayerState() === window.YT?.PlayerState.PLAYING,
    }),
    [],
  );

  useEffect(() => {
    const host = container.current;
    if (!host) return;

    let player: YTPlayer | null = null;
    let cancelled = false;

    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !container.current) return;

        player = new YT.Player(container.current, {
          videoId,
          playerVars: {
            // Sin `playsinline` iOS abre el vídeo a pantalla completa con sus
            // controles y deja de obedecer a la API.
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!cancelled && player) onHandle(handleFor(player));
            },
            onStateChange: ({ data }) => {
              if (!player) return;
              const at = player.getCurrentTime();

              if (data === YT.PlayerState.PLAYING) latestEvents.current.onUserPlay(at);
              else if (data === YT.PlayerState.PAUSED) latestEvents.current.onUserPause(at);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) onHandle(null);
      });

    return () => {
      cancelled = true;
      onHandle(null);
      player?.destroy();
    };
  }, [videoId, handleFor, onHandle]);

  // YouTube reemplaza este div por su iframe, así que necesita un envoltorio
  // propio al que aplicarle el tamaño.
  return (
    <div className="player player--embed">
      <div ref={container} />
    </div>
  );
}
