/**
 * Genera los iconos de la PWA.
 *
 * Se dibujan por fórmula y se codifican a PNG a mano (zlib va en Node), para no
 * meter una dependencia de imagen ni versionar binarios que nadie sabe de dónde
 * salieron. Reejecutar con: `npm run icons`.
 *
 * El icono es un corazón con un triángulo de play recortado dentro.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Muestras por eje para suavizar los bordes. 4x4 = 16 por píxel. */
const SUPERSAMPLE = 4;

const GRADIENT_FROM = [124, 58, 237]; // violeta
const GRADIENT_TO = [251, 113, 133]; // coral
const FOREGROUND = [255, 255, 255];

// ─────────────────────────────── Formas ─────────────────────────────────

/** Curva implícita clásica del corazón: dentro cuando f(x, y) <= 0. */
const heartField = (x, y) => (x * x + y * y - 1) ** 3 - x * x * y * y * y;

/**
 * Caja que ocupa el corazón en su espacio normalizado. Se mide en vez de
 * escribirla a mano para que el dibujo quede centrado pase lo que pase.
 */
function heartBounds() {
  const steps = 400;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i <= steps; i += 1) {
    for (let j = 0; j <= steps; j += 1) {
      const x = -2 + (4 * i) / steps;
      const y = -2 + (4 * j) / steps;
      if (heartField(x, y) > 0) continue;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  return { minX, maxX, minY, maxY };
}

const BOUNDS = heartBounds();

/** Triángulo de play, en el espacio normalizado del corazón. */
const PLAY = [
  [-0.3, 0.42],
  [-0.3, -0.42],
  [0.44, 0.0],
];

function insidePlay(x, y) {
  const sign = ([ax, ay], [bx, by]) => (x - bx) * (ay - by) - (ax - bx) * (y - by);
  const d1 = sign(PLAY[0], PLAY[1]);
  const d2 = sign(PLAY[1], PLAY[2]);
  const d3 = sign(PLAY[2], PLAY[0]);

  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNegative && hasPositive);
}

// ─────────────────────────────── Dibujo ─────────────────────────────────

/**
 * @param {number} size  Lado en píxeles.
 * @param {number} cover Cuánto del lienzo ocupa el corazón (0-1). Los iconos
 *                       enmascarables necesitan dejar margen para el recorte.
 */
function drawIcon(size, cover) {
  const pixels = Buffer.alloc(size * size * 4);

  const heartWidth = BOUNDS.maxX - BOUNDS.minX;
  const heartHeight = BOUNDS.maxY - BOUNDS.minY;
  const scale = (size * cover) / Math.max(heartWidth, heartHeight);
  const centerX = (BOUNDS.minX + BOUNDS.maxX) / 2;
  const centerY = (BOUNDS.minY + BOUNDS.maxY) / 2;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let inside = 0;

      for (let sy = 0; sy < SUPERSAMPLE; sy += 1) {
        for (let sx = 0; sx < SUPERSAMPLE; sx += 1) {
          const canvasX = px + (sx + 0.5) / SUPERSAMPLE;
          const canvasY = py + (sy + 0.5) / SUPERSAMPLE;

          // El eje Y del lienzo crece hacia abajo; el de la fórmula, hacia arriba.
          const x = (canvasX - size / 2) / scale + centerX;
          const y = (size / 2 - canvasY) / scale + centerY;

          if (heartField(x, y) <= 0 && !insidePlay(x, y)) inside += 1;
        }
      }

      const coverage = inside / (SUPERSAMPLE * SUPERSAMPLE);
      // Degradado en diagonal, de la esquina superior izquierda a la inferior derecha.
      const t = (px + py) / (2 * (size - 1));
      const offset = (py * size + px) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const background = GRADIENT_FROM[channel] + (GRADIENT_TO[channel] - GRADIENT_FROM[channel]) * t;
        pixels[offset + channel] = Math.round(
          background + (FOREGROUND[channel] - background) * coverage,
        );
      }
      pixels[offset + 3] = 255;
    }
  }

  return pixels;
}

// ──────────────────────────── Codificación PNG ──────────────────────────

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, checksum]);
}

function encodePng(pixels, size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bits por canal
  header[9] = 6; // RGBA
  // Los tres siguientes (compresión, filtro, entrelazado) van a 0.

  // Cada línea lleva delante su byte de filtro; se usa el 0 (sin filtrar).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ──────────────────────────────── Salida ────────────────────────────────

const OUTPUTS = [
  { path: 'app/icon.png', size: 192, cover: 0.68 },
  { path: 'app/apple-icon.png', size: 180, cover: 0.62 },
  { path: 'public/icon-192.png', size: 192, cover: 0.68 },
  { path: 'public/icon-512.png', size: 512, cover: 0.68 },
  // Android recorta hasta un 20% por cada lado: el corazón se queda pequeño.
  { path: 'public/icon-maskable-512.png', size: 512, cover: 0.5 },
  // Extensión de Chrome.
  { path: 'extension/icon-128.png', size: 128, cover: 0.68 },
];

for (const { path, size, cover } of OUTPUTS) {
  const file = join(ROOT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, encodePng(drawIcon(size, cover), size));
  console.log(`${path}  ${size}x${size}`);
}
