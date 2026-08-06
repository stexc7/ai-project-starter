# CLAUDE.md

Claude Code lee este archivo automáticamente al abrir el proyecto.

## → Lee primero [`AGENTS.md`](AGENTS.md)

Ese archivo es el contrato compartido por **todas** las IAs de este repositorio
(Claude Code, Codex, Zoo Code). Contiene el protocolo de arranque, las reglas y el
checklist de cierre de tarea. No lo dupliques aquí.

---

## Contexto específico para Claude Code

Claude Code suele encargarse en este proyecto de:

- **Arquitectura y diseño** → mantener `.ai/ARCHITECTURE.md` al día.
- **Refactors amplios** → cambios que tocan varios módulos a la vez.
- **Revisión de código** → usar `docs/standards/CODE_REVIEW_CHECKLIST.md`.
- **ADRs** → registrar decisiones en `docs/adr/`.

### Agentes disponibles

En `.agents/` hay perfiles de rol que puedes adoptar o delegar. Cada uno define su
alcance, sus entregables y lo que tiene prohibido tocar:

`architect` · `backend` · `frontend` · `reviewer` · `qa` · `devops` · `security` · `data` · `docs-writer`

### Prompts reutilizables

En `.prompts/` hay plantillas ya escritas para las tareas frecuentes:

`plan` · `implement` · `review` · `debug` · `refactor` · `tests` · `adr` · `commit` · `pr` · `security-audit`

---

## Comandos del proyecto

<!-- Rellena esto cuando el proyecto tenga stack definido. -->

```bash
# Instalar
# Desarrollo
# Tests
# Lint
# Build
```

## Reglas rápidas

- Nunca hagas `commit` sin ejecutar los tests antes.
- Nunca subas a `main` directamente. Rama + PR. Ver `docs/standards/BRANCHING.md`.
- Antes de dar algo por hecho: `docs/standards/DEFINITION_OF_DONE.md`.
