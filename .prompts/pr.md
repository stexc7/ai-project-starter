# Prompt: Descripción de Pull Request

---

```
Lee .github/PULL_REQUEST_TEMPLATE.md y docs/standards/DEFINITION_OF_DONE.md.

Genera la descripción del PR para esta rama.

CAMBIOS:
<diff, o "los commits de esta rama frente a main">

TAREA: <TASK-NNN>

---

REGLAS:

1. Escribe para el REVISOR, no para ti. Su primera pregunta es "¿qué tengo que
   mirar y por qué?".

2. Empieza por el POR QUÉ. Qué problema resuelve esto.

3. Di qué CAMBIÓ de forma observable. Si un usuario no notaría nada, dilo.

4. Señala dónde quieres atención especial. Sé honesto: "la lógica de reintentos
   del punto 3 es la parte que menos me convence".

5. Di cómo se prueba. Pasos concretos que el revisor pueda seguir.

6. Rellena el checklist del Definition of Done con la verdad. Si algo no está,
   márcalo como no hecho y explica por qué.

7. Sin capturas de pantalla con datos reales de clientes.

FORMATO: el de .github/PULL_REQUEST_TEMPLATE.md, completo.

Si el PR supera las ~400 líneas de cambio, dímelo y propón cómo dividirlo.
```

---

## Antes de abrir el PR

- [ ] Rebase sobre `main` actualizado, conflictos resueltos
- [ ] Todos los tests en verde **en local**
- [ ] Linter limpio
- [ ] Sin `console.log`, `print()`, `debugger` ni `TODO` sin ticket
- [ ] Sin archivos que no pertenecen al cambio (`.env`, `node_modules`, temporales)
- [ ] Commits limpios (si hay diez commits de "wip", aplástalos)
- [ ] Documentación actualizada en este mismo PR
- [ ] `.ai/CURRENT_TASK.md` y `.ai/TASKS.md` al día

## Tamaño del PR

| Líneas | Calidad de la revisión |
|--------|------------------------|
| < 100 | Revisión real, línea a línea |
| 100–400 | Revisión aceptable |
| 400–1000 | Revisión superficial |
| > 1000 | Aprobado sin leer |

Si tu PR está en las dos últimas filas, divídelo. Un PR grande no ahorra tiempo:
traslada el coste a producción.
