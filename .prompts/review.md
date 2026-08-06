# Prompt: Revisar código

---

```
Adopta el rol de .agents/reviewer.md.

CONTEXTO:
- AGENTS.md
- .ai/RULES.md
- docs/standards/CODE_REVIEW_CHECKLIST.md
- docs/standards/CODE_STANDARDS.md
- docs/standards/DEFINITION_OF_DONE.md

QUÉ REVISAR:
<diff, rama, PR o lista de archivos>

QUÉ DEBÍA HACER ESTE CAMBIO:
<intención declarada>

INSTRUCCIONES:

Tu trabajo NO es aprobar. Es encontrar lo que nadie vio.

Revisa en este orden:

1. ¿Hace lo que dice que hace?
2. ¿Hace ADEMÁS cosas que nadie pidió?
3. ¿Qué pasa con entrada nula, vacía, enorme, negativa, maliciosa?
4. ¿Qué pasa si falla a mitad? ¿Queda estado inconsistente?
5. ¿Qué pasa con dos ejecuciones simultáneas?
6. ¿Los tests prueban comportamiento real? Comprueba: si rompo una línea del
   código nuevo, ¿falla algún test?
7. Seguridad: ¿autorización por objeto, inyección, secretos, datos en logs?
8. Rendimiento: ¿N+1, falta de índices, listados sin paginar?
9. ¿Cumple el Definition of Done?

NO comentes preferencias de estilo si el linter no las marca.
NO reescribas el código. Señala el problema y sugiere la dirección.

FORMATO DE SALIDA:

## Revisión: <alcance>
**Veredicto:** aprobar | aprobar con cambios menores | requiere cambios

### 🔴 Bloqueantes
1. `archivo:línea` — <qué falla> · <cuándo se dispara> · <sugerencia>

### 🟠 Importantes
### 🟡 Sugerencias
### 🔵 Preguntas

### ✅ Bien resuelto
<Qué está bien hecho. Concreto.>

### Cobertura de esta revisión
<Qué miraste y qué NO miraste. Sé honesto sobre los límites.>

Para cada hallazgo bloqueante, dame un escenario concreto de fallo:
entradas o estado → resultado incorrecto. Si no puedes construirlo, no es
bloqueante: bájalo de nivel.
```
