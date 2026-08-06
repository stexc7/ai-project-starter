# Prompt: Refactorizar

> **Definición:** cambiar la estructura del código **sin cambiar su comportamiento**.
> Si el comportamiento cambia, no es un refactor: es un cambio funcional.

---

```
CONTEXTO:
- AGENTS.md
- .ai/RULES.md
- .ai/ARCHITECTURE.md
- docs/standards/CODE_STANDARDS.md

QUÉ REFACTORIZAR:
<archivo, módulo o función>

POR QUÉ:
<el problema concreto. "Está feo" no es un motivo. "Esta función tiene 200 líneas
y 6 responsabilidades, y cada cambio rompe algo" sí lo es.>

QUÉ NO PUEDE CAMBIAR:
- La API pública
- El comportamiento observable
- <lo que sea>

---

INSTRUCCIONES:

REGLA DE ORO: los tests deben pasar ANTES y DESPUÉS, sin modificarlos.

1. RED DE SEGURIDAD
   Ejecuta los tests actuales. ¿Pasan? ¿Cubren este código?
   Si NO hay cobertura: escribe primero tests del comportamiento ACTUAL
   (aunque sea raro, aunque parezca un bug). No refactorices a ciegas.

2. DIAGNÓSTICO
   Qué está mal exactamente:
   - ¿Duplicación?
   - ¿Demasiadas responsabilidades?
   - ¿Nombres que mienten?
   - ¿Anidamiento excesivo?
   - ¿Acoplamiento con algo que no debería conocer?
   - ¿Abstracción prematura que sobra?

3. PLAN EN PASOS PEQUEÑOS
   Cada paso deja el código funcionando y los tests en verde.
   Nada de "reescribo todo y luego vemos".

   | # | Paso | Riesgo |

4. EJECUCIÓN
   Un paso. Tests. Siguiente paso. Tests.
   Si un paso rompe algo, párate y dime.

5. VERIFICACIÓN FINAL
   - Los mismos tests, sin modificar, en verde
   - El comportamiento observable es idéntico
   - El código es medible mejor: menos líneas, menos anidamiento,
     menos responsabilidades por unidad

PROHIBIDO:
- Mezclar refactor con cambio funcional (son dos commits)
- Modificar tests "para que encajen con la nueva estructura"
- Refactorizar sin cobertura previa
- Añadir funcionalidad "ya que estamos"
- Renombrar cosas en el mismo commit que cambias estructura

AL TERMINAR:
- Antes/después de las métricas que importen
- Confirmación de que los tests no se tocaron
- Commit tipo `refactor(scope): ...`
```

---

## Cuándo NO refactorizar

- Cuando no hay tests que cubran el código y no puedes escribirlos.
- Cuando el código no se va a tocar nunca más.
- Cuando la única razón es preferencia estética.
- En el mismo PR que un cambio funcional.
- Justo antes de un despliegue importante.
