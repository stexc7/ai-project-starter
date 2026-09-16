# DECISIONS.md — Registro rápido de decisiones

> Para decisiones **pequeñas o medianas**. Las grandes (con consecuencias
> estructurales, difíciles de revertir) van a un ADR completo en `docs/adr/`.
>
> Regla práctica: si dentro de seis meses alguien va a preguntar *"¿por qué se hizo
> así?"*, escríbelo. Aquí o en un ADR.

---

## Formato

```
### AAAA-MM-DD — <Decisión en una frase>
**Contexto:** qué situación forzó la decisión.
**Decisión:** qué se eligió.
**Alternativas descartadas:** qué más se consideró y por qué no.
**Consecuencias:** qué se gana, qué se pierde, qué queda pendiente.
**Decidido por:** humano / Claude Code / Codex / Zoo Code.
```

---

## Decisiones

### 2026-01-01 — Un único contrato para todas las IAs en `AGENTS.md`
**Contexto:** Tres herramientas de IA (Claude Code, Codex, Zoo Code) trabajando sobre
el mismo repositorio, cada una con su propio archivo de configuración. Duplicar las
reglas en tres sitios garantiza que se desincronicen.
**Decisión:** `AGENTS.md` es la única fuente de verdad. `CLAUDE.md` y cualquier otro
archivo de configuración específico de herramienta solo apuntan hacia él y añaden lo
estrictamente propio de esa herramienta.
**Alternativas descartadas:** (a) Duplicar el contenido — se desincroniza. (b) Enlaces
simbólicos — no funcionan bien en Windows ni en todos los clones de Git.
**Consecuencias:** Una sola edición actualiza a las tres IAs. A cambio, cada
herramienta necesita un archivo puente de dos líneas.
**Decidido por:** humano

### 2026-09-16 — Chat de voz con WebRTC punto a punto, sin TURN
**Contexto:** Poder hablar mientras se ve algo es lo que separa «ver lo mismo a la
vez» de «verlo juntos». Es el diferenciador real de Hearo.
**Decisión:** WebRTC directo entre los dos, con la señalización viajando por el
sondeo que ya existe. Solo STUN público; ningún servidor de audio.
**Alternativas descartadas:** (a) Un servicio tipo Twilio o Daily — cuesta dinero
y mete una cuenta más. (b) Un TURN propio — un VPS solo para eso. (c) Decirles
que usen FaceTime en paralelo — funciona, pero entonces la app no aporta nada
sobre un temporizador.
**Consecuencias:** Coste cero y el audio no pasa por nuestro servidor. A cambio,
en redes con NAT simétrico (alguna móvil) la llamada puede no abrir; la app lo
dice en vez de quedarse colgada. Si llega a pasar a menudo, la salida es añadir
un TURN.
**Decidido por:** Claude Code

### 2026-09-16 — La extensión duplica la matemática, con un test que lo vigila
**Contexto:** Una extensión de Chrome carga archivos sueltos: sin TypeScript, sin
empaquetador. La sincronización tiene que correr también ahí.
**Decisión:** `extension/sync.js` es una copia a mano de `domain/playback.ts`, y
`tests/extension-sync.test.ts` compara las dos con cientos de entradas.
**Alternativas descartadas:** (a) Un paso de build con esbuild — más dependencias
y más configuración que las cuarenta líneas que ahorra. (b) Dejarlo sin vigilar —
una copia a mano se separa del original, siempre.
**Consecuencias:** Hay que tocar dos archivos al cambiar el algoritmo, pero es
imposible olvidarse: el CI lo caza.
**Decidido por:** Claude Code

### 2026-09-16 — La extensión usa token Bearer; la web, cookie httpOnly
**Contexto:** Las peticiones de la extensión salen desde `netflix.com`. La cookie
de sesión es `SameSite=Lax` y ahí no viaja.
**Decisión:** `join` devuelve el token en el cuerpo si se pide (`wantToken`), y la
API acepta `Authorization: Bearer` además de la cookie.
**Alternativas descartadas:** (a) `SameSite=None` — debilitaría la app web para
todo el mundo por un caso de escritorio. (b) CORS y `credentials: include` — lo
mismo, y más piezas.
**Consecuencias:** La app web conserva su cookie `httpOnly`. El token solo se
entrega a quien acaba de acertar el PIN, así que no abre nada nuevo.
**Decidido por:** Claude Code

### 2026-09-16 — Sin cuentas: código de sala de 6 caracteres + PIN de 4 dígitos
**Contexto:** Son dos personas que se conocen. Un registro con correo y
contraseña es fricción cada noche y superficie de ataque para siempre.
**Decisión:** La sala se identifica con un código de 6 caracteres de un alfabeto
de 31 (~900 millones de combinaciones) y se protege con un PIN de 4 dígitos
guardado con scrypt. La sesión es un token HMAC en cookie `httpOnly`, una por
sala, válida 60 días. Diez fallos bloquean la sala 15 minutos, y el código
incorrecto y el PIN incorrecto devuelven **el mismo error**.
**Alternativas descartadas:** (a) Registro con correo — fricción y datos
personales que no hacen falta. (b) Solo el código, sin PIN — quien lo vea de
reojo entra. (c) Enlace mágico por correo — exige un servicio de envío.
**Consecuencias:** Entrar son dos datos. A cambio, quien pierda el código pierde
la sala: no hay recuperación, por diseño.
**Decidido por:** Claude Code

### 2026-09-16 — CSS a mano en vez de un framework de estilos
**Contexto:** La app son dos pantallas y hace falta control fino de cosas muy de
iOS: `env(safe-area-inset-*)`, `100svh`, evitar el zoom al enfocar un campo.
**Decisión:** Un único `app/globals.css` con variables CSS.
**Alternativas descartadas:** Tailwind — una dependencia de build y un paso de
PostCSS para un ahorro que a esta escala no existe.
**Consecuencias:** Cero dependencias de estilo. A cambio, no hay utilidades: los
ajustes puntuales van en `style={{}}` y hay que vigilar que no se acumulen.
**Decidido por:** Claude Code

### 2026-09-16 — Los iconos de la PWA se generan por script, no se versionan a ciegas
**Contexto:** iOS necesita PNG para el icono de la pantalla de inicio. Meter
binarios que nadie sabe reproducir es deuda desde el primer día.
**Decisión:** `scripts/generate-icons.mjs` los dibuja por fórmula y los codifica
a PNG con `zlib`, que ya viene en Node. El CI regenera y compara.
**Alternativas descartadas:** (a) `sharp` o `canvas` — dependencia nativa pesada
para cinco imágenes. (b) Descargar un icono — sin licencia clara.
**Consecuencias:** Cambiar el icono es tocar unos números. A cambio, el script es
código propio que hay que mantener (~150 líneas, sin dependencias).
**Decidido por:** Claude Code

### 2026-09-16 — Se borran `backend/` y `frontend/`
**Contexto:** Eran carpetas de la plantilla con un README que describía una
separación servidor/cliente que esta app no tiene: es una sola aplicación Next.js
con el código de servidor en `src/server/` y `app/api/`.
**Decisión:** Borrarlas, como sugiere el propio README de la plantilla.
**Alternativas descartadas:** Dejarlas con un README que apunte a la estructura
real — sigue siendo un sitio donde mirar que no contiene nada.
**Consecuencias:** La estructura real es la única documentada. Si algún día el
proyecto se parte en dos servicios, se recuperan del historial.
**Decidido por:** Claude Code

<!-- Añade decisiones nuevas ARRIBA de esta línea, más recientes primero. -->

---

## Decisiones revertidas

> No borres una decisión que dejó de valer. Muévela aquí con el motivo.
> Saber qué se intentó y falló vale tanto como saber qué funcionó.

| Fecha | Decisión | Por qué se revirtió | Reemplazada por |
|-------|----------|---------------------|-----------------|
| | | | |
