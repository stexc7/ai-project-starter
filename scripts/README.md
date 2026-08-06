# scripts/

Automatización local. Los scripts `.ps1` funcionan en Windows PowerShell y en
PowerShell Core; los `.sh` en Linux, macOS y Git Bash.

---

## Disponibles

| Script | Qué hace |
|--------|----------|
| `new-adr.ps1` / `new-adr.sh` | Crea un ADR numerado a partir de la plantilla y lo añade al índice |
| `check-context.ps1` | Verifica que el contexto para IAs (`.ai/`) está completo y al día |

## Uso

**Crear un ADR:**

```bash
pwsh scripts/new-adr.ps1 "Usar PostgreSQL como base de datos principal"
```

```bash
./scripts/new-adr.sh "Usar PostgreSQL como base de datos principal"
```

**Verificar el contexto antes de abrir un PR:**

```bash
pwsh scripts/check-context.ps1
```

Comprueba archivos obligatorios, plantillas sin rellenar, `AI_MEMORY.md`
demasiado largo, `.env` versionado y enlaces internos rotos.

---

## Scripts que querrás añadir

Según el proyecto:

| Script | Para qué |
|--------|----------|
| `setup` | Del clon a entorno funcionando en un comando |
| `seed` | Poblar la base de datos de desarrollo |
| `db-reset` | Recrear la BD local desde cero |
| `check-all` | Lint + tipos + tests, lo mismo que el CI, en local |
| `release` | Automatizar los pasos de `docs/process/RELEASE_PROCESS.md` |

## Reglas para los scripts de este directorio

1. **Idempotentes.** Ejecutarlos dos veces no rompe nada.
2. **Fallan pronto y en voz alta.** `set -euo pipefail` en bash,
   `$ErrorActionPreference = 'Stop'` en PowerShell.
3. **Sin secretos dentro.** Léelos de variables de entorno.
4. **Documentados en este README.**
5. **Nunca tocan producción** sin una confirmación explícita.
