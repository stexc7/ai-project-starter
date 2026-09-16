# 0002 — Sincronizar con un ancla temporal y sondeo, no con mensajes en vivo

**Estado:** Aceptado
**Fecha:** 2026-09-16
**Decisores:** Claude Code
**Tarea relacionada:** TASK-005

---

## Contexto

Juntos tiene que conseguir que dos personas, en dos casas y con dos iPhone,
pulsen play en su Netflix **en el mismo instante**.

Tres hechos delimitan el problema:

1. **El contenido va cifrado con DRM.** La app no puede reproducirlo, ni
   incrustarlo, ni tocar el reproductor de Netflix. Lo único que se puede
   sincronizar son las dos personas, no los dos reproductores.
2. **Los relojes de los móviles no coinciden.** Dos iPhone pueden llevar segundos
   de diferencia entre sí. Cualquier cuenta atrás basada en la hora local sale
   descuadrada.
3. **El despliegue es Vercel.** Las funciones son efímeras: no hay dónde mantener
   una conexión abierta ni estado en memoria entre peticiones.

El enfoque evidente —mandar un mensaje "dale play ahora" por WebSocket— falla en
lo esencial: el mensaje llega tarde, y llega **distinto** a cada teléfono. Esa
diferencia es exactamente el error que hay que eliminar.

## Decisión

Tres piezas que se sostienen entre sí.

### 1. Un reloj común, medido al estilo NTP

Cada móvil estima su desfase contra el servidor con cinco muestras a
`/api/time`, quedándose con la mediana de las tres de menor ida y vuelta. Da un
margen típico de ±20-60 ms, que la app muestra en pantalla.

### 2. Un ancla, no un evento

El estado de reproducción de la sala es un único par:

```
anchor = { atServerMs, positionMs }
```

*"En el instante `atServerMs` del reloj del servidor, la película iba por
`positionMs`."* Con eso, cualquier cliente calcula el timecode en cualquier
momento sin depender de que ningún mensaje llegue puntual.

La consecuencia importante: **la cuenta atrás no es un estado, es un ancla en el
futuro**. Si `atServerMs` aún no ha llegado, la película está parada y lo que se
ve es el contador. No hay un estado `countdown` que pueda quedar desincronizado,
porque no existe: se deriva.

### 3. Un corrector de deriva sobre el reproductor

Cuando la app **sí** controla el reproductor (YouTube, archivos y, desde la
extensión, Netflix), un bucle compara cada 250 ms el ancla con la posición real y
corrige: nada por debajo de 150 ms, un ajuste de velocidad de ±5 % hasta 1,5 s, y
un salto por encima. Es lo que hace que no basten «arrancamos a la vez»: dos
reproductores se separan solos, y saltar por cada décima daría tirones.

El corrector se calla mientras la persona acaba de pedir algo (`INTENT_MS`). Sin
eso el bucle pelea contra quien lo usa: das al play y 250 ms después te pausa,
porque la sala todavía no se ha enterado.

### 4. Sondeo incremental, con el ritmo puesto por el servidor

El cliente pregunta `GET /state?since=<versión>`. El servidor responde solo con
lo posterior a esa versión, y le dice cuándo volver (1 s en cuenta atrás, 2,5 s
reproduciendo, 2 s en reposo). Si el cliente está al día, la respuesta son unos
110 bytes.

Se puede hacer así precisamente porque **la precisión no viaja por este canal**.
El sondeo trae chat, presencia y cambios de estado, donde dos segundos no se
notan. El instante exacto ya está en el ancla.

Como corolario, las escrituras en Redis son *compare-and-set* con un script Lua
que compara la cadena JSON anterior: dos personas pulsando a la vez es el caso
normal aquí, y un mensaje de chat perdido por una carrera sería un bug real.

## Alternativas descartadas

**WebSockets con un servicio externo (Pusher, Ably, Supabase Realtime).**
Añade una cuenta más que mantener y una pieza más que puede caerse, y no mejora
lo que importa: aunque el mensaje llegue en 20 ms, sigue llegando distinto a cada
móvil. El ancla lo resuelve sin dependencias.

**Server-Sent Events desde una función de Vercel.**
El plan gratuito corta las respuestas largas, así que habría que reconectar cada
pocos segundos: la misma latencia efectiva que el sondeo, con más código.

**Transmitir la posición cada segundo ("voy por el 42:10").**
Multiplica el tráfico y encima es menos preciso: cada dato llega ya caducado por
la latencia. El ancla manda la misma información una sola vez y no caduca.

**Una extensión de navegador tipo Teleparty, *en lugar* de esto.**
Es la única forma de mover el reproductor de Netflix, así que **se ha construido
también** (`extension/`) — pero no sustituye a lo de arriba: en el iPhone no hay
extensiones que puedan hacerlo. Las dos cosas comparten la misma sala, la misma
API y la misma matemática, y conviven.

## Consecuencias

**Lo que se gana**

- Precisión que no depende de la red: el error es el del reloj (±40 ms), no el
  de la latencia (±300 ms y variable).
- Cero dependencias de tiempo real. Tres variables de entorno y se acabó.
- La parte difícil queda en funciones puras (`domain/clock.ts`,
  `domain/playback.ts`, `domain/sync.ts`) y se prueba entera sin navegador ni
  servidor. Son 67 tests que corren en menos de un segundo.
- Coste que cabe en los planes gratuitos.

**Lo que se pierde**

- Un mensaje de chat tarda hasta 2,5 s en aparecer. Aceptable: es un chat de
  sofá, no una sala de trading.
- La presencia («está conectada») se refresca cada 20 s, con hasta 45 s de
  retraso al detectar una desconexión.
- Hay que mantener a mano la coherencia entre dos constantes que viven en
  módulos distintos: `REACTION_TTL_MS` en `room.ts` y `REACTION_VISIBLE_MS` en
  `sync.ts`. Ambas están comentadas señalando a la otra.
- La extensión no puede compilar TypeScript, así que la matemática está duplicada
  en `extension/sync.js`. Hay un test que compara las dos implementaciones con
  cientos de entradas para que no puedan separarse en silencio.

**Lo que queda pendiente**

- Si algún día se quisiera bajar la latencia del chat, el sitio por donde entrar
  es el transporte, y **el ancla no habría que tocarla**: son independientes a
  propósito.
