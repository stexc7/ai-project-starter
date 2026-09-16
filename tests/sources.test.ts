/**
 * Clasificar lo que pega una persona decide en qué modo trabaja la sala:
 * sincronización automática o modo asistido. Equivocarse aquí se nota enseguida.
 */

import { describe, expect, it } from 'vitest';

import {
  drmServiceName,
  embedUrl,
  isEmbeddable,
  localSource,
  parseSource,
  readLocalSource,
  sameFile,
} from '@/domain/sources';
import type { Source } from '@/domain/types';

function sourceOf(raw: string): Source {
  const parsed = parseSource(raw);
  if (!parsed.ok) throw new Error(`No se pudo interpretar: ${raw} (${parsed.error})`);
  return parsed.value;
}

describe('YouTube', () => {
  it('reconoce todas las formas en que se comparte un vídeo', () => {
    const esperado: Source = { kind: 'youtube', ref: 'dQw4w9WgXcQ' };

    expect(sourceOf('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual(esperado);
    expect(sourceOf('https://youtu.be/dQw4w9WgXcQ')).toEqual(esperado);
    expect(sourceOf('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual(esperado);
    expect(sourceOf('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toEqual(esperado);
    expect(sourceOf('https://www.youtube.com/embed/dQw4w9WgXcQ')).toEqual(esperado);
    expect(sourceOf('https://www.youtube.com/live/dQw4w9WgXcQ')).toEqual(esperado);
    // Pegado a pelo, sin la URL.
    expect(sourceOf('dQw4w9WgXcQ')).toEqual(esperado);
  });

  it('conserva el vídeo aunque el enlace venga con lista y marca de tiempo', () => {
    expect(sourceOf('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&t=42')).toEqual({
      kind: 'youtube',
      ref: 'dQw4w9WgXcQ',
    });
  });

  it('el iframe pide playsinline, o iOS se lleva el vídeo a pantalla completa', () => {
    const url = embedUrl({ kind: 'youtube', ref: 'dQw4w9WgXcQ' }, 'https://juntos.app');

    expect(url).toContain('/embed/dQw4w9WgXcQ');
    expect(url).toContain('playsinline=1');
    expect(url).toContain('enablejsapi=1');
  });

  it('no hay iframe para lo que no es YouTube', () => {
    expect(embedUrl({ kind: 'external', ref: '' }, 'https://juntos.app')).toBeNull();
    expect(embedUrl({ kind: 'video', ref: 'https://x.com/a.mp4' }, 'https://juntos.app')).toBeNull();
  });
});

describe('archivos de vídeo', () => {
  it('reconoce las extensiones que reproduce el navegador', () => {
    for (const url of [
      'https://ejemplo.com/peli.mp4',
      'https://ejemplo.com/peli.webm',
      'https://ejemplo.com/directo.m3u8',
      'https://ejemplo.com/ruta/con/carpetas/algo.MP4',
    ]) {
      expect(sourceOf(url).kind).toBe('video');
    }
  });

  it('rechaza http: el navegador lo bloquea dentro de una página https', () => {
    const parsed = parseSource('http://ejemplo.com/peli.mp4');

    expect(parsed.ok).toBe(false);
    expect(parsed.ok || parsed.error).toContain('https');
  });

  it('salvo en localhost, que el navegador considera seguro', () => {
    expect(sourceOf('http://localhost:3000/test/clip.mp4').kind).toBe('video');
    expect(sourceOf('http://127.0.0.1:8080/a.webm').kind).toBe('video');
  });
});

describe('servicios con DRM', () => {
  it('Netflix y compañía caen en modo asistido, no en error', () => {
    for (const url of [
      'https://www.netflix.com/watch/81234567',
      'https://www.primevideo.com/detail/0ABC',
      'https://www.disneyplus.com/video/abc',
      'https://play.max.com/video/watch/abc',
    ]) {
      const source = sourceOf(url);
      expect(source.kind).toBe('external');
      expect(isEmbeddable(source.kind)).toBe(false);
    }
  });

  it('los nombra para poder decir por qué no se puede', () => {
    expect(drmServiceName('https://www.netflix.com/watch/81234567')).toBe('Netflix');
    expect(drmServiceName('https://www.disneyplus.com/video/abc')).toBe('Disney+');
    expect(drmServiceName('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(drmServiceName('no soy una url')).toBeNull();
  });
});

describe('archivos del propio dispositivo', () => {
  function makeLocal(name: string, sizeBytes: number): Source {
    const parsed = localSource(name, sizeBytes);
    if (!parsed.ok) throw new Error(parsed.error);
    return parsed.value;
  }

  it('guarda nombre y tamaño, y los devuelve igual', () => {
    const source = makeLocal('Dune Parte Dos.mp4', 4_200_000_000);

    expect(source.kind).toBe('local');
    expect(readLocalSource(source)).toEqual({
      name: 'Dune Parte Dos.mp4',
      sizeBytes: 4_200_000_000,
    });
  });

  it('un nombre con barra vertical no rompe la referencia', () => {
    // La barra separa los dos campos: si colase, el tamaño se leería mal.
    const source = makeLocal('Dune | Parte | Dos.mp4', 1_000);

    expect(readLocalSource(source)).toEqual({ name: 'Dune   Parte   Dos.mp4', sizeBytes: 1_000 });
  });

  it('recorta los nombres kilométricos', () => {
    const info = readLocalSource(makeLocal('x'.repeat(500) + '.mp4', 10));
    expect(info!.name.length).toBeLessThanOrEqual(160);
  });

  it('rechaza lo que no es un archivo', () => {
    expect(localSource('', 100).ok).toBe(false);
    expect(localSource('peli.mp4', 0).ok).toBe(false);
    expect(localSource('peli.mp4', -1).ok).toBe(false);
    expect(localSource('peli.mp4', Number.NaN).ok).toBe(false);
    expect(localSource(null, 100).ok).toBe(false);
  });

  it('el modo archivo sin elegir todavía no se lee como archivo', () => {
    expect(readLocalSource({ kind: 'local', ref: '' })).toBeNull();
    expect(readLocalSource({ kind: 'video', ref: 'https://x.com/a.mp4' })).toBeNull();
  });

  it('compara por tamaño: el nombre cada uno lo tiene como quiere', () => {
    expect(sameFile({ name: 'dune.mp4', sizeBytes: 999 }, { name: 'peli.mp4', sizeBytes: 999 })).toBe(true);
    expect(sameFile({ name: 'dune.mp4', sizeBytes: 999 }, { name: 'dune.mp4', sizeBytes: 998 })).toBe(false);
  });

  it('un archivo propio lo controla la app, igual que YouTube', () => {
    expect(isEmbeddable('local')).toBe(true);
  });
});

describe('entradas raras', () => {
  it('vacío es una fuente válida: es la sala recién creada', () => {
    const parsed = parseSource('');
    expect(parsed.ok && parsed.value).toEqual({ kind: 'external', ref: '' });
  });

  it('lo que no es un enlace se rechaza con un mensaje que se entiende', () => {
    const parsed = parseSource('pon dune porfa');
    expect(parsed.ok).toBe(false);
    expect(parsed.ok || parsed.error).toContain('enlace');
  });

  it('no se cuelan esquemas peligrosos', () => {
    expect(parseSource('javascript:alert(1)').ok).toBe(false);
    expect(parseSource('data:text/html,<script>').ok).toBe(false);
    expect(parseSource('file:///etc/passwd').ok).toBe(false);
  });

  it('lo que no es texto se rechaza', () => {
    expect(parseSource(42).ok).toBe(false);
    expect(parseSource(null).ok).toBe(false);
  });

  it('solo YouTube y los archivos se pueden incrustar', () => {
    expect(isEmbeddable('youtube')).toBe(true);
    expect(isEmbeddable('video')).toBe(true);
    expect(isEmbeddable('external')).toBe(false);
  });
});
