# AGENTS.md — Contrato universal para agentes de IA

> **Este es el punto de entrada único.** Cualquier agente de IA que trabaje en este
> repositorio (Claude Code, Codex, Zoo Code, Copilot, Cursor, etc.) debe leer este
> archivo antes de escribir una sola línea de código.

`CLAUDE.md` en la raíz apunta aquí. Si tu herramienta usa otro nombre de archivo de
configuración, cópialo o enlázalo a este mismo contenido. **Una sola fuente de verdad.**

---

## 1. Protocolo de arranque (obligatorio)

Al iniciar cualquier sesión, lee **en este orden**:

| # | Archivo | Para qué |
|---|---------|----------|
| 1 | `.ai/PROJECT.md` | Qué es este proyecto, para quién y por qué |
| 2 | `.ai/RULES.md` | Reglas duras. No negociables |
| 3 | `.ai/ARCHITECTURE.md` | Cómo está construido y por qué |
| 4 | `.ai/CURRENT_TASK.md` | Qué se está haciendo **ahora mismo** |
| 5 | `.ai/AI_MEMORY.md` | Contexto acumulado entre sesiones |

Luego, según el tipo de trabajo:

- ¿Vas a implementar? → `.prompts/implement.md` + `docs/standards/CODE_STANDARDS.md`
- ¿Vas a revisar? → `.prompts/review.md` + `docs/standards/CODE_REVIEW_CHECKLIST.md`
- ¿Vas a depurar? → `.prompts/debug.md` + `.ai/BUGS.md`
- ¿Vas a testear? → `.prompts/tests.md` + `docs/standards/TESTING_STRATEGY.md`
- ¿Vas a desplegar? → `docs/runbooks/deployment.md`

---

## 2. Reparto de responsabilidades

No es obligatorio, pero funciona bien cuando usas varias IAs sobre el mismo repo:

| Herramienta | Rol principal | Lee sobre todo |
|-------------|---------------|----------------|
| **Claude Code** | Arquitectura, refactors grandes, revisión | `ARCHITECTURE.md`, `RULES.md`, `DECISIONS.md` |
| **Codex** | Bugs, tests, correcciones puntuales | `BUGS.md`, `TESTING.md`, `CURRENT_TASK.md` |
| **Zoo Code** | Ejecución de la tarea en curso | `CURRENT_TASK.md`, `TASKS.md` |

Las tres comparten `.ai/AI_MEMORY.md`. Esa es la memoria común.

---

## 3. Reglas que aplican a todo agente

1. **No inventes.** Si no sabes algo del proyecto, búscalo en el repo. Si no está, pregunta.
2. **No amplíes el alcance.** Haz lo que se pidió. Si ves otra cosa que arreglar, anótala en `.ai/TASKS.md`.
3. **Deja rastro.** Cada cambio relevante se registra: `AI_MEMORY.md` (contexto), `CHANGELOG.md` (qué cambió), `DECISIONS.md` (por qué).
4. **Nunca toques secretos.** Ni los leas, ni los escribas, ni los pongas en logs. Ver `.ai/SECURITY.md`.
5. **Nada se da por terminado** hasta cumplir `docs/standards/DEFINITION_OF_DONE.md`.
6. **Commits en formato Conventional Commits.** Ver `docs/standards/COMMIT_CONVENTIONS.md`.
7. **Un cambio grande empieza con un plan**, no con código. Usa `.prompts/plan.md`.

---

## 4. Al terminar una tarea

Antes de decir "listo", actualiza:

- [ ] `.ai/CURRENT_TASK.md` → marcar la tarea como terminada o mover la siguiente
- [ ] `.ai/TASKS.md` → mover la tarea a *Hecho*
- [ ] `.ai/AI_MEMORY.md` → añadir lo aprendido que la próxima sesión necesita saber
- [ ] `.ai/CHANGELOG.md` → si el cambio es visible para el usuario
- [ ] `.ai/DECISIONS.md` o un ADR nuevo → si tomaste una decisión técnica con consecuencias
- [ ] `.ai/BUGS.md` → si encontraste o cerraste un bug

Si no actualizaste nada de esto, la siguiente sesión empieza a ciegas.

---

## 5. Qué **no** hacer nunca

- Reescribir archivos completos cuando basta un cambio quirúrgico.
- Borrar tests para que el build pase.
- Añadir dependencias sin registrarlo en `.ai/DECISIONS.md`.
- Hacer `push --force` sobre `main`.
- Commitear archivos `.env`, claves, tokens o volcados de base de datos.
- Cambiar la configuración de CI/CD sin avisar al humano.
