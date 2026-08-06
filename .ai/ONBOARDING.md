# ONBOARDING.md — Arranque en 5 minutos

> Para un agente de IA que abre este repositorio por primera vez, o para un humano
> nuevo en el equipo.

---

## Para un agente de IA

### Paso 1 — Lee el contrato

`AGENTS.md` en la raíz. Todo lo demás sale de ahí.

### Paso 2 — Carga el contexto (en este orden)

```
.ai/PROJECT.md        → qué construimos y para quién
.ai/RULES.md          → qué no se hace nunca
.ai/STACK.md          → con qué tecnologías
.ai/ARCHITECTURE.md   → cómo está organizado
.ai/GLOSSARY.md       → cómo se llaman las cosas
.ai/AI_MEMORY.md      → qué aprendieron las sesiones anteriores
.ai/CURRENT_TASK.md   → qué toca ahora
```

### Paso 3 — Adopta un rol

Mira `.agents/` y elige el perfil que corresponde a la tarea. Cada perfil define su
alcance, sus entregables y lo que **no** debe tocar.

### Paso 4 — Usa un prompt de `.prompts/`

No improvises el enfoque. Hay una plantilla para cada tipo de trabajo.

### Paso 5 — Trabaja

Respetando `RULES.md`. Sin salirte del alcance de `CURRENT_TASK.md`.

### Paso 6 — Cierra

El checklist del final de `AGENTS.md`. No es opcional: es lo que hace que la
siguiente sesión no empiece a ciegas.

---

## Para un humano nuevo

1. Lee `.ai/PROJECT.md` y `.ai/ARCHITECTURE.md`. 20 minutos.
2. Levanta el entorno con `.ai/STACK.md` → *Puesta en marcha*.
3. Ejecuta los tests. Si no pasan en limpio, eso ya es un bug: anótalo en `BUGS.md`.
4. Lee `CONTRIBUTING.md` para el flujo de trabajo.
5. Coge una tarea de `.ai/TASKS.md` marcada *Listo para empezar*.

---

## Mapa del repositorio

```
AGENTS.md              Contrato para todas las IAs. Empieza aquí.
CLAUDE.md              Puente para Claude Code → apunta a AGENTS.md.

.ai/                   Memoria del proyecto. Estado vivo.
  PROJECT.md           Qué y para quién.
  RULES.md             Reglas duras.
  ARCHITECTURE.md      Cómo está construido.
  STACK.md             Con qué.
  GLOSSARY.md          Vocabulario del dominio.
  CURRENT_TASK.md      La tarea de ahora.
  TASKS.md             Backlog completo.
  BUGS.md              Bugs abiertos y cerrados.
  TESTING.md           Estado de cobertura.
  SECURITY.md          Qué es sensible aquí.
  DECISIONS.md         Decisiones pequeñas y medianas.
  CHANGELOG.md         Cambios visibles para el usuario.
  AI_MEMORY.md         Memoria entre sesiones.
  ONBOARDING.md        Este archivo.

.agents/               Perfiles de rol para las IAs.
.prompts/              Plantillas de prompt reutilizables.

docs/
  standards/           Estándares: código, commits, ramas, DoD, revisión, tests, seguridad.
  process/             Proceso: scrum, sprints, retros, releases, postmortems.
  adr/                 Architecture Decision Records.
  runbooks/            Procedimientos operativos.

.github/
  workflows/           CI, seguridad, verificación de contexto de IA.
  ISSUE_TEMPLATE/      Plantillas de issue.
  PULL_REQUEST_TEMPLATE.md

backend/               Código de servidor.
frontend/              Código de cliente.
tests/                 Tests que cruzan capas (E2E, integración amplia).
scripts/               Automatización local.
```

---

## Reglas de oro

1. **`AGENTS.md` primero.** Siempre.
2. **Una tarea a la vez.** La de `CURRENT_TASK.md`.
3. **Deja rastro.** Si no lo escribiste, la próxima sesión no lo sabe.
4. **Ante la duda, pregunta.** Es más barato que deshacer.
