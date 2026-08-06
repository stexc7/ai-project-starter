# Estrategia de ramas

Modelo: **trunk-based con ramas de vida corta**. Simple, y suficiente para la mayoría
de equipos.

---

## Ramas

| Rama | Qué es | Protegida |
|------|--------|-----------|
| `main` | Siempre desplegable. Refleja producción | ✅ Sí |
| `<tipo>/<TASK>-<descripcion>` | Trabajo en curso. Vida corta | No |
| `hotfix/<descripcion>` | Corrección urgente en producción | No |

> Si el proyecto necesita `develop` y `release/*` (GitFlow), documéntalo aquí con un
> ADR que justifique la complejidad extra.

## Nomenclatura

```
feat/TASK-042-exportar-facturas-csv
fix/BUG-007-token-refresh-caducado
refactor/TASK-051-extraer-tax-calculator
docs/TASK-018-guia-despliegue
chore/actualizar-dependencias
hotfix/pagos-caidos
```

**Reglas:**
- Prefijo = el tipo de commit correspondiente.
- ID de la tarea cuando exista.
- Descripción en `kebab-case`, corta, en español.
- Sin caracteres especiales, sin acentos, sin espacios.

## Reglas de `main`

- **Nunca** se hace push directo. Siempre por PR.
- **Nunca** `push --force`.
- Merge solo con: CI en verde + al menos una aprobación.
- Siempre debe ser desplegable. Si `main` está roto, arreglarlo es la prioridad cero.

## Ciclo de vida de una rama

```bash
# 1. Partir de main actualizado
git checkout main
git pull origin main
git checkout -b feat/TASK-042-exportar-facturas-csv

# 2. Trabajar, commiteando de forma atómica
git add -p
git commit -m "feat(invoices): permitir exportar a CSV"

# 3. Mantenerse al día (diario si la rama vive más de un día)
git fetch origin
git rebase origin/main

# 4. Subir
git push -u origin feat/TASK-042-exportar-facturas-csv

# 5. Abrir PR con la plantilla del repositorio

# 6. Tras el merge, limpiar
git checkout main
git pull origin main
git branch -d feat/TASK-042-exportar-facturas-csv
```

## Vida de una rama

**Máximo 3 días.** Si necesitas más, la tarea es demasiado grande: divídela.

Cuanto más vive una rama, más diverge, más conflictos genera y más grande es el PR
que nadie va a revisar bien.

## Rebase vs. merge

| Situación | Qué hacer |
|-----------|-----------|
| Actualizar tu rama con `main` | `rebase` — historial limpio |
| Integrar tu rama en `main` | `squash merge` — un commit por tarea |
| Rama ya compartida con otra persona | `merge`, nunca `rebase` |

**Regla:** nunca hagas rebase de commits que ya están publicados y que otra persona
pueda tener localmente.

## Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/pagos-caidos
# arreglar + test que lo cubra
git commit -m "fix(payments): reintentar cuando la pasarela devuelve 503"
git push -u origin hotfix/pagos-caidos
# PR con revisión acelerada → merge → desplegar → verificar
```

Después del hotfix:
- Registra el bug en `.ai/BUGS.md` con causa raíz.
- Si fue grave, escribe un postmortem en `docs/process/INCIDENT_POSTMORTEM.md`.

## Etiquetas de versión

```bash
git tag -a v1.2.0 -m "Exportación CSV y correcciones de autenticación"
git push origin v1.2.0
```

SemVer: `MAJOR.MINOR.PATCH`. Ver `docs/process/RELEASE_PROCESS.md`.

## Prohibido

- Push directo a `main`.
- `push --force` a una rama compartida (usa `--force-with-lease` si no queda otra,
  y solo en tu propia rama).
- Ramas que viven semanas.
- Ramas sin PR.
- Commitear en la rama equivocada y "ya lo arreglo luego".
