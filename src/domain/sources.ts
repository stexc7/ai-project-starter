/**
 * De dónde sale el vídeo, y qué se puede hacer con cada sitio.
 *
 * Esta es la línea que divide la aplicación en dos:
 *
 * - Lo que **se puede incrustar** (YouTube, un archivo de vídeo) se sincroniza
 *   solo: uno le da al play y al otro le arranca. Es lo que hace Hearo con sus
 *   fuentes propias y lo que hace Teleparty dentro de la web de Netflix.
 * - Lo que **va con DRM** (Netflix, Prime, Disney+, HBO…) no se puede incrustar
 *   ni controlar desde otra página, y en el iPhone ni siquiera reproduce fuera
 *   de su app. Ahí no queda otra que coordinar a las dos personas.
 *
 * `parseSource` decide en cuál de los dos lados cae lo que pegue el usuario.
 */

import type { Source, SourceKind } from './types';
import type { Validated } from './validation';

/** Servicios con DRM que reconocemos para dar un mensaje concreto. */
const DRM_SERVICES: ReadonlyArray<{ host: RegExp; name: string }> = [
  { host: /(^|\.)netflix\.com$/, name: 'Netflix' },
  { host: /(^|\.)primevideo\.com$/, name: 'Prime Video' },
  { host: /(^|\.)amazon\.[a-z.]+$/, name: 'Prime Video' },
  { host: /(^|\.)disneyplus\.com$/, name: 'Disney+' },
  { host: /(^|\.)max\.com$/, name: 'Max' },
  { host: /(^|\.)hbomax\.com$/, name: 'HBO Max' },
  { host: /(^|\.)hulu\.com$/, name: 'Hulu' },
  { host: /(^|\.)tv\.apple\.com$/, name: 'Apple TV+' },
  { host: /(^|\.)skyshowtime\.com$/, name: 'SkyShowtime' },
  { host: /(^|\.)movistarplus\.es$/, name: 'Movistar Plus+' },
];

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|ogg|m3u8|mov)$/i;

/** Los identificadores de YouTube son 11 caracteres de este alfabeto. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * El navegador trata `localhost` como contexto seguro, así que ahí sí vale
 * `http`. Es lo que permite probar con un archivo servido en local.
 */
function isLocalhost(url: URL): boolean {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.localhost');
}

export const EMPTY_SOURCE: Source = { kind: 'external', ref: '' };

/** `true` si la app puede incrustar y controlar esta fuente por sí misma. */
export function isEmbeddable(kind: SourceKind): boolean {
  return kind === 'youtube' || kind === 'video';
}

/** Nombre del servicio con DRM al que apunta la URL, si lo reconocemos. */
export function drmServiceName(raw: string): string | null {
  try {
    const { hostname } = new URL(raw.trim());
    return DRM_SERVICES.find((service) => service.host.test(hostname))?.name ?? null;
  } catch {
    return null;
  }
}

function youtubeIdFrom(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1);
    return YOUTUBE_ID.test(id) ? id : null;
  }

  if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'music.youtube.com') {
    return null;
  }

  const fromQuery = url.searchParams.get('v');
  if (fromQuery && YOUTUBE_ID.test(fromQuery)) return fromQuery;

  // /embed/ID, /shorts/ID, /live/ID
  const segments = url.pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return last && YOUTUBE_ID.test(last) ? last : null;
}

/**
 * Convierte lo que pegue una persona en una fuente.
 *
 * Nunca falla por «no reconozco esto»: lo que no se puede incrustar cae en
 * `external`, que es un modo válido, no un error.
 */
export function parseSource(raw: unknown): Validated<Source> {
  if (typeof raw !== 'string') return { ok: false, error: 'Eso no es un enlace.' };

  const value = raw.trim();
  if (value === '') return { ok: true, value: EMPTY_SOURCE };

  // Un identificador de YouTube suelto, pegado sin la URL entera.
  if (YOUTUBE_ID.test(value)) return { ok: true, value: { kind: 'youtube', ref: value } };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: 'Eso no parece un enlace. Pega la URL entera.' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, error: 'Solo valen enlaces http o https.' };
  }

  const youtubeId = youtubeIdFrom(url);
  if (youtubeId) return { ok: true, value: { kind: 'youtube', ref: youtubeId } };

  if (VIDEO_EXTENSIONS.test(url.pathname)) {
    if (url.protocol !== 'https:' && !isLocalhost(url)) {
      // Un vídeo por http dentro de una página https lo bloquea el navegador.
      return { ok: false, error: 'El vídeo tiene que ir por https o el navegador lo bloquea.' };
    }
    return { ok: true, value: { kind: 'video', ref: url.toString() } };
  }

  // Netflix y compañía: fuente externa, modo asistido.
  return { ok: true, value: { kind: 'external', ref: url.toString() } };
}

/** URL que va dentro del `<iframe>`. `null` para las fuentes no incrustables. */
export function embedUrl(source: Source, origin: string): string | null {
  if (source.kind !== 'youtube') return null;

  const params = new URLSearchParams({
    // Sin esto, iOS abre el vídeo a pantalla completa y se pierde el control.
    playsinline: '1',
    enablejsapi: '1',
    rel: '0',
    modestbranding: '1',
    origin,
  });

  return `https://www.youtube-nocookie.com/embed/${source.ref}?${params}`;
}
