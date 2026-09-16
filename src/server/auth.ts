/**
 * Sesión y PIN.
 *
 * No hay cuentas ni correos: quien tiene el código de la sala y el PIN, entra.
 * Al entrar se firma un token con HMAC y se guarda en una cookie `httpOnly`,
 * para no volver a pedir el PIN cada noche.
 */

import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

/** Pasado este tiempo hay que volver a teclear el PIN. */
const SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1_000;
const SCRYPT_KEY_LENGTH = 32;
const SALT_BYTES = 16;

export interface Session {
  code: string;
  memberId: string;
  name: string;
  emoji: string;
  /** Emisión, en ms epoch. */
  iat: number;
}

/**
 * Secreto temporal de desarrollo.
 *
 * Va colgado de `globalThis` a propósito: en `next dev` este módulo se
 * instancia una vez **por ruta**, y con un `let` normal cada ruta firmaría con
 * un secreto distinto — ningún token creado al entrar valdría después.
 */
function developmentSecret(): string {
  const holder = globalThis as { __juntosDevSecret?: string };

  if (!holder.__juntosDevSecret) {
    holder.__juntosDevSecret = randomBytes(32).toString('hex');
    console.warn('[juntos] Sin SESSION_SECRET: se usa uno temporal. Las sesiones se caen al reiniciar.');
  }

  return holder.__juntosDevSecret;
}

function sessionSecret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Falta SESSION_SECRET (mínimo 16 caracteres). Genera uno con: openssl rand -base64 32',
    );
  }

  // Nunca se escribe en disco ni en los logs: al reiniciar toca volver a entrar.
  return developmentSecret();
}

const toBase64Url = (value: Buffer | string) =>
  Buffer.from(value).toString('base64url');

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

/** Comparación en tiempo constante, tolerante a longitudes distintas. */
function equals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function createSessionToken(session: Session): string {
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

/**
 * Devuelve la sesión solo si la firma es válida, no ha caducado y pertenece a
 * la sala pedida. Cualquier otra cosa es `null`: no se distingue el motivo para
 * no dar pistas a quien esté probando tokens.
 */
export function readSessionToken(token: string | undefined, code: string): Session | null {
  if (!token) return null;

  const separator = token.indexOf('.');
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  if (!equals(token.slice(separator + 1), sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Session;
    if (session.code !== code) return null;
    if (Date.now() - session.iat > SESSION_TTL_MS) return null;
    return session;
  } catch {
    return null;
  }
}

/** Una cookie por sala: así se pueden tener dos salas abiertas sin pisarse. */
export function sessionCookieName(code: string): string {
  return `juntos_s_${code}`;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: Math.floor(SESSION_TTL_MS / 1_000),
} as const;

// ──────────────────────────────── PIN ───────────────────────────────────

export function hashPin(pin: string): string {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(pin, salt, SCRYPT_KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const derived = scryptSync(pin, Buffer.from(saltHex, 'hex'), SCRYPT_KEY_LENGTH);
  return equals(derived.toString('hex'), hashHex);
}

export function newMemberId(): string {
  return randomUUID();
}
