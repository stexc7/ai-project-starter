# Prompt: Implementar

---

```
Adopta el rol de .agents/<backend|frontend|data>.md.

CONTEXTO — lee antes de empezar:
- AGENTS.md
- .ai/RULES.md
- .ai/ARCHITECTURE.md
- .ai/STACK.md
- .ai/GLOSSARY.md
- .ai/CURRENT_TASK.md
- docs/standards/CODE_STANDARDS.md

TAREA:
<qué hay que implementar>

CRITERIOS DE ACEPTACIÓN:
- [ ] <criterio 1>
- [ ] <criterio 2>

ARCHIVOS QUE PUEDES TOCAR:
<lista. Si necesitas tocar otro, pregunta primero.>

REGLAS:
1. Sigue los patrones que YA existen en este repositorio. Antes de inventar una
   forma de hacer algo, busca cómo se hace en otra parte del código.
2. No amplíes el alcance. Si ves otra cosa que arreglar, anótala al final de tu
   respuesta y NO la toques.
3. Cambios quirúrgicos. No reescribas archivos completos.
4. Toda función nueva lleva su test.
5. Sin secretos, sin datos sensibles en logs.
6. Sin dependencias nuevas sin preguntar antes.

PROCESO:
1. Explora el código relevante y dime qué encontraste.
2. Implementa paso a paso, verificando entre pasos.
3. Ejecuta los tests. Si fallan, arréglalos — sin adaptar el test al bug.
4. Verifica contra docs/standards/DEFINITION_OF_DONE.md.

AL TERMINAR, dame:
- Resumen de lo que hiciste
- Lista de archivos modificados, con una línea de qué cambió en cada uno
- Resultado real de los tests (pégalo, no lo resumas)
- Qué NO hiciste y por qué
- Cosas detectadas al paso, para .ai/TASKS.md
- Entrada propuesta para .ai/AI_MEMORY.md
```

---

## Recordatorio para el humano

Si la IA te devuelve 600 líneas de código de una vez, no las revises así: pídele que
lo divida en pasos. El código que no revisas es código que no controlas.
