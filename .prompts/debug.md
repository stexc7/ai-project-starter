# Prompt: Depurar

---

```
CONTEXTO:
- AGENTS.md
- .ai/ARCHITECTURE.md
- .ai/BUGS.md
- .ai/TESTING.md

SÍNTOMA:
<qué está pasando exactamente>

QUÉ DEBERÍA PASAR:
<comportamiento esperado>

REPRODUCIR:
1. <paso>
2. <paso>

¿ES CONSISTENTE? sí / no / a veces (<cuándo>)

ENTORNO: <prod | staging | local> · <SO> · <versiones>

EVIDENCIA:
```
<log, traza, mensaje de error>
```

QUÉ CAMBIÓ ANTES DE QUE EMPEZARA:
<último despliegue, commit, cambio de config, actualización de dependencia>

QUÉ YA INTENTÉ:
- <intento> → <resultado>

---

INSTRUCCIONES:

NO propongas un arreglo todavía.

1. HIPÓTESIS
   Lista 3 causas posibles, ordenadas por probabilidad. Para cada una: qué
   predice que observaríamos si fuera cierta.

2. DESCARTE
   Para cada hipótesis, dime la comprobación MÁS BARATA que la confirma o
   la descarta. Empieza por la que más información dé.

3. Ejecuta las comprobaciones (o dime qué debo ejecutar yo).

4. CAUSA RAÍZ
   Cuando la tengas, explícala: por qué el código produce este síntoma.
   No pares en el síntoma. Pregunta "¿y por qué pasa eso?" hasta llegar
   a la causa real.

5. TEST QUE FALLA
   Escribe un test que reproduzca el bug y FALLE ahora. Enséñame que falla.

6. ARREGLO
   Ahora sí. El mínimo cambio que corrige la causa raíz.
   Enséñame que el test pasa.

7. HERMANOS
   ¿El mismo patrón equivocado está en otros sitios del código? Búscalo.
   Anota lo que encuentres en .ai/TASKS.md.

8. REGISTRO
   Actualiza .ai/BUGS.md: causa raíz, fix, test que lo cubre.

PROHIBIDO:
- Envolver en try/catch para que deje de fallar
- Cambiar lo que el test espera para que pase
- "Arreglarlo" sin poder explicar por qué fallaba
```

---

## Cuando estás realmente atascado

```
Explícame este código línea por línea como si yo no lo hubiera escrito nunca.
No asumas que hace lo que su nombre sugiere. Dime qué hace REALMENTE, incluyendo
lo que pasa con valores inesperados en cada paso.
```
