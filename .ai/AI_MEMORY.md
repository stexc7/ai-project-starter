# AI_MEMORY.md — Memoria compartida entre sesiones

> **Este archivo es la memoria a largo plazo del proyecto.** Claude Code, Codex y
> Zoo Code escriben aquí y leen de aquí. Es lo que evita que cada sesión empiece
> desde cero.

## Cómo usarlo

**Al empezar una sesión:** lee todo el archivo.
**Al terminar una tarea:** añade lo que la próxima sesión necesitará saber.

### Qué **sí** va aquí

- Cosas que descubriste y no son evidentes leyendo el código.
- Trampas: "el test X falla en Windows por los saltos de línea".
- Preferencias del humano que ya te corrigió una vez.
- Estado de cosas a medias: "el módulo de pagos está a la mitad, falta el webhook".
- Contexto externo: "el cliente pidió priorizar móvil sobre escritorio".

### Qué **no** va aquí

- Lo que ya está en el código (se lee del código).
- Lo que ya está en el historial de Git.
- Decisiones de arquitectura → van a `DECISIONS.md` o a un ADR.
- Bugs → van a `BUGS.md`.
- Tareas → van a `TASKS.md`.

### Formato

```
### AAAA-MM-DD — <Título corto>
**Agente:** Claude Code | Codex | Zoo Code
**Contexto:** qué estabas haciendo.
**Aprendido:** el hecho que importa.
**Aplicar cuando:** en qué situación futura sirve esto.
```

Mantén el archivo **por debajo de ~200 líneas**. Cuando crezca demasiado,
consolida: fusiona entradas repetidas, borra lo que ya no aplica.

---

## Entradas

### 2026-09-17 — El almacén en memoria oculta las carreras de escritura
**Agente:** Claude Code
**Contexto:** Al verificar el despliegue se probó por primera vez el camino de
Upstash, contra un doble local de su API REST.
**Aprendido:** El almacén en memoria es síncrono: no puede haber colisiones, así
que todos los tests pasaban. Con Redis sí las hay, y el compare-and-set
reintentaba **cinco veces seguidas sin esperar**: los que chocaban volvían a
chocar. De 30 escrituras simultáneas se perdían 5. Arreglado con espera creciente
y aleatoria (8 intentos). Importa de verdad en la negociación de la llamada de
voz, que manda varios candidatos ICE casi a la vez.
**Aplicar cuando:** Se toque `src/server/store.ts`, o se añada cualquier cosa que
escriba en ráfaga. El test `tests/store-upstash.test.ts` lo cubre ahora.

### 2026-09-17 — La portada carga aunque falten las variables de entorno
**Agente:** Claude Code
**Contexto:** Verificación del despliegue en Vercel.
**Aprendido:** `/` es estática y no toca el almacén, así que responde 200 sin
`UPSTASH_*` ni `SESSION_SECRET`. El fallo solo aparece al **crear o entrar en una
sala** (500, con el motivo en los logs de Vercel). Ver la portada no prueba nada.
**Aplicar cuando:** Alguien diga «la app carga, así que las variables están bien».

### 2026-09-16 — Netflix en una PWA está bloqueado en tres capas, no en una
**Agente:** Claude Code
**Contexto:** El humano insistió: «hazlo como Rave y punto, un PWA que funcione».
**Aprendido:** No es cuestión de esfuerzo. Netflix manda `X-Frame-Options: DENY`
(no entra en un iframe), la política de mismo origen impide tocar su `<video>`
aunque entrara, y el DRM no entrega licencia a un reproductor de terceros. Las
tres las aplica el navegador. No hay API ni flag. Rodearlo exigiría un proxy que
reescriba cabeceras y redistribuya contenido cifrado: ni funciona ni se hace.
**Lo que sí se pudo dar:** archivos propios sincronizados, que era la forma en
que más se usaba Rave. Cada uno abre su copia, sincronía completa, sin subir nada.
**Aplicar cuando:** Se vuelva a pedir Netflix dentro de la web. La respuesta útil
no es «no se puede», es «esto otro sí, y cubre el 80 % de lo que echas de menos».

### 2026-09-16 — Hearo tampoco puede con Netflix en el móvil
**Agente:** Claude Code
**Contexto:** El humano pidió «que funcione como Hearo, no un temporizador».
**Aprendido:** Hearo hace tres cosas distintas: incrusta lo que puede (YouTube y
similares, con sincronización real), usa un plugin de escritorio para Netflix, y
**en el móvil te manda a la app de Netflix** — hay hilos de soporte suyos con
esa queja literal. Su diferenciador real es el **chat de voz**. Así que la
respuesta correcta no era mejorar la cuenta atrás: era construir los tres modos.
**Aplicar cuando:** Alguien compare con Hearo, Teleparty o Rave, o pida «que
sincronice de verdad».

### 2026-09-16 — El bucle corrector no puede pelear contra la persona
**Agente:** Claude Code
**Contexto:** Al saltar de minuto, el vídeo volvía solo al punto anterior.
**Aprendido:** El corrector corre cada 250 ms; una petición tarda más. Si no se
calla tras una orden de la persona (`INTENT_MS` en `usePlayerSync`), la deshace
antes de que el servidor se entere. Con red de verdad esto rompe hasta el play,
no solo los saltos. Hay dos silenciadores distintos y hacen falta los dos:
`ECHO_GUARD_MS` (ignora los eventos que provocan nuestras propias órdenes) e
`INTENT_MS` (calla al corrector mientras la sala se entera).
**Aplicar cuando:** Se toque `usePlayerSync` o el bucle de `extension/content.js`.

### 2026-09-16 — Las señales de WebRTC son eventos, no estado
**Agente:** Claude Code
**Contexto:** La llamada se quedaba en «llamando» para siempre.
**Aprendido:** El endpoint de acciones responde con el estado **completo**, y eso
reenviaba señales ya consumidas: el otro lado volvía a aplicar la misma oferta y
renegociaba en bucle. `buildStateDelta` ya no las incluye nunca en una respuesta
completa, y `useVoiceCall` además descarta por id las repetidas.
**Aplicar cuando:** Se añada cualquier cosa efímera al estado de la sala.

### 2026-09-16 — La cabecera Permissions-Policy bloqueaba nuestro propio micrófono
**Agente:** Claude Code
**Contexto:** `getUserMedia` fallaba con «microphone is not allowed in this document».
**Aprendido:** `next.config.ts` traía `microphone=()`, escrita antes de que
existiera el chat de voz. Bloquea también al propio sitio. Ahora es
`microphone=(self)`. Cámara y ubicación siguen cerradas del todo.
**Aplicar cuando:** Se añada cualquier API del navegador que pida permiso.

### 2026-09-16 — Netflix no se puede reproducir ni controlar desde una web
**Agente:** Claude Code
**Contexto:** Arranque de Juntos (TASK-005).
**Aprendido:** El DRM (Widevine/FairPlay) impide incrustar Netflix, tocar su
reproductor desde otro origen y compartirlo por pantalla. Solo se puede desde
**dentro** de la página donde vive el reproductor: Teleparty lo hace con una
extensión de escritorio, y **Rave lo hacía siendo una app nativa con Netflix
incrustado** (te logueabas en Netflix dentro de Rave). Una web no tiene dónde
meterse, y por eso Juntos sincroniza a las **personas** cuando la fuente va con
DRM. Ojo: Rave no cerró por lo técnico — Apple la retiró de la App Store en
agosto de 2025.
**Aplicar cuando:** Alguien proponga «reproducir Netflix dentro de la app» o un
iframe. No es difícil: es imposible. El camino legítimo es `extension/`, que se
mete dentro de la propia página de Netflix — y solo existe en ordenador.

### 2026-09-16 — La precisión va en el ancla, no en los mensajes
**Agente:** Claude Code
**Contexto:** Diseño de la sincronización.
**Aprendido:** El estado de reproducción es un par `{atServerMs, positionMs}`.
La cuenta atrás **no es un estado**: es un ancla en el futuro, y se deriva. Por
eso da igual que el sondeo tarde 2 segundos. Si alguien propone WebSockets «para
que vaya más fino», está mirando el canal equivocado: el error que importa es el
del reloj, no el de la red.
**Aplicar cuando:** Se toque `domain/playback.ts` o el transporte.

### 2026-09-16 — En `next dev` los módulos se instancian una vez por ruta
**Agente:** Claude Code
**Contexto:** En local no se mantenía la sesión: el token creado al entrar no
valía en la ruta siguiente.
**Aprendido:** El estado a nivel de módulo (`let x = ...`) **no se comparte entre
rutas** en desarrollo. El secreto de sesión temporal se generaba tres veces, una
por bundle. La solución es colgarlo de `globalThis`, igual que el almacén en
memoria. Se detecta rápido: el aviso de consola sale varias veces.
**Aplicar cuando:** Se añada cualquier estado de proceso en `src/server/`.

### 2026-09-16 — En iOS el audio no suena hasta el primer toque
**Agente:** Claude Code
**Contexto:** La cuenta atrás debe sonar en **los dos** móviles, pero solo uno
pulsa «Empezar».
**Aprendido:** Safari mantiene el `AudioContext` en silencio hasta que hay un
gesto del usuario. Por eso `RoomScreen` desbloquea el audio en el primer
`pointerdown` de cualquier sitio, no solo en el botón. Además `navigator.vibrate`
no existe en iOS: la vibración es un extra, nunca la señal principal.
**Aplicar cuando:** Se toque `src/ui/beeps.ts` o la cuenta atrás.

### 2026-09-16 — El chat no debe desplazar la página
**Agente:** Claude Code
**Contexto:** Al llegar un mensaje, la pantalla saltaba y el panel de
sincronización se iba hacia arriba.
**Aprendido:** `scrollIntoView` desplaza el **primer ancestro desplazable**, y si
el chat aún no desborda, ese ancestro es la página entera. Hay que mover
`container.scrollTop` a mano. El `.chat` además lleva `max-height` para que no
empuje al resto.
**Aplicar cuando:** Se toque `src/ui/Chat.tsx` o el layout de la sala.

### AAAA-MM-DD — Plantilla inicial del proyecto
**Agente:** —
**Contexto:** Creación del repositorio a partir de `ai-project-starter`.
**Aprendido:** El proyecto sigue el contrato de `AGENTS.md`. Toda IA lee ese archivo primero.
**Aplicar cuando:** Siempre, al arrancar una sesión.

<!-- Añade entradas nuevas ARRIBA de esta línea, más recientes primero. -->

---

## Hechos permanentes

> Cosas que no cambian y toda IA debe saber. Sección estable, se edita poco.

- **Idioma:** código en inglés, documentación y comentarios en español.
- **Rama principal:** `main`. Protegida. Solo por PR.
- **Nunca** commitear `.env` ni credenciales.
- **Juntos no reproduce vídeo.** Sincroniza a dos personas; el vídeo lo pone
  Netflix en cada dispositivo. Ver `PROJECT.md` → *Fuera de alcance*.
- **Aquí no se piden las credenciales de Netflix.** Ni se guardan, ni se usan.
- `src/domain/` es puro: sin red, sin React, sin `Date.now()`. La hora entra
  siempre como parámetro.
- Los iconos se generan con `npm run icons`. No se editan a mano: el CI lo comprueba.
- `extension/sync.js` es una copia a mano de `domain/playback.ts`. Si tocas una,
  toca la otra: `tests/extension-sync.test.ts` compara las dos y falla si difieren.
- Tres modos y no uno: automático (incrustable), extensión (DRM en ordenador) y
  asistido (DRM en móvil). `src/domain/sources.ts` decide cuál toca.

## Preferencias del humano

> Cada vez que te corrijan sobre *cómo* trabajar, anótalo aquí.

| Preferencia | Por qué | Desde |
|-------------|---------|-------|
| Habla en español, tuteando | Es como escribe él | 2026-09-16 |
| Prefiere que se le digan los límites reales antes de construir | Preguntó «o qué me recomiendas» sabiendo que Rave ya no está | 2026-09-16 |
| Contrasta lo que se le dice con lo que conoce | Preguntó «¿así funcionaba Rave?» y destapó un error en la documentación | 2026-09-16 |
| Despliegue en Vercel, coste cero | Lo pidió explícitamente | 2026-09-16 |
