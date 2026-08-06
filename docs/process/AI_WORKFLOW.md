# Cómo trabajar con las IAs

> Guía práctica para sacarle buen trabajo a Claude Code, Codex y Zoo Code sobre
> este repositorio. No necesitas entender de tokens ni de modelos para seguirla.

---

## Las 5 reglas que más importan

Si solo recuerdas esto, ya vas bien:

1. **Empieza cada sesión cargando el contexto.** Pega [`.prompts/onboard.md`](../../.prompts/onboard.md).
   Una IA que no sabe qué construye, adivina.
2. **Antes de código, plan.** Si la tarea toca más de dos archivos, usa
   [`.prompts/plan.md`](../../.prompts/plan.md) y aprueba el plan tú. Un plan malo
   se corrige en 30 segundos; una implementación mala, en dos horas.
3. **Una tarea a la vez.** La de [`.ai/CURRENT_TASK.md`](../../.ai/CURRENT_TASK.md).
   Si le das tres cosas, hará las tres a medias.
4. **Dile qué archivos mirar.** "Lee `backend/src/domain/Invoice.ts`" funciona
   mucho mejor que "busca dónde está la lógica de facturas".
5. **Al terminar, que escriba en [`.ai/AI_MEMORY.md`](../../.ai/AI_MEMORY.md).**
   Es lo único que evita que mañana empieces desde cero otra vez.

---

## El ciclo de una tarea

```
1. Sesión nueva y limpia
2. Pegar .prompts/onboard.md          ← carga el contexto
3. Coger una tarea de .ai/TASKS.md    → moverla a .ai/CURRENT_TASK.md
4. .prompts/plan.md                   ← NO código todavía. Tú apruebas
5. .prompts/implement.md              ← ahora sí, con el plan cerrado
6. .prompts/tests.md
7. .prompts/review.md                 ← revisión crítica del resultado
8. docs/standards/DEFINITION_OF_DONE.md ← repasar antes de dar por hecho
9. .prompts/onboard.md → "Cerrar una sesión"  ← deja rastro
```

Los pasos 4 y 7 son los que más calidad aportan. Son también los que más gente
se salta.

---

## Qué IA para qué

Esto no es una regla rígida: es un punto de partida que funciona.

| Tipo de trabajo | Quién |
|---|---|
| Arquitectura, decisiones, refactors grandes | **Claude Code** |
| Revisión crítica de código | **Claude Code** |
| Bugs concretos, correcciones puntuales | **Codex** |
| Escribir tests | **Codex** |
| Ejecutar una tarea ya planificada | **Zoo Code** |
| Renombrar, mover archivos, formatear | **Ninguna** — usa el IDE |

Esa última fila es en serio. Un *Rename Symbol* de VS Code es instantáneo,
gratis y no se equivoca.

### Elegir modelo dentro de la herramienta

Ahí es donde vive casi todo el coste. Como referencia:

| Modelo | Cuándo |
|---|---|
| **Opus** (el más capaz) | Planificar, arquitectura, bugs difíciles, revisión |
| **Sonnet** (equilibrado) | Implementar algo ya especificado, tests |
| **Haiku** (el más rápido) | Tareas mecánicas y acotadas |

Regla práctica: **Opus para pensar, Sonnet para escribir.**

En Claude Code hay además un ajuste de *effort* (esfuerzo). Empieza en `xhigh`
para código, pero prueba a bajarlo: en los modelos actuales `medium` rinde
sorprendentemente bien y cuesta bastante menos.

---

## Higiene de sesión

**Por qué importa:** cada mensaje que envías reenvía toda la conversación
anterior. Una sesión larga y desordenada arrastra ese peso en cada turno.

- **Sesión nueva al cambiar de tarea.** En Claude Code: `/clear`.
- **No reinicies a mitad de una tarea.** Ahí el historial te está ayudando.
- **No dejes que lea el repositorio entero.** `onboard.md` lee 8 archivos a
  propósito. Si ves que empieza a recorrer `docs/` completo, córtala.
- **PRs por debajo de 400 líneas.** Por encima de eso la revisión se vuelve
  simbólica, la haga un humano o una IA.

---

## Por qué el plan sale rentable

Con números reales, para que se vea:

| Acción | Coste aproximado |
|---|---|
| Cargar todo el contexto del proyecto (8 archivos) | **$0.05** |
| Una implementación equivocada de 400 líneas | **$0.15** |

Leer el contexto entero cuesta **un tercio** de lo que cuesta una sola
implementación mal dirigida. Y una implementación equivocada además te cuesta
el tiempo de detectarla y deshacerla.

De ahí sale la conclusión que va contra la intuición: **escatimar contexto para
ahorrar es el error caro.** Dale toda la información y haz que planifique.

---

## Errores comunes

| Error | Qué pasa | Qué hacer |
|---|---|---|
| Pedir código sin plan | Construye lo que no era | `.prompts/plan.md` primero |
| No cargar el contexto | Inventa convenciones | `.prompts/onboard.md` siempre |
| Darle tres tareas a la vez | Las hace las tres a medias | Una. La de `CURRENT_TASK.md` |
| "Busca dónde está X" | Explora a ciegas, tarda y falla | Señálale el archivo |
| Aceptar 600 líneas sin leer | Código que no controlas | Pide pasos revisables |
| No cerrar la sesión | Mañana empiezas de cero | Actualiza `AI_MEMORY.md` |
| Usar el modelo caro para todo | Coste alto sin ganancia | Opus para pensar, Sonnet para escribir |

---

## Qué NO delegar sin mirar de cerca

Aunque la IA lo haga bien el 95 % de las veces, aquí el 5 % restante duele:

- Migraciones de base de datos que borran o transforman datos
- Cambios en autenticación o permisos
- Configuración de producción
- Cualquier cosa que mueva dinero
- Cambios en [`.ai/RULES.md`](../../.ai/RULES.md) o [`.ai/SECURITY.md`](../../.ai/SECURITY.md)

Ver [`CONTRIBUTING.md`](../../CONTRIBUTING.md).

---

## Si algo no funciona

| Síntoma | Causa habitual |
|---|---|
| Ignora las convenciones del proyecto | No leyó `RULES.md` — recarga el contexto |
| Se inventa nombres o campos | Falta `GLOSSARY.md` o `ARCHITECTURE.md` sin rellenar |
| Se atasca dos veces en lo mismo | La tarea está mal definida. Vuelve a `DEFINITION_OF_READY.md` |
| Devuelve muros de código | Pídele pasos: "un paso, lo verifico, siguiente" |
| Repite errores de ayer | Nadie escribió en `AI_MEMORY.md` |
