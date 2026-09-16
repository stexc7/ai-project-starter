'use client';

/**
 * Chat de voz entre los dos, con WebRTC.
 *
 * El audio va **directo de un móvil al otro**: no pasa por Vercel ni por
 * ninguna base de datos. Lo único que atraviesa el servidor son los tres o
 * cuatro mensajes de negociación (oferta, respuesta y candidatos de red), que
 * viajan por el mismo sondeo que el chat de texto.
 *
 * Es lo que hace Hearo y lo que convierte esto en «ver algo juntos» en vez de
 * «ver lo mismo a la vez».
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ClientAction } from '@/domain/room';
import type { Signal } from '@/domain/types';

export type VoiceState = 'off' | 'connecting' | 'live' | 'failed';

export interface VoiceCall {
  state: VoiceState;
  muted: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  toggleMute: () => void;
  /** Hay que engancharlo a un `<audio>` para que suene la otra persona. */
  remoteAudio: (element: HTMLAudioElement | null) => void;
  /** Recibe las señales que llegan del sondeo. */
  handleSignal: (signal: Signal) => void;
}

/**
 * Servidores STUN públicos, solo para descubrir la IP pública de cada uno.
 *
 * No hay TURN: montar uno cuesta dinero y en la mayoría de redes domésticas no
 * hace falta. Si la conexión falla (algunas redes móviles con NAT simétrico),
 * se avisa en vez de quedarse colgado.
 */
const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

const MICROPHONE: MediaStreamConstraints = {
  audio: {
    // Sin cancelación de eco, el sonido de la peli del otro vuelve por el micro.
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: false,
};

type SignalPayload =
  | { kind: 'description'; description: RTCSessionDescriptionInit }
  | { kind: 'candidate'; candidate: RTCIceCandidateInit };

interface Options {
  meId: string;
  /** La otra persona. `null` mientras esté sola en la sala. */
  peerId: string | null;
  send: (action: ClientAction) => Promise<boolean>;
}

export function useVoiceCall({ meId, peerId, send }: Options): VoiceCall {
  const [state, setState] = useState<VoiceState>('off');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  /** Candidatos que llegaron antes de tener la descripción remota. */
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  /** Señales ya aplicadas. Volver a aplicar una oferta tumba la llamada. */
  const seenSignals = useRef(new Set<string>());

  const peerRef = useRef(peerId);
  peerRef.current = peerId;

  /**
   * Si los dos pulsan «llamar» a la vez, las dos ofertas chocan y la
   * negociación se rompe. Se resuelve con papeles fijos: el del identificador
   * más alto es el «educado» y cede, deshaciendo su oferta para aceptar la del
   * otro. El otro ignora la que le llega y sigue con la suya.
   */
  const politeRef = useRef(false);
  politeRef.current = peerId !== null && meId > peerId;

  const emit = useCallback(
    (payload: SignalPayload) => {
      const to = peerRef.current;
      if (!to) return;
      void send({ type: 'signal', to, payload: JSON.stringify(payload) });
    },
    [send],
  );

  const teardown = useCallback(() => {
    connection.current?.close();
    connection.current = null;

    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;

    remoteStream.current = null;
    pendingCandidates.current = [];
    seenSignals.current.clear();

    if (audioElement.current) audioElement.current.srcObject = null;
  }, []);

  /**
   * Crea la conexión y engancha el micro.
   *
   * Se usa tanto al llamar como al recibir: la diferencia entre los dos papeles
   * es solo quién manda la oferta primero.
   */
  const prepare = useCallback(async (): Promise<RTCPeerConnection> => {
    if (connection.current) return connection.current;

    const stream = await navigator.mediaDevices.getUserMedia(MICROPHONE);
    localStream.current = stream;

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    connection.current = peer;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) emit({ kind: 'candidate', candidate: candidate.toJSON() });
    };

    peer.ontrack = ({ streams }) => {
      remoteStream.current = streams[0] ?? null;
      if (audioElement.current && remoteStream.current) {
        audioElement.current.srcObject = remoteStream.current;
        void audioElement.current.play().catch(() => undefined);
      }
    };

    peer.onconnectionstatechange = () => {
      switch (peer.connectionState) {
        case 'connected':
          setState('live');
          setError(null);
          break;
        case 'failed':
          setState('failed');
          setError('No se ha podido abrir el audio. Probad con wifi en vez de datos.');
          break;
        case 'disconnected':
          setState('connecting');
          break;
        case 'closed':
          setState('off');
          break;
      }
    };

    return peer;
  }, [emit]);

  const start = useCallback(async () => {
    if (!peerRef.current) {
      setError('Todavía no hay nadie más en la sala.');
      return;
    }

    setState('connecting');
    setError(null);

    try {
      const peer = await prepare();
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      emit({ kind: 'description', description: offer });
    } catch (cause) {
      teardown();
      setState('failed');
      setError(
        cause instanceof DOMException && cause.name === 'NotAllowedError'
          ? 'Hace falta permiso para el micrófono.'
          : 'No se ha podido abrir el micrófono.',
      );
    }
  }, [emit, prepare, teardown]);

  const stop = useCallback(() => {
    teardown();
    setState('off');
    setError(null);
  }, [teardown]);

  const toggleMute = useCallback(() => {
    const stream = localStream.current;
    if (!stream) return;

    setMuted((wasMuted) => {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = wasMuted;
      });
      return !wasMuted;
    });
  }, []);

  const handleSignal = useCallback(
    (signal: Signal) => {
      if (seenSignals.current.has(signal.id)) return;
      seenSignals.current.add(signal.id);

      void (async () => {
        let payload: SignalPayload;
        try {
          payload = JSON.parse(signal.payload) as SignalPayload;
        } catch {
          return;
        }

        try {
          if (payload.kind === 'candidate') {
            const peer = connection.current;
            // Un candidato puede adelantarse a la oferta: se guarda para luego.
            if (!peer?.remoteDescription) {
              pendingCandidates.current.push(payload.candidate);
              return;
            }
            await peer.addIceCandidate(payload.candidate);
            return;
          }

          const { description } = payload;

          if (description.type === 'offer') {
            setState('connecting');
            const peer = await prepare();

            const collision = peer.signalingState === 'have-local-offer';
            if (collision && !politeRef.current) return;
            if (collision) await peer.setLocalDescription({ type: 'rollback' });

            await peer.setRemoteDescription(description);

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            emit({ kind: 'description', description: answer });
          } else if (description.type === 'answer' && connection.current) {
            await connection.current.setRemoteDescription(description);
          }

          // Ya hay descripción remota: se vacía lo que llegó antes de tiempo.
          const peer = connection.current;
          if (peer?.remoteDescription) {
            const queued = pendingCandidates.current;
            pendingCandidates.current = [];
            for (const candidate of queued) await peer.addIceCandidate(candidate);
          }
        } catch {
          // Una señal suelta que no encaja no debe tumbar la llamada: WebRTC
          // reintenta con los candidatos siguientes.
        }
      })();
    },
    [emit, prepare],
  );

  const remoteAudio = useCallback((element: HTMLAudioElement | null) => {
    audioElement.current = element;
    if (element && remoteStream.current) {
      element.srcObject = remoteStream.current;
      void element.play().catch(() => undefined);
    }
  }, []);

  // Al salir de la sala se cuelga y se apaga el micro. Sin esto, iOS deja el
  // punto naranja encendido.
  useEffect(() => teardown, [teardown]);

  return { state, muted, error, start, stop, toggleMute, remoteAudio, handleSignal };
}
