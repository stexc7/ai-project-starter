# .agents/ — Perfiles de rol

Cada archivo define un **rol** que una IA puede adoptar. No son personalidades: son
contratos de trabajo. Cada uno delimita qué hace ese rol, qué entrega, qué **no**
toca, y cuándo debe ceder el trabajo a otro rol.

## Cómo se usan

**Adoptar un rol:**
> "Adopta el rol de `.agents/backend.md` y resuelve TASK-014."

**Delegar a un subagente** (si tu herramienta lo soporta):
> "Lanza un subagente con `.agents/reviewer.md` sobre el diff de esta rama."

**Encadenar roles** — el flujo normal de una funcionalidad:
> `architect` → `backend` / `frontend` → `qa` → `reviewer` → `security` → `devops`

## Roles disponibles

| Rol | Se ocupa de | No toca |
|-----|-------------|---------|
| [`architect`](architect.md) | Diseño, ADRs, límites entre módulos | Implementación detallada |
| [`backend`](backend.md) | API, dominio, persistencia | UI, estilos |
| [`frontend`](frontend.md) | UI, estado, accesibilidad | Esquema de BD, lógica de negocio |
| [`reviewer`](reviewer.md) | Revisión crítica de código | Escribir la funcionalidad |
| [`qa`](qa.md) | Tests, casos límite, regresión | Diseño de la solución |
| [`devops`](devops.md) | CI/CD, infraestructura, despliegue | Lógica de aplicación |
| [`security`](security.md) | Amenazas, secretos, dependencias | Funcionalidad nueva |
| [`data`](data.md) | Esquema, migraciones, consultas | Capa de presentación |
| [`docs-writer`](docs-writer.md) | Documentación, README, changelog | Código de producción |

## Reglas comunes a todos los roles

1. **Todos** leen `AGENTS.md` y `.ai/RULES.md` antes de empezar.
2. **Ningún** rol se sale de su alcance. Si el trabajo pertenece a otro rol, lo dices
   y lo anotas en `.ai/TASKS.md`.
3. **Todos** dejan rastro en `.ai/AI_MEMORY.md` al terminar.
4. **Ninguno** da algo por terminado sin cumplir `docs/standards/DEFINITION_OF_DONE.md`.
