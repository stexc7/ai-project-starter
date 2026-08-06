# Prompt: Mensaje de commit

---

```
Lee docs/standards/COMMIT_CONVENTIONS.md.

Genera el mensaje de commit para estos cambios:

<pega el diff, o di: "los cambios en el staging area">

REGLAS:
- Conventional Commits: tipo(alcance): descripción
- Descripción en imperativo, minúscula, sin punto final, ≤ 72 caracteres
- El cuerpo explica el POR QUÉ, no el qué (el qué está en el diff)
- Referencia la tarea: "Refs: TASK-014" o "Closes: BUG-007"
- BREAKING CHANGE: en el pie si rompe compatibilidad
- En español

Si el diff contiene cambios que NO pertenecen al mismo cambio lógico, dímelo:
propón cómo dividirlo en varios commits en lugar de escribir un mensaje
que diga "varias cosas".

Devuélveme solo el mensaje, listo para copiar.
```

---

## Referencia rápida

```
feat:     funcionalidad nueva para el usuario
fix:      corrección de bug
docs:     solo documentación
style:    formato, sin cambio de código
refactor: cambio de estructura sin cambio de comportamiento
perf:     mejora de rendimiento
test:     añadir o corregir tests
build:    sistema de build o dependencias
ci:       configuración de integración continua
chore:    tareas de mantenimiento
revert:   revierte un commit anterior
```

### Ejemplo bien hecho

```
feat(invoices): permitir exportar facturas a CSV

Los usuarios pedían llevarse los datos a su contabilidad. Exportamos en
CSV en lugar de Excel para evitar añadir una dependencia de generación
de XLSX por una funcionalidad secundaria.

Limitado a 10 000 filas por exportación para no bloquear el worker.

Refs: TASK-042
```

### Ejemplos mal hechos

```
❌ arreglos                      → ¿cuáles?
❌ fix: bug                      → ¿qué bug?
❌ WIP                           → no se commitea trabajo a medias en una rama compartida
❌ feat: añadido el método getUserById en UserService  → eso ya lo dice el diff
❌ Actualización.                → no dice nada
```
