# Juntos — watch party para dos

> Ver una película a la vez, aunque estéis en dos casas.
> PWA instalable en iPhone. Se despliega en Vercel.

---

## Tres modos, y por qué son tres

Esto es lo que hay que entender antes que nada, porque condiciona el diseño
entero. **Y es exactamente el mismo reparto que tiene Hearo**, aunque no lo
cuenten así.

| Modo | Para qué | Qué pasa |
|------|----------|----------|
| **Automático** | YouTube, archivos de vídeo | El vídeo va **dentro de la app**. Uno le da al play y al otro le arranca solo. Pausa, salto y corrección de deriva, todo automático |
| **Extensión** | Netflix, Prime, Disney+, Max — **en ordenador** | La extensión se mete dentro de la página del servicio y mueve su reproductor. Lo mismo que Teleparty |
| **Asistido** | Netflix y compañía — **en el iPhone** | La app no puede tocar el reproductor, así que sincroniza a las dos personas: cuenta atrás al milisegundo y timecode común |

### Por qué el tercero existe

Netflix va cifrado con **DRM** (Widevine, PlayReady, FairPlay). Eso significa que:

- No se puede incrustar en un `<iframe>` de otra web.
- No se puede controlar su reproductor desde otra página: es otro origen.
- No se puede compartir por FaceTime, Zoom o Discord: sale la pantalla en negro.

**Ni Rave ni Teleparty eran webs — y no eran lo mismo entre sí:**

- **Teleparty** es una extensión de Chrome de escritorio. Se inyecta dentro de
  `netflix.com` y desde ahí sí puede tocar el `<video>`.
- **Rave** era una **app nativa de iPhone y Android con Netflix incrustado
  dentro**. Te logueabas en Netflix desde la propia Rave y veías su catálogo sin
  salir de la app. Como el navegador era suyo, podía controlar ese reproductor.
  Eso es justo lo que ninguna web puede hacer, y por eso Rave sí funcionaba en el
  móvil.

Las dos hacen el mismo truco desde sitios distintos: **meterse dentro de la
página donde vive el reproductor.** Por eso nosotros también tenemos
[una extensión](../extension/README.md) — pero una web, desde fuera, no tiene
dónde meterse.

Y un detalle que conviene saber: **Rave no cerró por un problema técnico.**
Apple la retiró de la App Store en agosto de 2025, tras diez años y 73 millones
de descargas en iOS, citando una cláusula genérica de su acuerdo de
desarrollador. Rave sostiene que fue por competir con SharePlay y lo está
litigando en Canadá y Estados Unidos. Es decir: el camino de Rave sigue siendo
técnicamente posible; lo que desapareció fue el permiso para distribuirlo.

En cuanto a Hearo, **le pasa lo mismo que a nosotros**: en el móvil te manda a
la app de Netflix y la sincronización se degrada — hay hilos de soporte suyos
con exactamente esa queja. No es una limitación nuestra, es la frontera del DRM
para cualquiera que no sea una app nativa.

Así que en iPhone + Netflix, el modo asistido no es un truco barato: es lo único
que existe. Y con un reloj compartido al milisegundo, funciona.

### Lo que hace y lo que no

| Hace | No hace |
|------|---------|
| Mover los dos reproductores (YouTube, vídeo, y Netflix con la extensión) | Reproducir contenido con DRM dentro de la web |
| Corregir la deriva sola, sin que nadie toque nada | Saltarse el DRM |
| Que los dos pulséis play a la vez cuando no queda otra | Guardar contraseñas de Netflix |
| **Chat de voz**, chat de texto, reacciones y lista de qué ver | Vídeo de vosotros |

---

## Cómo se usa

Siempre empieza igual: uno **crea una sala** y le pasa al otro el código (6
caracteres) y el PIN. La sala dura un mes sin usarse, así que podéis volver a la
misma cada noche.

Dentro, pegáis un enlace y la app decide sola en qué modo va.

### Con YouTube o un archivo de vídeo — no hay que hacer nada

Pega el enlace, cada uno toca una vez la pantalla (iOS no deja arrancar un vídeo
sin un toque previo) y ya está: **dale al play y al otro le arranca**. Pausa,
adelanta o retrocede donde quieras; se aplica en los dos. Si os separáis por lo
que sea, se corrige solo.

### Con Netflix en el ordenador — instalad la extensión

Ver [`../extension/README.md`](../extension/README.md). Se carga en dos minutos y
a partir de ahí Netflix se comporta como YouTube: play, pausa y saltos
compartidos, automáticos.

### Con Netflix en el iPhone — modo asistido

1. Pegáis el enlace de Netflix (o pulsáis *Vamos a ver Netflix*).
2. Cada uno abre **Netflix en su móvil o su tele** con el mismo título, y lo deja
   **en pausa** en el minuto que indique la app.
3. Uno pulsa **Empezar juntos**: en los dos móviles arranca la misma cuenta
   atrás, con pitidos.
4. En el **¡dale play!**, los dos a la vez.
5. A partir de ahí el timecode grande es el de los dos. Si uno se desfasa,
   **Desfase** propone un minuto redondo para reencontraros.

### Hablar mientras veis

El botón **Hablar** abre una llamada de voz entre los dos. El audio va directo de
un móvil al otro, sin pasar por ningún servidor nuestro. Poneos auriculares: sin
ellos el micro coge el sonido de la peli y se oye eco.

### Instalarla en el iPhone

Safari → compartir → **Añadir a pantalla de inicio**. Se abre sin barra de
navegador, con su icono, como una app más.

---

## Cómo consigue la precisión

El problema real no es mandar "dale play": ese mensaje llega tarde, y distinto,
a cada teléfono. El problema es que **los dos relojes no coinciden**: dos iPhone
pueden llevar segundos de diferencia entre sí.

Juntos lo resuelve en dos pasos.

### 1. Un reloj común

Cada móvil mide su desfase contra el servidor al estilo NTP (`src/domain/clock.ts`):
lanza cinco peticiones a `/api/time`, mide ida y vuelta, y se queda con la
mediana de las tres más rápidas. Las lentas se descartan porque arrastran un
error grande. El resultado típico es un margen de **±20-60 ms**, y la app lo
enseña abajo del todo para que no haya que fiarse a ciegas.

### 2. Un ancla, no un mensaje

En vez de transmitir "voy por el minuto 42" cada segundo, la sala guarda un solo
par de números (`src/domain/playback.ts`):

```
ancla = { atServerMs: <instante absoluto>, positionMs: <minuto de la peli> }
```

Se lee así: *"en el instante `atServerMs`, la película iba por `positionMs`"*.
Con eso, cualquier móvil calcula el timecode exacto en cualquier momento, sin
depender de que llegue ningún mensaje a tiempo:

```
posición(ahora) = positionMs + max(0, ahora − atServerMs)
```

Y la cuenta atrás sale gratis: **es un ancla en el futuro**. Si `atServerMs`
todavía no ha llegado, la película está parada y lo que se ve es el contador.
No hay un "estado de cuenta atrás" que pueda desincronizarse, porque no existe:
se deriva.

Los pitidos se programan en el reloj de `AudioContext`, no con `setTimeout`,
porque el temporizador de JavaScript en un móvil se retrasa decenas de
milisegundos y el "¡dale!" es justo lo que no puede llegar tarde.

### 3. El corrector de deriva

Arrancar a la vez no basta: dos reproductores se separan solos con el tiempo —
uno carga más lento, el otro decodifica a otro ritmo. Por eso, cuando la app
controla el reproductor (modo automático o extensión), un bucle compara cada
250 ms dónde debería ir con dónde va y decide (`reconcile`, en `playback.ts`):

| Desfase | Qué hace | Por qué |
|---------|----------|---------|
| ≤ 150 ms | **Nada** | Corregir se notaría más que el error |
| 150 ms – 1,5 s | **Ajustar la velocidad** ±5 % | Imperceptible. Un segundo de retraso se reabsorbe en veinte |
| ≥ 1,5 s | **Saltar** | Ya se vería; un salto limpio molesta menos que ir a destiempo |

Es la misma estrategia que usan Teleparty y Hearo, y la razón de que no se noten
tirones: saltar por cada décima daría brincos constantes.

Medido con dos navegadores de verdad: con una deriva forzada de **2,9 s**, el
corrector la deja en **0,15 s en 1,4 segundos**, y ahí se queda.

### Corregir el desfase a mano (modo asistido)

Cuando la app no puede tocar el reproductor, no hay corrector automático posible.
Y pedirle a alguien que "adelante cuatro segundos" no funciona: es imposible
clavarlo arrastrando la barra de Netflix. Así que **Desfase** hace otra cosa:
comparas el minuto que marca tu Netflix con el de la sala, y la app propone un
**minuto redondo** al que ir los dos (`nextResyncPoint`), con margen suficiente
para llegar. Los dos buscáis ese punto y se vuelve a contar desde cinco.

### La voz

WebRTC, punto a punto. El audio va **directo de un móvil al otro**: ni pasa por
Vercel ni se guarda en ningún sitio. Por el servidor solo viajan los tres o
cuatro mensajes de negociación, por el mismo sondeo que el chat — y mientras se
negocia, el servidor acelera el sondeo a 600 ms para que la llamada se abra en
un par de segundos en vez de en seis.

Sin servidor TURN: en la mayoría de redes domésticas no hace falta. Si alguna red
móvil lo impide, la app lo dice en vez de quedarse colgada.

---

## Estructura del código

```
app/                     Next.js App Router
  page.tsx               Portada: crear o entrar
  sala/[code]/page.tsx   La sala, pintada ya en el servidor
  api/                   Endpoints
    time/                El reloj compartido
    rooms/               Crear, entrar, sondear, actuar

src/domain/              Lógica pura. Sin red, sin React, sin reloj del sistema.
  clock.ts               Estimación del desfase entre relojes
  playback.ts            Ancla, fases, pausa, salto, desfase
  room.ts                La sala como reducer: applyAction(sala, acción) → sala
  sync.ts                Protocolo de sondeo y fusión incremental
  codes.ts               Códigos de sala
  format.ts              Timecodes
  validation.ts          Validación de entrada
  sources.ts             Qué es cada enlace: incrustable o con DRM
  types.ts               Tipos compartidos

src/server/              Todo lo que toca el mundo exterior
  store.ts               Upstash Redis por REST, o memoria en local
  auth.ts                Sesión firmada (HMAC) y PIN (scrypt)
  actions.ts             Valida lo que llega del navegador
  http.ts                Utilidades de las rutas

src/ui/                  Componentes de React
  players/               Adaptadores de reproductor y el bucle de sincronía
    types.ts             El contrato común: play, pause, seek, position…
    Html5Player.tsx      Archivos de vídeo
    YouTubePlayer.tsx    YouTube, por su IFrame API
    usePlayerSync.ts     El bucle que los mantiene pegados a la sala
  useVoiceCall.ts        La llamada de voz (WebRTC)
  VideoStage.tsx         Modo automático
  SyncStage.tsx          Modo asistido

extension/               Extensión de escritorio para Netflix y compañía
tests/                   Vitest sobre `domain`, `server` y la extensión
scripts/generate-icons.mjs   Genera los PNG del icono por fórmula
```

**Los adaptadores de reproductor** son la pieza que hace que el motor no sepa —ni
le importe— qué hay detrás. `PlayerHandle` define seis métodos (`play`, `pause`,
`seek`, `setRate`, `position`, `isPlaying`) y los implementan por igual el
`<video>`, el iframe de YouTube y, desde la extensión, el reproductor de Netflix.
Añadir Vimeo o Twitch sería un archivo más, sin tocar la sincronización.

**Regla de dependencia:** `domain` no importa nada de `server` ni de `ui`. Es lo
que permite que la parte difícil — la sincronización — se pruebe entera sin
levantar un navegador ni un servidor.

### Por qué sondeo y no WebSockets

En Vercel las funciones son efímeras: no hay dónde mantener una conexión abierta
sin meter un servicio aparte. Y no hace falta, porque **la precisión del arranque
no viaja por el canal de mensajes**, viaja en el ancla. El sondeo solo trae chat,
presencia y cambios de estado, donde un par de segundos no se notan.

Para que salga barato, el servidor decide el ritmo (1 s en cuenta atrás, 2,5 s
reproduciendo) y responde en incremental: si el cliente ya está al día, la
respuesta son ~110 bytes. Con la pestaña en segundo plano se espacia a 10 s.

---

## Puesta en marcha en local

```bash
npm install
npm run dev
```

En `http://localhost:3000`. Sin configurar nada: las salas viven en memoria y la
sesión se firma con un secreto temporal. Al reiniciar el servidor se pierden las
dos cosas, y la consola avisa de ello.

```bash
npm test        # 67 tests sobre la lógica de sincronización y seguridad
npm run lint
npm run typecheck
npm run build
npm run icons   # regenera los PNG del icono
```

Para desplegar: [`runbooks/deployment.md`](runbooks/deployment.md).

---

## Seguridad

- **No hay cuentas.** El código de sala (6 caracteres de un alfabeto de 31, unas
  900 millones de combinaciones) es el secreto fuerte; el PIN de 4 dígitos evita
  que entre quien vea el código por encima del hombro.
- El PIN se guarda con **scrypt** y sal aleatoria. Nunca en claro.
- La sesión es un token **HMAC-SHA256** en una cookie `httpOnly`, una por sala.
- Diez PIN fallidos bloquean la sala **15 minutos**.
- Código incorrecto y PIN incorrecto dan **el mismo error**: así no se puede
  averiguar qué salas existen probando códigos.
- El hash del PIN **nunca sale del servidor**; hay un test que lo comprueba.
- **Aquí no se ponen las credenciales de Netflix.** La app no las necesita ni las
  pide, y nadie debería dárselas.

---

## Lo que esta app no resuelve, y qué usar en su lugar

Merece la pena saber las alternativas, porque según el día una encaja mejor:

| Si… | Usa |
|-----|-----|
| Estáis los dos en un **ordenador** con Chrome | [Teleparty](https://www.teleparty.com): sincroniza de verdad el reproductor, sin cuentas atrás |
| Queréis ver **vuestros propios archivos** | Plex o Jellyfin con *Watch Together*: sincronización automática y real |
| Queréis **veros la cara** mientras | FaceTime o una llamada aparte, en paralelo a Juntos |
| Estáis **en el mismo sitio** | El sofá |

Juntos es para el caso concreto que no cubre ninguna de ellas: **dos iPhone, dos
casas, contenido con DRM**.

### Límites conocidos

- El arranque depende de que los dos toquéis play al oír el aviso. El margen
  humano (~100-200 ms) es mayor que el error de la app (~40 ms).
- La app no sabe si de verdad le habéis dado al play: si uno se despista, hay que
  usar **Desfase**. Es la consecuencia directa de que Netflix no deje mirar.
- Con la app en segundo plano, iOS congela los temporizadores. Al volver se
  resincroniza el reloj sola, pero la cuenta atrás hay que verla en pantalla.
