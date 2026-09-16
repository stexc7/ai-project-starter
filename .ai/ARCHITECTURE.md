# ARCHITECTURE.md — Cómo está construido

**Última revisión:** `2026-09-16`

---

## Vista general

```
 iPhone A ─┐                          ┌─ POST /api/rooms          crear sala
           ├──▶  Vercel (Next.js) ────┼─ POST /api/rooms/X/join   entrar (PIN)
 iPhone B ─┤           │              ├─ GET  /api/rooms/X/state  sondeo incremental
           │           │              ├─ POST /api/rooms/X/actions play, pausa, chat…
 Chrome ───┘           │              └─ GET  /api/time           el reloj compartido
 + extensión           ▼
                Upstash Redis
             juntos:room:<CODIGO>   la sala entera, en un JSON, TTL de 30 días
             juntos:attempts:<COD>  intentos de PIN fallidos, TTL de 15 minutos

 iPhone A ◀════ audio WebRTC, punto a punto ════▶ iPhone B
              (no pasa por Vercel ni por Redis)
```

**Por aquí no pasa vídeo.** Según la fuente, la app lo reproduce ella misma
(YouTube, archivos), lo mueve desde dentro de la página del servicio (extensión)
o coordina a las dos personas (Netflix en el móvil). Ver
[`PROJECT.md`](PROJECT.md) y el ADR-0002.

## Decisiones estructurales

| Decisión | Elección | Por qué | ADR |
|----------|----------|---------|-----|
| Sincronización | Ancla (instante, posición) + reloj NTP | Un mensaje "dale play" llega tarde y distinto a cada móvil; un instante absoluto no | [ADR-0002](../docs/adr/0002-sincronizacion-por-ancla-y-sondeo.md) |
| Control del reproductor | Adaptadores tras una interfaz común + bucle corrector | El motor no sabe si detrás hay un `<video>`, YouTube o Netflix | [ADR-0002](../docs/adr/0002-sincronizacion-por-ancla-y-sondeo.md) |
| Netflix de verdad | Extensión de escritorio (MV3) | Es el único sitio desde donde se puede tocar ese reproductor | [ADR-0002](../docs/adr/0002-sincronizacion-por-ancla-y-sondeo.md) |
| Voz | WebRTC punto a punto, señalización por el sondeo | El audio no tiene por qué pasar por nuestro servidor | `DECISIONS.md` |
| Transporte | Sondeo HTTP incremental | Vercel no mantiene conexiones abiertas, y la precisión no depende del canal | [ADR-0002](../docs/adr/0002-sincronizacion-por-ancla-y-sondeo.md) |
| Estado | Un JSON por sala en Redis, con *compare-and-set* | Dos personas pulsando a la vez es lo normal aquí, no lo raro | [ADR-0002](../docs/adr/0002-sincronizacion-por-ancla-y-sondeo.md) |
| Identidad | Código de sala + PIN, sin cuentas | Son dos personas que se conocen; una cuenta sobra y es superficie de ataque | `DECISIONS.md` |
| Estilos | CSS a mano | Dos pantallas | `DECISIONS.md` |

## Estructura de carpetas

```
app/                      Next.js App Router
  layout.tsx              Metadatos de la PWA (iOS standalone, tema, manifiesto)
  page.tsx                Portada: crear sala o entrar
  globals.css             Todo el sistema visual
  sala/[code]/page.tsx    La sala. Se pinta en el servidor: sin sesión, pide el PIN
  api/
    time/route.ts             El reloj. El endpoint más importante y el más simple
    rooms/route.ts            POST  crear
    rooms/[code]/join/route.ts    POST  entrar
    rooms/[code]/state/route.ts   GET   sondear
    rooms/[code]/actions/route.ts POST  actuar

src/domain/               Lógica pura: sin red, sin React, sin Date.now()
  types.ts                Sala, miembro, ancla, mensaje, reacción
  clock.ts                Estimación del desfase entre relojes
  playback.ts             Fases, posición, pausa, salto, consejo de desfase
  room.ts                 applyAction(sala, acción, contexto) -> sala
  sync.ts                 buildStateDelta (servidor) y mergeDelta (cliente)
  codes.ts                Generación y normalización de códigos
  format.ts               Timecodes: mostrar y leer
  validation.ts           Validación de toda entrada

src/server/               Lo que toca el mundo exterior
  store.ts                Upstash por REST o memoria; CAS con Lua
  auth.ts                 Token HMAC, PIN con scrypt
  actions.ts              Del JSON del navegador a una RoomAction validada
  http.ts                 Respuestas y resolución de sesión

src/ui/                   React, todo cliente
  AccessForm, RoomScreen, Countdown, Chat, Reactions, Watchlist
  SourcePicker.tsx        Pegar un enlace y decidir el modo
  VideoStage.tsx          Modo automático: el vídeo dentro de la app
  SyncStage.tsx           Modo asistido: cuenta atrás y timecode común
  VoiceBar.tsx            Controles de la llamada
  players/                Adaptadores y bucle de sincronía
    types.ts              PlayerHandle: play, pause, seek, setRate, position…
    Html5Player.tsx       Archivos de vídeo
    YouTubePlayer.tsx     YouTube, por su IFrame API
    usePlayerSync.ts      El bucle corrector, y los eventos hacia la sala
  useServerClock.ts       El reloj compartido y el ticker de repintado
  useRoom.ts              Sondeo y envío de acciones
  useVoiceCall.ts         WebRTC
  api.ts, beeps.ts

extension/                Extensión MV3 para Netflix, Prime, Disney+, Max
  content.js              Dentro de la página: engancha el <video>
  sync.js                 Espejo de domain/playback.ts (con test que lo vigila)
  background.js           Sesión, reloj y sondeo
  popup.html/js           Conectar y desconectar

tests/                    Vitest sobre domain/ y server/
scripts/generate-icons.mjs
```

## Reglas de dependencia

> Las flechas apuntan **hacia dentro**.

- `src/domain/` no importa de `src/server/`, `src/ui/` ni `app/`. Nada de `fetch`,
  nada de `Date.now()`, nada de React. **Esta es la regla que importa**: es lo que
  hace que la sincronización se pueda probar entera en milisegundos.
- `src/server/` puede importar `src/domain/`. Nunca al revés, nunca `src/ui/`.
- `src/ui/` puede importar `src/domain/` y hablar con la API por HTTP. Nunca
  importa `src/server/`: si lo hiciera, el hash del PIN acabaría en el bundle.
- `app/` compone: importa de los tres y no tiene lógica propia.

Romper una de estas reglas requiere un ADR que lo justifique.

## Flujos principales

### Flujo: arranque sincronizado

1. Al abrir la sala, cada móvil mide su desfase contra `/api/time` (5 muestras,
   mediana de las 3 más rápidas). Queda un `offsetMs` y un margen de error.
2. Una persona pulsa *Empezar juntos* → `POST actions {type:'start'}`.
3. El servidor fija `anchor = { atServerMs: ahora + 5 s, positionMs }` y sube la
   versión de la sala.
4. El otro móvil se entera en su siguiente sondeo (≤1 s durante la cuenta atrás).
5. **Cada móvil traduce ese instante a su propio reloj** y programa los pitidos
   en el reloj de `AudioContext`. Nadie espera un segundo mensaje.
6. Pasado `atServerMs`, `positionAt()` empieza a avanzar sola en los dos.

La cuenta atrás **no es un estado**: es un ancla en el futuro. Por eso no puede
desincronizarse.

### Flujo: sondeo incremental

`GET /state?since=<versión>` responde según lo que el cliente ya tenga:

| Caso | Respuesta |
|------|-----------|
| `since` = versión actual | ~110 bytes: reloj, versión y cuándo volver |
| `since` < versión actual | Núcleo de la sala + solo los mensajes con `seq > since` |
| `since` = 0 o futura | La sala entera |

El servidor decide también el ritmo (`nextPollMs`): 1 s en cuenta atrás, 2,5 s
reproduciendo, 2 s en reposo. Con la pestaña oculta el cliente espacia a 10 s.

### Flujo: corregir un desfase

1. Alguien abre *Desfase* y teclea el minuto que marca su Netflix.
2. `adviseOnDrift(esperado, reportado)` dice si va adelantado, atrasado o igual.
3. Si hay desfase, `nextResyncPoint()` propone el **siguiente minuto entero** que
   esté al menos 25 s por delante. Un número redondo se busca; «43:17» no.
4. Aceptar manda un `seek`, que deja la sala en pausa en ese punto. Los dos van
   ahí y se vuelve a contar desde cinco.

## Modelo de datos

| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| `Room` | Todo el estado de una sala, en un JSON | Contiene el resto |
| `Anchor` | `{ atServerMs, positionMs }` | Define la línea temporal entera |
| `Member` | Nombre, emoji y último latido | 2 por sala en la práctica |
| `ChatMessage` / `Reaction` | Llevan `seq` = versión en la que nacieron | Permiten los deltas |
| `WatchlistItem` | Qué ver algún día | Máximo 50 |

`Room.version` sube en cada cambio. Es a la vez el reloj lógico del sondeo y el
testigo del *compare-and-set*.

## Contratos de API

| Método | Ruta | Qué hace | Auth |
|--------|------|----------|------|
| `GET` | `/api/time` | Devuelve `serverMs` | No |
| `POST` | `/api/rooms` | Crea sala, devuelve código, pone cookie | No |
| `POST` | `/api/rooms/[code]/join` | Verifica PIN y pone cookie | PIN |
| `GET` | `/api/rooms/[code]/state?since=N` | Sondeo incremental | Cookie |
| `POST` | `/api/rooms/[code]/actions` | Aplica una acción | Cookie |

## Puntos de integración externos

| Servicio | Para qué | Qué pasa si se cae |
|----------|----------|--------------------|
| Upstash Redis | Guardar las salas | La app deja de funcionar: no hay copia local. Aceptado, es un proyecto de dos personas |
| Vercel | Servir la app | Lo mismo |

## Rendimiento y escala

- Carga esperada: **2 usuarios**. No es una cifra provisional, es el producto.
- Cuello de botella real: los comandos de Redis por sondeo. Por eso el servidor
  marca el ritmo y la respuesta es incremental.
- Coste estimado: ~40.000 invocaciones y ~20.000 comandos al mes. Cabe de sobra
  en los planes gratuitos.
- Sin caché: todo es estado vivo y va con `no-store`.

## Deuda técnica conocida

| Qué | Por qué existe | Impacto | Cuándo se paga |
|-----|----------------|---------|----------------|
| El almacén en memoria solo vale para un proceso | Es el modo de desarrollo, a propósito | Ninguno: en producción la app falla si faltan las variables de Upstash | No se paga |
| El bloqueo por intentos de PIN es por sala, no por IP | En serverless no hay estado de IP fiable y sobra para dos personas | Alguien con el código podría forzar el bloqueo de la sala 15 minutos | Si llega a molestar |
| No hay tests de navegador automatizados | Se validó a mano con dos contextos de Playwright | Una regresión de UI no la ve el CI | Cuando la UI se toque a menudo |
| La presencia depende de un latido cada 20 s | Evita escribir en Redis en cada sondeo | «Desconectada» puede tardar hasta 45 s en aparecer | No urge |
