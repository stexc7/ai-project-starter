# STACK.md — Tecnologías del proyecto

**Última revisión:** `2026-09-16`

---

## Resumen

| Capa | Tecnología | Versión | Por qué |
|------|-----------|---------|---------|
| Lenguaje | TypeScript | 5.9 | `strict` activado. La lógica de sincronización es matemática: los tipos aquí pagan |
| Framework | Next.js (App Router) | 15.5 | Front y API en un solo despliegue. Es lo que Vercel ejecuta nativamente |
| UI | React | 19.3 | Viene con Next |
| Estilos | CSS a mano | — | Un único `app/globals.css` con variables. No compensa meter un framework para una app de dos pantallas |
| Persistencia | Upstash Redis (API REST) | — | Clave-valor con caducidad; se habla por `fetch`, sin cliente, porque las funciones de Vercel son efímeras |
| Persistencia (local) | Memoria del proceso | — | Cero configuración para `npm run dev` |
| Autenticación | HMAC-SHA256 en cookie + PIN con scrypt | `node:crypto` | No hay cuentas. Ver `SECURITY.md` |
| Tiempo real | Sondeo HTTP incremental | — | Sin WebSockets: ver ADR-0002 |
| Tests | Vitest | 3.2 | Rápido y sin configuración sobre TypeScript |
| Linter | ESLint + `eslint-config-next` | 9.39 | Cero avisos tolerados |
| CI/CD | GitHub Actions + Vercel | — | `.github/workflows/ci.yml` |
| Hosting | Vercel | — | Plan gratuito |
| Observabilidad | Logs de Vercel | — | Para dos personas no hace falta más |

## Versiones exigidas

```
node   >= 20.9   (se desarrolla y se prueba en 22, ver .nvmrc)
npm    >= 10
```

## Puesta en marcha

```bash
# 1. Clonar
git clone https://github.com/stexc7/ai-project-starter.git
cd ai-project-starter

# 2. Dependencias
npm install

# 3. Variables de entorno (opcional en local)
cp .env.example .env.local

# 4. Arrancar
npm run dev
```

Queda en `http://localhost:3000`. **Sin `.env.local` también arranca**: usa un
almacén en memoria y un secreto de sesión temporal, y avisa por consola de las
dos cosas. Las salas se pierden al reiniciar, que en desarrollo da igual.

## Variables de entorno

| Variable | Obligatoria | Ejemplo | Para qué |
|----------|-------------|---------|----------|
| `SESSION_SECRET` | En producción | `openssl rand -base64 32` | Firma el token de sesión. Mínimo 16 caracteres |
| `UPSTASH_REDIS_REST_URL` | En producción | `https://xxx.upstash.io` | Dónde viven las salas |
| `UPSTASH_REDIS_REST_TOKEN` | En producción | `AX...` | Acceso a esa base de datos |

En producción, si falta alguna la app **falla al arrancar con un mensaje que dice
cuál**. Es deliberado: un fallo silencioso aquí significa dos personas mirando
pantallas que no se hablan.

> Los valores reales nunca van en el repositorio. En Vercel se ponen en
> *Settings → Environment Variables*.

## Convenciones del stack

- **`src/domain/` no importa nada de `src/server/` ni de `src/ui/`.** Es la regla
  que permite probar la sincronización entera sin navegador ni servidor.
- Todo instante compartido se expresa en **ms del reloj del servidor**. Si una
  variable lleva un tiempo, su nombre lo dice: `atServerMs`, `positionMs`,
  `nextPollMs`. Nunca un `time` a secas.
- Las rutas de API usan `runtime` de Node (por `node:crypto`) y `dynamic = 'force-dynamic'`.
  Todo lleva `Cache-Control: no-store`: aquí no hay nada cacheable.
- Nada de números mágicos: las constantes de tiempo van con nombre y comentario
  en el módulo que las usa.
- Los iconos de la PWA **se generan** con `npm run icons`. No se editan a mano;
  el CI comprueba que el PNG del repositorio coincide con el script.

## Lo que este proyecto **no** usa

| Tecnología | Por qué no |
|------------|------------|
| WebSockets / SSE | Las funciones de Vercel son efímeras y la precisión no viaja por el canal de mensajes, sino en el ancla. Ver ADR-0002 |
| Servidor TURN para la voz | Cuesta dinero y en redes domésticas no hace falta. Si falla, se avisa. Anotado como TASK-013 |
| Tailwind u otro framework CSS | Dos pantallas. El CSS a mano cabe en un archivo y evita una dependencia de build |
| Base de datos relacional | El estado es una sala que cabe en un JSON y caduca al mes |
| Un cliente de Redis (`ioredis`, `@upstash/redis`) | La API REST de Upstash se usa con `fetch` en 40 líneas |
| NextAuth o cualquier proveedor de identidad | No hay cuentas ni correos. Código de sala y PIN |
| App nativa de iOS | Es el camino que usaba Rave (Netflix incrustado dentro de la app) y el único que sincroniza Netflix en un iPhone. Exige Xcode, un Mac, 99 $/año y pasar revisión — y a Rave, Apple acabó retirándola igualmente |
