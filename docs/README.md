# docs/

Documentación de ingeniería. Aquí vive lo **estable**: estándares, proceso,
decisiones y procedimientos.

> El **estado vivo** del proyecto (tarea actual, backlog, bugs, memoria) está en
> [`.ai/`](../.ai/), no aquí. Esta separación importa: `docs/` cambia poco,
> `.ai/` cambia cada día.

---

## Estándares — [`standards/`](standards/)

Cómo se escribe y se revisa el código aquí.

| Documento | Para qué |
|-----------|----------|
| [`CODE_STANDARDS.md`](standards/CODE_STANDARDS.md) | Nombres, funciones, errores, comentarios |
| [`COMMIT_CONVENTIONS.md`](standards/COMMIT_CONVENTIONS.md) | Formato de los mensajes de commit |
| [`BRANCHING.md`](standards/BRANCHING.md) | Ramas, merges, tags |
| [`DEFINITION_OF_READY.md`](standards/DEFINITION_OF_READY.md) | Cuándo una tarea se puede empezar |
| [`DEFINITION_OF_DONE.md`](standards/DEFINITION_OF_DONE.md) | Cuándo una tarea está terminada |
| [`CODE_REVIEW_CHECKLIST.md`](standards/CODE_REVIEW_CHECKLIST.md) | Qué mirar al revisar |
| [`TESTING_STRATEGY.md`](standards/TESTING_STRATEGY.md) | Qué tipo de test escribir y cuándo |
| [`SECURITY_CHECKLIST.md`](standards/SECURITY_CHECKLIST.md) | Repaso de seguridad antes de cerrar |
| [`API_DESIGN.md`](standards/API_DESIGN.md) | Convenciones de la API |
| [`LOGGING_OBSERVABILITY.md`](standards/LOGGING_OBSERVABILITY.md) | Logs, métricas, alertas |

## Proceso — [`process/`](process/)

Cómo trabaja el equipo.

| Documento | Para qué |
|-----------|----------|
| [`AI_WORKFLOW.md`](process/AI_WORKFLOW.md) | **Cómo trabajar con las IAs en el día a día** |
| [`SCRUM.md`](process/SCRUM.md) | Sprints, ceremonias, estimación |
| [`SPRINT_TEMPLATE.md`](process/SPRINT_TEMPLATE.md) | Plantilla de sprint |
| [`RETROSPECTIVE.md`](process/RETROSPECTIVE.md) | Plantilla de retrospectiva |
| [`RELEASE_PROCESS.md`](process/RELEASE_PROCESS.md) | Versionado y publicación |
| [`INCIDENT_POSTMORTEM.md`](process/INCIDENT_POSTMORTEM.md) | Análisis de incidentes, sin culpables |

## Decisiones — [`adr/`](adr/)

Architecture Decision Records. El **porqué** de cada decisión estructural, y qué
alternativas se descartaron.

## Runbooks — [`runbooks/`](runbooks/)

Procedimientos operativos. Escritos para ejecutarse a las tres de la madrugada.

---

## Dónde va cada cosa

| Si quieres documentar... | Va a |
|--------------------------|------|
| Cómo se escribe el código | `docs/standards/` |
| Cómo trabaja el equipo | `docs/process/` |
| Por qué se decidió algo estructural | `docs/adr/` |
| Cómo se ejecuta una operación | `docs/runbooks/` |
| Qué es el proyecto | `.ai/PROJECT.md` |
| Cómo está construido | `.ai/ARCHITECTURE.md` |
| Qué se está haciendo ahora | `.ai/CURRENT_TASK.md` |
| Una decisión menor | `.ai/DECISIONS.md` |
| Algo que aprendió una IA | `.ai/AI_MEMORY.md` |
| Cómo usar el proyecto | `README.md` (raíz) |
