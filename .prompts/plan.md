# Prompt: Planificar

> Úsalo **antes** de escribir código para cualquier cosa que toque más de dos archivos.

---

```
Adopta el rol de .agents/architect.md.

CONTEXTO — lee antes de responder:
- AGENTS.md
- .ai/PROJECT.md
- .ai/ARCHITECTURE.md
- .ai/RULES.md
- .ai/STACK.md
- .ai/DECISIONS.md

TAREA A PLANIFICAR:
<descripción de qué hay que construir>

CRITERIOS DE ACEPTACIÓN:
- <qué debe ser cierto al terminar>

RESTRICCIONES:
- <plazo, tecnología obligatoria, lo que no se puede tocar>

NO ESCRIBAS CÓDIGO TODAVÍA. Devuélveme:

1. ENTENDIMIENTO
   Reformula la tarea con tus palabras. Si algo es ambiguo, dilo aquí en lugar
   de asumirlo.

2. EXPLORACIÓN
   Qué archivos del repositorio son relevantes y por qué. Qué ya existe que
   pueda reutilizarse.

3. OPCIONES
   Al menos dos enfoques. Para cada uno:
   - Cómo funciona
   - Qué cuesta implementarlo
   - Qué se complica después
   - Riesgos

4. RECOMENDACIÓN
   Cuál eliges y por qué. Sin ambigüedad.

5. PLAN POR PASOS
   Pasos ordenados, cada uno independientemente verificable:
   | # | Paso | Archivos | Cómo se verifica |

6. ARCHIVOS AFECTADOS
   Lista completa: creados, modificados, eliminados.

7. RIESGOS
   Qué puede salir mal y cómo lo mitigas.

8. FUERA DE ALCANCE
   Qué NO vas a hacer aunque esté cerca.

9. DECISIONES QUE REQUIEREN ADR
   Si las hay.

Espera mi aprobación antes de implementar.
```

---

## Variante corta

Para tareas pequeñas:

```
Antes de tocar código: dime qué archivos vas a modificar, en qué orden, y cómo
verificarás cada paso. Máximo 10 líneas. Espera mi OK.
```
