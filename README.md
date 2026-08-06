# AI Project Starter

> Professional AI software engineering template for Claude Code, Codex and Zoo Code.

Plantilla de proyecto para trabajar con varias IAs sobre el mismo repositorio, con
**una sola fuente de verdad** y **memoria compartida entre sesiones**.

No es una colección de documentos. Es un contrato que las IAs leen automáticamente
para saber qué construyen, cómo se trabaja aquí y qué no se hace nunca.

[![AI Context Check](https://github.com/stexc7/ai-project-starter/actions/workflows/ai-context-check.yml/badge.svg)](https://github.com/stexc7/ai-project-starter/actions/workflows/ai-context-check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## El problema que resuelve

Trabajas con Claude Code, Codex y Zoo Code sobre el mismo proyecto. Cada sesión:

- Empieza sin saber qué se decidió ayer
- Propone soluciones que ya se descartaron
- Rompe convenciones que no ve en el código
- Reescribe lo que otra IA acaba de escribir
- Te obliga a explicar el proyecto **otra vez**

El código dice **qué** se hizo. No dice **por qué**, ni qué se rechazó, ni qué está
prohibido, ni qué se estaba haciendo cuando se cortó la sesión.

## Cómo lo resuelve

```
AGENTS.md          Un contrato. Todas las IAs lo leen primero.
     │
     ├── .ai/      Memoria del proyecto. Estado vivo, compartido.
     ├── .agents/  Roles con alcance delimitado.
     ├── .prompts/ Prompts probados para cada tipo de tarea.
     └── docs/     Estándares, proceso, decisiones, runbooks.
```

`CLAUDE.md` y cualquier otro archivo de configuración de herramienta **apuntan** a
`AGENTS.md`. Se edita en un sitio, aplica a las tres.

---

## Empezar

### 1. Usa la plantilla

Pulsa **Use this template** → *Create a new repository*.

O clona:

```bash
git clone https://github.com/stexc7/ai-project-starter.git mi-proyecto
cd mi-proyecto
rm -rf .git && git init
```

### 2. Rellena el contexto — 90 minutos bien invertidos

| # | Archivo | Tiempo |
|---|---------|--------|
| 1 | [`.ai/PROJECT.md`](.ai/PROJECT.md) — qué construyes y para quién | 30 min |
| 2 | [`.ai/STACK.md`](.ai/STACK.md) — tecnologías y puesta en marcha | 30 min |
| 3 | [`.ai/ARCHITECTURE.md`](.ai/ARCHITECTURE.md) — estructura y reglas | 1 h |
| 4 | [`.ai/GLOSSARY.md`](.ai/GLOSSARY.md) — vocabulario del dominio | 20 min |

Estas cuatro tareas ya están en [`.ai/TASKS.md`](.ai/TASKS.md) como `TASK-001` a `TASK-004`.

**Si `PROJECT.md` está vacío, todas las IAs que trabajen aquí están adivinando.**

### 3. Ajusta lo que sea tuyo

- `.github/workflows/ci.yml` → descomenta el bloque de tu stack
- `.github/CODEOWNERS` → sustituye `@stexc7` por tu usuario
- `.github/ISSUE_TEMPLATE/config.yml` → sustituye `stexc7/ai-project-starter`
- `SECURITY.md` → pon tu correo de contacto
- Borra `backend/` o `frontend/` si no aplican

**Activa el Dependency graph** en *Settings → Security → Code security*. Sin él,
`dependency-review-action` no puede funcionar. Viene marcado como no bloqueante
(`continue-on-error`) precisamente para que un repo recién creado no arranque con
el CI en rojo; una vez activado, quita esa línea de `.github/workflows/security.yml`
para que las vulnerabilidades altas bloqueen el merge de verdad.

### 4. Arranca la primera sesión de IA

Pégale a tu IA el contenido de [`.prompts/onboard.md`](.prompts/onboard.md).

Si es tu primera vez con esta metodología, lee
[`docs/process/AI_WORKFLOW.md`](docs/process/AI_WORKFLOW.md) — son 5 minutos y
cubre el ciclo completo, qué IA usar para qué, y los errores que más cuestan.

---

## Qué hay dentro

### `AGENTS.md` — el contrato

Protocolo de arranque, reparto de responsabilidades entre herramientas, reglas
comunes y checklist de cierre de tarea. Lo lee toda IA antes de escribir código.

### `.ai/` — memoria del proyecto

| Archivo | Qué contiene |
|---------|--------------|
| `PROJECT.md` | Qué construimos, para quién, con qué restricciones |
| `RULES.md` | Reglas duras, no negociables |
| `ARCHITECTURE.md` | Estructura, reglas de dependencia, deuda técnica |
| `STACK.md` | Tecnologías, versiones, puesta en marcha |
| `GLOSSARY.md` | Vocabulario del dominio y ciclos de vida de estados |
| `CURRENT_TASK.md` | **Una** tarea: la de ahora mismo |
| `TASKS.md` | Backlog completo, priorizado |
| `BUGS.md` | Bugs con causa raíz y test que los cubre |
| `TESTING.md` | Cobertura actual, huecos, tests frágiles |
| `SECURITY.md` | Qué es sensible aquí, qué no se toca nunca |
| `DECISIONS.md` | Decisiones pequeñas y medianas |
| `CHANGELOG.md` | Cambios visibles para el usuario |
| `AI_MEMORY.md` | **Lo aprendido entre sesiones** |
| `ONBOARDING.md` | Arranque en 5 minutos |

`AI_MEMORY.md` es la pieza central: es lo que evita que cada sesión empiece de cero.

### `.agents/` — roles especializados

Nueve perfiles, cada uno con su alcance, sus entregables y lo que tiene **prohibido**
tocar:

`architect` · `backend` · `frontend` · `reviewer` · `qa` · `devops` · `security` · `data` · `docs-writer`

> "Adopta el rol de `.agents/reviewer.md` y revisa el diff de esta rama."

### `.prompts/` — prompts reutilizables

Once plantillas para las tareas frecuentes:

`onboard` · `plan` · `implement` · `review` · `debug` · `refactor` · `tests` · `adr` · `commit` · `pr` · `security-audit`

Cada uno define contexto, rol, tarea, restricciones y formato de salida. Sin los
cinco, la respuesta sale genérica.

### `docs/` — estándares y proceso

| Carpeta | Contiene |
|---------|----------|
| `standards/` | Código, commits, ramas, DoR, DoD, revisión, tests, seguridad, API, observabilidad |
| `process/` | **Cómo trabajar con las IAs**, Scrum, sprints, retrospectivas, releases, postmortems |
| `adr/` | Architecture Decision Records, con plantilla y script generador |
| `runbooks/` | Despliegue y reversión, paso a paso |

### `.github/` — automatización

- **`ai-context-check.yml`** — verifica en cada PR que el contexto sigue completo,
  detecta enlaces rotos y secretos evidentes. **Funciona sin configurar nada.**
- `ci.yml` — plantilla con bloques listos para Node, Python y .NET
- `security.yml` — Gitleaks, CodeQL, auditoría de dependencias
- Plantillas de issue (bug, funcionalidad, tarea) y de PR con *Definition of Done*
- `dependabot.yml`, `CODEOWNERS`

### `scripts/`

```bash
pwsh scripts/new-adr.ps1 "Usar PostgreSQL como base de datos principal"
pwsh scripts/check-context.ps1
```

---

## Cómo se reparte el trabajo

| Herramienta | Rol principal | Lee sobre todo |
|-------------|---------------|----------------|
| **Claude Code** | Arquitectura, refactors grandes, revisión | `ARCHITECTURE.md`, `RULES.md`, `DECISIONS.md` |
| **Codex** | Bugs, tests, correcciones puntuales | `BUGS.md`, `TESTING.md`, `CURRENT_TASK.md` |
| **Zoo Code** | Ejecución de la tarea en curso | `CURRENT_TASK.md`, `TASKS.md` |

Las tres escriben en `AI_MEMORY.md`. Esa es la memoria común.

## Un ciclo de trabajo

```
1. Sesión nueva     → .prompts/onboard.md carga el contexto
2. Coger tarea      → de .ai/TASKS.md a .ai/CURRENT_TASK.md
3. Planificar       → .prompts/plan.md  (si toca >2 archivos)
4. Implementar      → .prompts/implement.md + rol de .agents/
5. Testear          → .prompts/tests.md
6. Revisar          → .prompts/review.md
7. Cerrar           → docs/standards/DEFINITION_OF_DONE.md
8. Dejar rastro     → AI_MEMORY.md, TASKS.md, CHANGELOG.md
```

---

## En Visual Studio Code

El repositorio funciona sin configuración adicional:

1. Abre la carpeta en VS Code.
2. Claude Code detecta `CLAUDE.md` y desde ahí llega a `AGENTS.md`.
3. Codex y Zoo Code leen `AGENTS.md` directamente.
4. `.editorconfig` mantiene el formato consistente entre todos.

Si tu herramienta usa otro nombre de archivo de configuración, crea un puente de
dos líneas apuntando a `AGENTS.md` — igual que hace `CLAUDE.md`. **No dupliques el
contenido:** se desincroniza.

---

## Principios

1. **Una fuente de verdad.** El contenido duplicado se desincroniza. Siempre.
2. **El contexto se versiona.** Vive con el código, se revisa en el mismo PR.
3. **Las reglas son explícitas.** Lo que no está escrito, la IA lo inventa.
4. **Deja rastro.** Si no lo escribiste, la próxima sesión no lo sabe.
5. **El alcance se respeta.** Ni menos de lo pedido, ni más.
6. **Nada se da por hecho** sin cumplir el *Definition of Done*.

---

## Personalizar

Esta plantilla es un punto de partida, no un dogma.

- **Trabajas solo:** quédate con `.ai/`, `.agents/`, `.prompts/`, el *Definition of
  Done* y los estándares de código. Borra `docs/process/`.
- **No usas Scrum:** borra `docs/process/SCRUM.md` y las plantillas de sprint.
- **No es un proyecto web:** borra `backend/`, `frontend/` y `API_DESIGN.md`.
- **Necesitas más roles:** añade archivos a `.agents/` con la misma estructura.

**Lo único que no deberías quitar:** `AGENTS.md`, `.ai/RULES.md`, `.ai/AI_MEMORY.md`
y el *Definition of Done*. Ahí está el valor.

---

## Contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md).
Vulnerabilidades de seguridad: [`SECURITY.md`](SECURITY.md) — no abras un issue público.

## Licencia

[MIT](LICENSE) — úsalo, modifícalo, véndelo. Sin restricciones.
