/**
 * Persistencia de las salas.
 *
 * Dos implementaciones con la misma interfaz:
 *
 * - **Upstash Redis** (producción). Se habla con su API REST por `fetch`, sin
 *   cliente ni dependencia: en Vercel las funciones son efímeras y no pueden
 *   mantener una conexión TCP abierta entre invocaciones.
 * - **Memoria** (desarrollo). Cero configuración para arrancar en local.
 *
 * Las escrituras son *compare-and-set*: se relee, se muta y se guarda solo si
 * nadie escribió por medio. Dos personas pulsando a la vez es el caso normal
 * aquí, no el raro.
 */

import type { Room } from '@/domain/types';

/** Una sala sin actividad durante un mes se borra sola. */
const ROOM_TTL_SECONDS = 60 * 60 * 24 * 30;
/** Reintentos ante colisión de escritura antes de rendirse. */
const MAX_CAS_RETRIES = 5;

export type UpdateResult =
  | { ok: true; room: Room }
  | { ok: false; reason: 'not-found' | 'conflict' };

export interface RoomStore {
  get(code: string): Promise<Room | null>;
  /** `false` si el código ya estaba cogido. */
  create(room: Room): Promise<boolean>;
  update(code: string, mutate: (room: Room) => Room): Promise<UpdateResult>;
  /** Lee un contador de intentos fallidos. */
  attempts(key: string): Promise<number>;
  /** Suma un intento fallido y devuelve el total. Caduca solo. */
  recordAttempt(key: string, ttlSeconds: number): Promise<number>;
}

const roomKey = (code: string) => `juntos:room:${code}`;
const attemptKey = (key: string) => `juntos:attempts:${key}`;

// ─────────────────────────────── Upstash ────────────────────────────────

/**
 * Guarda solo si el contenido sigue siendo exactamente el que leímos. Se compara
 * la cadena JSON tal cual, sin decodificarla: es exacto y no depende de que el
 * servidor tenga cjson.
 */
const CAS_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
  return 1
end
return 0
`;

class UpstashRoomStore implements RoomStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  private async command<T>(args: (string | number)[]): Promise<T> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      cache: 'no-store',
    });

    if (!response.ok) {
      // El cuerpo de Upstash puede contener la URL con el token: no se propaga.
      throw new Error(`Redis respondió ${response.status} a ${String(args[0])}`);
    }

    const payload = (await response.json()) as { result?: T; error?: string };
    if (payload.error) throw new Error(`Redis: ${payload.error}`);
    return payload.result as T;
  }

  private async getRaw(code: string): Promise<string | null> {
    return this.command<string | null>(['GET', roomKey(code)]);
  }

  async get(code: string): Promise<Room | null> {
    const raw = await this.getRaw(code);
    return raw ? (JSON.parse(raw) as Room) : null;
  }

  async create(room: Room): Promise<boolean> {
    const result = await this.command<string | null>([
      'SET',
      roomKey(room.code),
      JSON.stringify(room),
      'NX',
      'EX',
      ROOM_TTL_SECONDS,
    ]);
    return result === 'OK';
  }

  async update(code: string, mutate: (room: Room) => Room): Promise<UpdateResult> {
    for (let attempt = 0; attempt < MAX_CAS_RETRIES; attempt += 1) {
      const raw = await this.getRaw(code);
      if (raw === null) return { ok: false, reason: 'not-found' };

      const next = mutate(JSON.parse(raw) as Room);
      const applied = await this.command<number>([
        'EVAL',
        CAS_SCRIPT,
        1,
        roomKey(code),
        raw,
        JSON.stringify(next),
        ROOM_TTL_SECONDS,
      ]);

      if (applied === 1) return { ok: true, room: next };
    }

    return { ok: false, reason: 'conflict' };
  }

  async attempts(key: string): Promise<number> {
    const value = await this.command<string | null>(['GET', attemptKey(key)]);
    return value === null ? 0 : Number(value);
  }

  async recordAttempt(key: string, ttlSeconds: number): Promise<number> {
    const total = await this.command<number>(['INCR', attemptKey(key)]);
    // Solo el primero fija la ventana: si no, cada fallo la reiniciaría y el
    // bloqueo no llegaría a caducar nunca.
    if (total === 1) await this.command(['EXPIRE', attemptKey(key), ttlSeconds]);
    return total;
  }
}

// ──────────────────────────────── Memoria ───────────────────────────────

interface MemoryEntry {
  raw: string;
  expiresAtMs: number;
}

const memoryAttempts: Map<string, MemoryEntry> = ((
  globalThis as { __juntosAttempts?: Map<string, MemoryEntry> }
).__juntosAttempts ??= new Map());

/**
 * En desarrollo, Next recarga los módulos en caliente. Sin colgar el mapa de
 * `globalThis`, cada recarga vaciaría las salas.
 */
const memoryRooms: Map<string, MemoryEntry> = ((
  globalThis as { __juntosRooms?: Map<string, MemoryEntry> }
).__juntosRooms ??= new Map());

class MemoryRoomStore implements RoomStore {
  private read(code: string): string | null {
    const entry = memoryRooms.get(code);
    if (!entry) return null;
    if (entry.expiresAtMs <= Date.now()) {
      memoryRooms.delete(code);
      return null;
    }
    return entry.raw;
  }

  private write(code: string, raw: string): void {
    memoryRooms.set(code, { raw, expiresAtMs: Date.now() + ROOM_TTL_SECONDS * 1_000 });
  }

  async get(code: string): Promise<Room | null> {
    const raw = this.read(code);
    return raw ? (JSON.parse(raw) as Room) : null;
  }

  async create(room: Room): Promise<boolean> {
    if (this.read(room.code) !== null) return false;
    this.write(room.code, JSON.stringify(room));
    return true;
  }

  async update(code: string, mutate: (room: Room) => Room): Promise<UpdateResult> {
    const raw = this.read(code);
    if (raw === null) return { ok: false, reason: 'not-found' };

    // `mutate` es síncrona, así que aquí no cabe una carrera: Node no cede el
    // control entre la lectura y la escritura.
    const next = mutate(JSON.parse(raw) as Room);
    this.write(code, JSON.stringify(next));
    return { ok: true, room: next };
  }

  async attempts(key: string): Promise<number> {
    const entry = memoryAttempts.get(key);
    if (!entry || entry.expiresAtMs <= Date.now()) {
      memoryAttempts.delete(key);
      return 0;
    }
    return Number(entry.raw);
  }

  async recordAttempt(key: string, ttlSeconds: number): Promise<number> {
    // `attempts` ya ha borrado la entrada si había caducado.
    const current = await this.attempts(key);
    const existing = memoryAttempts.get(key);
    const expiresAtMs = existing?.expiresAtMs ?? Date.now() + ttlSeconds * 1_000;

    memoryAttempts.set(key, { raw: String(current + 1), expiresAtMs });
    return current + 1;
  }
}

// ──────────────────────────────── Fábrica ───────────────────────────────

let store: RoomStore | null = null;

export function getRoomStore(): RoomStore {
  if (store) return store;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    store = new UpstashRoomStore(url, token);
    return store;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Faltan UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN. ' +
        'Sin ellas cada función de Vercel tendría su propia copia de las salas y los dos móviles no se verían.',
    );
  }

  console.warn('[juntos] Sin Upstash configurado: las salas viven en memoria y se pierden al reiniciar.');
  store = new MemoryRoomStore();
  return store;
}

/** Solo para los tests: descarta la instancia memorizada. */
export function resetRoomStoreForTests(): void {
  store = null;
  memoryRooms.clear();
  memoryAttempts.clear();
}
