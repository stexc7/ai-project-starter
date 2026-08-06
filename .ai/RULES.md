# RULES.md — Reglas duras

> No son sugerencias. Si una regla estorba, se discute con el humano y se cambia
> **aquí**. Nunca se ignora en silencio.

---

## 1. Alcance

- Haz **exactamente** lo que se pidió. Ni menos, ni más.
- ¿Ves algo más que arreglar? Anótalo en `.ai/TASKS.md` y sigue con lo tuyo.
- ¿La tarea es ambigua? Pregunta antes de escribir código, no después.
- Nunca refactorices "de paso" dentro de un cambio funcional. Son dos commits distintos.

## 2. Código

- Escribe código que **parezca escrito por el mismo equipo**: misma nomenclatura,
  mismo estilo de comentarios, mismos patrones que el código de alrededor.
- Sin números mágicos. Constantes con nombre.
- Sin funciones de más de ~50 líneas sin una buena razón.
- Sin anidamiento de más de 3 niveles. Usa cláusulas de guarda (*early return*).
- Nombres en inglés en el código. Comentarios y documentación en español.
- Un comentario explica el **porqué**, no el **qué**. El qué ya lo dice el código.

## 3. Errores

- Nunca captures una excepción para silenciarla. O la manejas, o la propagas.
- Todo error que llegue al usuario debe ser accionable ("falta el campo email",
  no "error 500").
- Loguea el error con contexto suficiente para reproducirlo. Sin datos sensibles.

## 4. Tests

- Todo código nuevo lleva tests. Sin excepciones para "es que es trivial".
- Un bug corregido lleva un test que falla antes del fix y pasa después.
- **Prohibido** borrar o marcar como *skip* un test para que el build pase.
- Ver `docs/standards/TESTING_STRATEGY.md`.

## 5. Dependencias

- Antes de añadir una librería: ¿la biblioteca estándar lo resuelve? ¿Ya hay otra
  dependencia que lo hace?
- Toda dependencia nueva se justifica en `.ai/DECISIONS.md`.
- Nada de dependencias sin mantenimiento activo o con licencias incompatibles.

## 6. Seguridad

- Nunca hardcodees credenciales, tokens, claves o URLs con secretos.
- Toda entrada del usuario se valida en el servidor. La validación en el cliente
  es cortesía, no seguridad.
- Consultas parametrizadas siempre. Nada de concatenar SQL.
- Ver `.ai/SECURITY.md` y `docs/standards/SECURITY_CHECKLIST.md`.

## 7. Git

- Ramas según `docs/standards/BRANCHING.md`.
- Commits según `docs/standards/COMMIT_CONVENTIONS.md`.
- Un commit = un cambio lógico. Nada de commits "varios arreglos".
- Nunca `push --force` sobre `main` o `develop`.
- Nunca commitees: `.env`, `node_modules/`, credenciales, volcados de BD, binarios grandes.

## 8. Documentación

- Si cambias el comportamiento, actualizas la documentación en el **mismo PR**.
- Si tomas una decisión con consecuencias, escribes un ADR (`docs/adr/`).
- Si aprendes algo que la próxima sesión necesita, va a `.ai/AI_MEMORY.md`.

## 9. Para agentes de IA específicamente

- No borres código que no entiendas. Pregunta para qué sirve.
- No "arregles" tests que fallan cambiando lo que esperan. Investiga por qué fallan.
- No generes archivos de 500 líneas de una vez. Trabaja en incrementos revisables.
- Si tu cambio toca más de 5 archivos, presenta un plan antes de ejecutarlo.
- Reporta fielmente: si algo falló, dilo. Si te saltaste un paso, dilo.

---

## Reglas específicas de este proyecto

<!-- Añade aquí lo que sea propio de tu proyecto. -->

- 
