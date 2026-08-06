# Prompt: Arrancar una sesión

> El primer mensaje de cualquier sesión nueva. Carga el contexto antes de trabajar.

---

## Sesión nueva

```
Antes de hacer nada, lee en este orden y confírmame que los tienes:

1. AGENTS.md
2. .ai/PROJECT.md
3. .ai/RULES.md
4. .ai/STACK.md
5. .ai/ARCHITECTURE.md
6. .ai/GLOSSARY.md
7. .ai/AI_MEMORY.md
8. .ai/CURRENT_TASK.md

Luego respóndeme, en menos de 20 líneas:

1. Qué construye este proyecto, en una frase.
2. Cuál es la tarea activa y en qué estado está.
3. Qué 3 reglas de RULES.md aplican más a esa tarea.
4. Qué hay en AI_MEMORY.md que me afecte ahora mismo.
5. Qué NO tengo claro y necesito preguntarte antes de empezar.

No escribas código todavía.
```

---

## Retomar tras una interrupción

```
Lee .ai/CURRENT_TASK.md y .ai/AI_MEMORY.md.
Revisa el estado del repositorio: git status, git diff, rama actual.

Dime:
- Qué se estaba haciendo
- Qué está hecho y qué falta (según la sección Progreso)
- Si hay cambios sin commitear, qué son
- Cuál es el siguiente paso concreto

No sigas trabajando hasta que te lo confirme.
```

---

## Cerrar una sesión

```
Antes de terminar, actualiza:

1. .ai/CURRENT_TASK.md → sección Progreso, estado real de cada paso
2. .ai/AI_MEMORY.md → qué aprendiste que la próxima sesión necesita saber
   (usa el formato del archivo, entrada nueva arriba)
3. .ai/TASKS.md → tareas nuevas detectadas al paso
4. .ai/BUGS.md → bugs encontrados
5. .ai/DECISIONS.md → decisiones tomadas

Después dame un resumen:
- Qué se completó
- Qué quedó a medias y en qué punto exacto
- Qué debería hacer la próxima sesión primero
- Qué preguntas quedaron abiertas
```

---

## Cambiar de rol a mitad de sesión

```
Cambia al rol de .agents/<rol>.md.

Olvida el enfoque anterior. Lee ese archivo y adopta su alcance, sus
restricciones y su formato de salida.

Aplícalo sobre: <qué>
```
