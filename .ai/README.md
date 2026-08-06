# .ai/ — Memoria del proyecto

El **estado vivo** del proyecto. Lo que las IAs leen para saber dónde están.

> Diferencia clave con [`docs/`](../docs/): esto cambia **cada día**.
> `docs/` contiene lo estable (estándares, proceso, decisiones).

---

## Archivos

### Contexto — se rellena una vez, se revisa de vez en cuando

| Archivo | Contiene |
|---------|----------|
| [`PROJECT.md`](PROJECT.md) | Qué construimos, para quién, con qué restricciones |
| [`STACK.md`](STACK.md) | Tecnologías, versiones, puesta en marcha |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Estructura, reglas de dependencia, deuda técnica |
| [`GLOSSARY.md`](GLOSSARY.md) | Vocabulario del dominio |
| [`RULES.md`](RULES.md) | Reglas duras, no negociables |
| [`SECURITY.md`](SECURITY.md) | Qué es sensible aquí y qué no se toca nunca |
| [`ONBOARDING.md`](ONBOARDING.md) | Arranque en 5 minutos |

### Estado — cambia constantemente

| Archivo | Contiene |
|---------|----------|
| [`CURRENT_TASK.md`](CURRENT_TASK.md) | **Una** tarea. La de ahora mismo |
| [`TASKS.md`](TASKS.md) | Backlog completo |
| [`BUGS.md`](BUGS.md) | Bugs abiertos y cerrados, con causa raíz |
| [`TESTING.md`](TESTING.md) | Cobertura actual y huecos conocidos |

### Historia — solo se añade, no se reescribe

| Archivo | Contiene |
|---------|----------|
| [`DECISIONS.md`](DECISIONS.md) | Decisiones pequeñas y medianas |
| [`CHANGELOG.md`](CHANGELOG.md) | Cambios visibles para el usuario |
| [`AI_MEMORY.md`](AI_MEMORY.md) | Lo aprendido entre sesiones |

---

## Reglas

1. **Estos archivos se versionan.** Son el valor del repositorio, no ruido.
2. **Se actualizan dentro de la tarea**, no "cuando haya tiempo". Una tarea que no
   actualizó el contexto no está terminada.
3. **`CURRENT_TASK.md` tiene una sola tarea.** Si tiene tres, no tiene ninguna.
4. **`AI_MEMORY.md` por debajo de ~200 líneas.** Cuando crezca, consolida.
5. **Nada de secretos aquí.** `SECURITY.md` describe qué es sensible; no contiene
   los valores.

## Quién lee qué

| Herramienta | Lee sobre todo |
|-------------|----------------|
| Claude Code | `ARCHITECTURE.md`, `RULES.md`, `DECISIONS.md` |
| Codex | `BUGS.md`, `TESTING.md`, `CURRENT_TASK.md` |
| Zoo Code | `CURRENT_TASK.md`, `TASKS.md` |
| **Todas** | `AGENTS.md`, `PROJECT.md`, `RULES.md`, `AI_MEMORY.md` |

## Verificar que está completo

```bash
pwsh scripts/check-context.ps1
```

También se comprueba en cada PR mediante
[`.github/workflows/ai-context-check.yml`](../.github/workflows/ai-context-check.yml).
