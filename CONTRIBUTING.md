# Cómo contribuir

Vale tanto para humanos como para agentes de IA. Las reglas son las mismas.

---

## Antes de empezar

1. Lee [`AGENTS.md`](AGENTS.md) — el contrato del repositorio.
2. Lee [`.ai/PROJECT.md`](.ai/PROJECT.md) — qué construimos.
3. Lee [`.ai/RULES.md`](.ai/RULES.md) — qué no se hace nunca.
4. Levanta el entorno con [`.ai/STACK.md`](.ai/STACK.md) → *Puesta en marcha*.
5. Ejecuta los tests. Si no pasan en limpio, eso ya es un bug.

## Flujo de trabajo

```
1. Coge una tarea de .ai/TASKS.md (columna "Listo para empezar")
2. Muévela a .ai/CURRENT_TASK.md
3. Crea la rama:  <tipo>/TASK-NNN-descripcion
4. Trabaja, commiteando de forma atómica
5. Tests en verde en local
6. Repasa docs/standards/DEFINITION_OF_DONE.md
7. Actualiza el contexto en .ai/
8. Abre el PR con la plantilla
9. Atiende la revisión
10. Merge → borra la rama
```

## Ramas

Ver [`docs/standards/BRANCHING.md`](docs/standards/BRANCHING.md).

```
feat/TASK-042-exportar-facturas-csv
fix/BUG-007-token-refresh-caducado
```

**Vida máxima de una rama: 3 días.** Si necesitas más, la tarea es demasiado grande.

## Commits

Ver [`docs/standards/COMMIT_CONVENTIONS.md`](docs/standards/COMMIT_CONVENTIONS.md).

```
feat(invoices): permitir exportar a CSV

Los usuarios pedían llevarse los datos a su contabilidad.

Refs: TASK-042
```

Un commit = un cambio lógico. Si el mensaje necesita una "y", son dos commits.

## Pull requests

- Usa la plantilla completa.
- **Máximo ~400 líneas de cambio.** Por encima de eso, la revisión se vuelve
  simbólica: divide el PR.
- Rellena el *Definition of Done* con la verdad. Lo que no esté hecho, explícalo.
- Señala dónde quieres atención especial.

## Revisión

Si revisas: [`docs/standards/CODE_REVIEW_CHECKLIST.md`](docs/standards/CODE_REVIEW_CHECKLIST.md).

- Tu trabajo no es aprobar. Es encontrar lo que nadie vio.
- Clasifica cada hallazgo: 🔴 bloqueante · 🟠 importante · 🟡 sugerencia · 🔵 nota.
- Un bloqueante necesita un escenario concreto de fallo. Si no lo tienes, no es
  bloqueante.
- Menciona también lo que está bien resuelto.

Si te revisan:
- Las críticas son al código, no a ti.
- Si no estás de acuerdo, explica el porqué. Discutir es válido; ignorar no.
- Resuelve o responde **todos** los comentarios antes del merge.

---

## Trabajando con IA en este repositorio

### Antes de una sesión

Usa [`.prompts/onboard.md`](.prompts/onboard.md) para cargar el contexto.

### Durante

- Elige un rol de [`.agents/`](.agents/) según la tarea.
- Usa el prompt correspondiente de [`.prompts/`](.prompts/).
- Para cambios que tocan más de dos archivos: **plan primero**, código después.
- Revisa el código generado con la misma exigencia que el de un humano. Más, si acaso.

### Después

- Actualiza `.ai/AI_MEMORY.md`. Es lo que evita que la próxima sesión empiece a ciegas.
- Actualiza `.ai/CURRENT_TASK.md` y `.ai/TASKS.md`.

### Qué NO delegar a una IA sin supervisión estrecha

- Migraciones de base de datos que destruyen datos.
- Cambios en autenticación o autorización.
- Configuración de infraestructura de producción.
- Cualquier cosa que mueva dinero.
- Cambios en `.ai/RULES.md` o `.ai/SECURITY.md`.

---

## Reportar un bug

Usa la plantilla de issue. Incluye pasos de reproducción numerados. Un bug sin
pasos de reproducción no es un bug reportado.

**Vulnerabilidades de seguridad:** no abras un issue público. Ver [`SECURITY.md`](SECURITY.md).

## Proponer una funcionalidad

Usa la plantilla. Describe el **problema** antes que la solución.

## Preguntas

Si algo de este documento no está claro, eso es un bug de la documentación.
Abre un issue.
