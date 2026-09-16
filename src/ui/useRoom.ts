'use client';

/**
 * Sondeo de la sala y envío de acciones.
 *
 * El ritmo lo marca el servidor (`nextPollMs`): cada dos segundos y medio
 * mientras se ve la película, cada segundo durante la cuenta atrás. Con la
 * pestaña en segundo plano se espacia, porque iOS congela los temporizadores.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ClientAction } from '@/domain/room';
import type { Signal } from '@/domain/types';
import {
  EMPTY_CLIENT_STATE,
  mergeDelta,
  type ClientRoomState,
  type StateDelta,
} from '@/domain/sync';
import { ApiError, post, request } from './api';

/** Con la app en segundo plano iOS congela los temporizadores igualmente. */
const HIDDEN_POLL_MS = 10_000;
const RETRY_POLL_MS = 4_000;

export interface RoomView extends ClientRoomState {
  /** `false` cuando el último sondeo falló: se avisa, no se oculta. */
  connected: boolean;
  /** `true` si la sesión dejó de valer y hay que volver a entrar con el PIN. */
  expired: boolean;
  error: string | null;
  busy: boolean;
  send: (action: ClientAction) => Promise<boolean>;
  dismissError: () => void;
  /**
   * Suscribe quién atiende las señales de WebRTC.
   *
   * No se guardan en el estado: son de un solo uso y acumularlas solo daría
   * ocasión de aplicar dos veces la misma oferta.
   */
  onSignal: (handler: (signal: Signal) => void) => void;
}

export function useRoom(code: string, initial: StateDelta): RoomView {
  const [state, setState] = useState<ClientRoomState>(() => mergeDelta(EMPTY_CLIENT_STATE, initial));
  const [connected, setConnected] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // El bucle de sondeo vive fuera de React: necesita la versión más reciente
  // sin volver a montarse en cada cambio de estado.
  const versionRef = useRef(state.version);

  const signalHandler = useRef<((signal: Signal) => void) | null>(null);
  const onSignal = useCallback((handler: (signal: Signal) => void) => {
    signalHandler.current = handler;
  }, []);

  const apply = useCallback((delta: StateDelta) => {
    versionRef.current = delta.version;
    setState((current) => mergeDelta(current, delta));

    for (const signal of delta.signals) signalHandler.current?.(signal);
  }, []);

  const send = useCallback(
    async (action: ClientAction): Promise<boolean> => {
      setBusy(true);
      try {
        apply(await post<StateDelta>(`/api/rooms/${code}/actions`, action));
        setError(null);
        setConnected(true);
        return true;
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) setExpired(true);
        setError(cause instanceof Error ? cause.message : 'Algo ha fallado.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [apply, code],
  );

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const schedule = (ms: number) => {
      if (stopped) return;
      clearTimeout(timer);
      timer = setTimeout(() => void poll(), ms);
    };

    const poll = async () => {
      if (stopped) return;
      if (document.hidden) {
        schedule(HIDDEN_POLL_MS);
        return;
      }

      try {
        const delta = await request<StateDelta>(
          `/api/rooms/${code}/state?since=${versionRef.current}`,
          { signal: controller.signal },
        );
        if (stopped) return;

        apply(delta);
        setConnected(true);
        schedule(delta.nextPollMs);
      } catch (cause) {
        if (stopped || controller.signal.aborted) return;

        if (cause instanceof ApiError && cause.status === 401) {
          setExpired(true);
          return;
        }
        setConnected(false);
        schedule(RETRY_POLL_MS);
      }
    };

    void poll();

    const onVisible = () => {
      if (!document.hidden) schedule(0);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [apply, code]);

  return {
    ...state,
    connected,
    expired,
    error,
    busy,
    send,
    onSignal,
    dismissError: useCallback(() => setError(null), []),
  };
}
