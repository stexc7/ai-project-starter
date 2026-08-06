# Prompt: Escribir un ADR

> ADR = *Architecture Decision Record*. Documenta **por qué** se decidió algo,
> para que dentro de un año nadie tenga que adivinarlo.

---

## ¿Hace falta un ADR?

Sí, si se cumple alguna:

- Es difícil o caro de revertir.
- Afecta a más de un módulo.
- Alguien preguntará "¿por qué se hizo así?" en el futuro.
- Se descartaron alternativas razonables.
- Introduce una dependencia importante.
- Cambia cómo se despliega, se prueba o se opera el sistema.

No, si: es reversible en una tarde, afecta a un solo archivo, o es una preferencia
de estilo. Eso va a `.ai/DECISIONS.md` o a ningún sitio.

---

```
Adopta el rol de .agents/architect.md.

CONTEXTO:
- .ai/ARCHITECTURE.md
- .ai/DECISIONS.md
- docs/adr/ (lee los ADRs existentes para no contradecirlos)
- docs/adr/0000-adr-template.md

DECISIÓN A DOCUMENTAR:
<qué se decidió>

SITUACIÓN QUE LA FORZÓ:
<qué problema hay>

ALTERNATIVAS QUE SE CONSIDERARON:
- <alternativa> → <por qué no>

---

INSTRUCCIONES:

Escribe el ADR siguiendo docs/adr/0000-adr-template.md.

Numeración: el siguiente número libre en docs/adr/.
Nombre del archivo: NNNN-titulo-en-kebab-case.md

EXIGENCIAS:

1. El CONTEXTO describe la situación, no la solución. Escríbelo de forma que
   alguien pueda leer solo esa sección y entender el problema.

2. Las ALTERNATIVAS son reales. Nada de opciones de paja puestas para que la
   elegida parezca obvia. Cada alternativa lleva su ventaja auténtica.

3. Las CONSECUENCIAS incluyen las MALAS. Un ADR que solo lista beneficios no es
   un ADR, es publicidad. Di qué se vuelve más difícil.

4. Sé concreto. "Mejor rendimiento" no vale. "Reduce la latencia p95 de las
   consultas de listado de ~800 ms a ~120 ms según la prueba X" sí.

5. Si la decisión anula un ADR anterior, dilo explícitamente y actualiza el
   estado del ADR antiguo a "Reemplazado por NNNN".

DESPUÉS:
- Actualiza .ai/ARCHITECTURE.md si el ADR cambia la estructura
- Añade la fila al índice de docs/adr/README.md
- Registra la entrada en .ai/AI_MEMORY.md
```

---

## Estados de un ADR

| Estado | Significa |
|--------|-----------|
| `Propuesto` | Escrito, aún no acordado |
| `Aceptado` | En vigor |
| `Rechazado` | Se consideró y se descartó. **Se conserva** — evita reabrir el debate |
| `Obsoleto` | Ya no aplica, pero nada lo reemplazó |
| `Reemplazado por NNNN` | Otro ADR lo sustituye |

Un ADR **nunca se borra ni se reescribe**. Se le cambia el estado y se escribe uno nuevo.
