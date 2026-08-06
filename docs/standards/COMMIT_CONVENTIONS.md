# Convenciones de commit

Basado en [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/).

---

## Formato

```
tipo(alcance): descripción breve

Cuerpo opcional explicando el POR QUÉ del cambio.
Puede ocupar varios párrafos.

Refs: TASK-042
BREAKING CHANGE: descripción del cambio incompatible
```

## Tipos

| Tipo | Cuándo | ¿Cambia la versión? |
|------|--------|---------------------|
| `feat` | Funcionalidad nueva para el usuario | MINOR |
| `fix` | Corrección de un bug | PATCH |
| `docs` | Solo documentación | — |
| `style` | Formato, espacios, punto y coma. Sin cambio de código | — |
| `refactor` | Cambio de estructura sin cambio de comportamiento | — |
| `perf` | Mejora de rendimiento | PATCH |
| `test` | Añadir o corregir tests | — |
| `build` | Sistema de build, dependencias | — |
| `ci` | Configuración de integración continua | — |
| `chore` | Mantenimiento que no toca src ni tests | — |
| `revert` | Revierte un commit anterior | — |

`BREAKING CHANGE:` en el pie → MAJOR, sea cual sea el tipo.

## Alcance

El área afectada. Usa nombres consistentes dentro del proyecto:

```
feat(auth): ...
fix(invoices): ...
refactor(api): ...
chore(deps): ...
```

Sin alcance si el cambio es transversal: `chore: actualizar node a 22`.

## Descripción

- **Imperativo**: "añade", no "añadido" ni "añadiendo".
- **Minúscula** inicial.
- **Sin punto** final.
- **Máximo 72 caracteres.**
- Dice **qué hace el commit**, no qué archivos toca.

## Cuerpo

Opcional, pero muy recomendable cuando el cambio no es evidente.

Explica:
- Por qué era necesario
- Qué alternativas se descartaron
- Qué efectos secundarios tiene
- Qué queda pendiente

El **qué** ya está en el diff. No lo repitas.

## Pie

```
Refs: TASK-042              ← relacionado con
Closes: BUG-007             ← cierra
Co-authored-by: Nombre <email>
BREAKING CHANGE: el endpoint /users ahora devuelve un objeto paginado
                 en lugar de un array. Los clientes deben leer `.items`.
```

---

## Ejemplos

### ✅ Bien

```
feat(invoices): permitir exportar a CSV

Los usuarios pedían llevarse los datos a su contabilidad. Se eligió CSV
sobre XLSX para evitar añadir una dependencia de 2 MB por una
funcionalidad secundaria.

Limitado a 10 000 filas por exportación para no bloquear el worker.

Refs: TASK-042
```

```
fix(auth): rechazar tokens caducados en el refresh

El endpoint de refresh validaba la firma pero no la fecha de expiración,
así que un token caducado seguía renovándose indefinidamente.

Closes: BUG-007
```

```
refactor(orders): extraer el cálculo de impuestos a TaxCalculator

Sin cambio de comportamiento. Los tests existentes pasan sin modificar.
```

### ❌ Mal

| Mensaje | Problema |
|---------|----------|
| `arreglos varios` | ¿Cuáles? Además, son varios commits |
| `fix: bug` | ¿Qué bug? |
| `WIP` | El trabajo a medias no se commitea en rama compartida |
| `feat: añade método getUserById a UserService` | Eso ya lo dice el diff |
| `Update file.ts` | No dice nada |
| `feat(api): añade endpoint y arregla el login y actualiza deps` | Tres commits en uno |

---

## Reglas

1. **Un commit = un cambio lógico.** Si el mensaje necesita una "y", divídelo.
2. **El código commiteado compila y pasa los tests.** Cada commit, no solo el último.
3. **Nada de commits de formato mezclados** con cambios funcionales.
4. **En español.** Consistente con el resto de la documentación.
5. Antes de abrir el PR, limpia el historial: diez commits de `wip` se aplastan en uno.
