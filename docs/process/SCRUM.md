# Proceso de trabajo

Scrum ligero, adaptado a equipos pequeños que trabajan con asistentes de IA.

> Adapta esto a tu realidad. Un proceso que no se sigue es peor que no tener proceso.
> Si trabajas solo, quédate con el backlog priorizado, el *Definition of Ready* y el
> *Definition of Done* — el resto es opcional.

---

## Sprint

**Duración:** 1 o 2 semanas. Elige una y no la cambies.

```
Día 1        Planificación
Cada día     Sincronización (15 min)
Continuo     Desarrollo + revisión
Penúltimo    Refinamiento del siguiente sprint
Último       Demo + Retrospectiva
```

## Ceremonias

### Planificación

**Entrada:** backlog priorizado en `.ai/TASKS.md`, con tareas que cumplen
`docs/standards/DEFINITION_OF_READY.md`.

**Se decide:**
- Objetivo del sprint, en una frase
- Qué tareas entran
- Quién (o qué IA) coge cada una

**Salida:** columna *Listo para empezar* de `.ai/TASKS.md` poblada, y
`.ai/CURRENT_TASK.md` con la primera.

**Regla:** una tarea que no cumple el *Definition of Ready* no entra. Sin excepciones.

### Sincronización diaria — 15 minutos

Tres preguntas:
1. ¿Qué cerré ayer?
2. ¿Qué voy a cerrar hoy?
3. ¿Qué me bloquea?

No es un informe de estado. Es para detectar bloqueos. Los bloqueos se anotan en
`.ai/TASKS.md` → *Bloqueadas*.

### Refinamiento

Preparar el backlog del siguiente sprint:
- Escribir criterios de aceptación
- Dividir lo que sea demasiado grande
- Resolver dudas antes de que cuesten dos días
- Estimar

### Demo

Enseñar lo que **funciona**, no diapositivas. Si no se puede enseñar funcionando,
no está hecho.

### Retrospectiva

Ver `docs/process/RETROSPECTIVE.md`.

---

## Estimación

Puntos de historia relativos, no horas:

| Puntos | Significa |
|--------|-----------|
| 1 | Trivial. Lo entiendo entero |
| 2 | Pequeño. Sin sorpresas esperadas |
| 3 | Mediano. Alguna incógnita |
| 5 | Grande. Varias incógnitas |
| 8 | Muy grande. **Debería dividirse** |
| 13 | Divídelo ya |

Si algo se estima en 8 o más, no está listo: está sin entender.

## Flujo de una tarea

```
Backlog
   ↓  refinamiento → cumple Definition of Ready
Listo para empezar
   ↓  planificación
En progreso        → .ai/CURRENT_TASK.md
   ↓  desarrollo + tests
En revisión        → PR abierto
   ↓  revisión + CI en verde
Hecho              → cumple Definition of Done
```

**Límite de trabajo en curso:** una tarea *En progreso* por persona o agente.
Terminar vale más que empezar.

## Trabajar con IAs en el sprint

- Una tarea asignada a una IA es una tarea, no un experimento. Cuenta en la
  capacidad del sprint.
- El resultado de una IA pasa por la misma revisión que el de un humano. Igual de
  estricta.
- Si una IA se atasca dos veces en la misma tarea, la tarea está mal definida:
  vuelve a refinamiento.
- El contexto (`.ai/`) se actualiza dentro del sprint, no "cuando haya tiempo".
  Si no, la próxima sesión trabaja a ciegas.

## Métricas que sirven

| Métrica | Para qué |
|---------|----------|
| Tareas completadas por sprint | Predecir capacidad |
| Tiempo de tarea (de *En progreso* a *Hecho*) | Detectar cuellos de botella |
| Bugs escapados a producción | Calidad real |
| Tiempo de revisión de PR | Si es alto, el trabajo se acumula |

**No midas:** líneas de código, número de commits, horas trabajadas. Se manipulan
solas y no dicen nada.
