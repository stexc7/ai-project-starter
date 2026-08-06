# Prompt: Escribir tests

---

```
Adopta el rol de .agents/qa.md.

CONTEXTO:
- AGENTS.md
- .ai/TESTING.md
- docs/standards/TESTING_STRATEGY.md
- .ai/CURRENT_TASK.md → criterios de aceptación

QUÉ TESTEAR:
<función, módulo, endpoint o flujo>

CRITERIOS DE ACEPTACIÓN A CUBRIR:
- <criterio>

---

INSTRUCCIONES:

1. ANALIZA primero
   - ¿Qué hace este código exactamente?
   - ¿Qué entradas acepta?
   - ¿Qué puede fallar?
   - ¿Qué efectos secundarios tiene?
   - ¿Qué ya está cubierto? No dupliques.

2. LISTA LOS CASOS antes de escribirlos
   | # | Caso | Entrada | Resultado esperado | Tipo |
   Cubre como mínimo:
   - Camino feliz
   - Vacío: "", [], {}, null, campo ausente
   - Límites: 0, 1, máximo, máximo+1, negativo
   - Tipos incorrectos
   - Tamaño extremo
   - Caracteres especiales: emojis, acentos, comillas, <script>, ../
   - Errores esperados y su mensaje
   - Permisos: sin sesión, con sesión sin permiso, recurso de otro usuario
   - Idempotencia: ejecutar dos veces
   - Fallo de dependencia externa

   Espera mi OK sobre la lista antes de escribir código.

3. ESCRIBE los tests
   - Nombre del test = qué comportamiento verifica, en lenguaje claro
     ✅ "devuelve 403 cuando el usuario pide una factura de otro usuario"
     ❌ "test_get_invoice_2"
   - Patrón AAA: preparar, ejecutar, comprobar
   - Un concepto por test
   - Sin dependencias entre tests, sin orden implícito
   - Sin sleep(). Esperas explícitas sobre condiciones
   - Assertions específicas: el mensaje de fallo debe decir QUÉ falló

4. VERIFICA que los tests valen
   Rompe una línea del código de producción a propósito.
   ¿Falla algún test? Si no, el test no prueba nada. Reescríbelo.
   Enséñame el resultado de esta comprobación.

5. ACTUALIZA .ai/TESTING.md
   Cobertura nueva, huecos que quedan.

FORMATO DE SALIDA:
- Los tests
- Resultado real de la ejecución (pégalo)
- Resultado de la comprobación del paso 4
- Qué quedó SIN cubrir y por qué
```

---

## Para cubrir un bug

```
El bug BUG-<N> de .ai/BUGS.md.
1. Escribe un test que reproduzca el bug. Debe FALLAR ahora. Enséñame que falla.
2. Solo entonces, arregla el código.
3. Enséñame que el test pasa.
4. Registra en .ai/BUGS.md: causa raíz + test que lo cubre.
```
