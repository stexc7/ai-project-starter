# Architecture Decision Records

Un ADR documenta una decisión de arquitectura: **qué** se decidió, **por qué**, y
**qué se descartó**.

El valor no está en la decisión — esa se ve en el código. Está en el contexto y en
las alternativas rechazadas. Eso es lo que se pierde con el tiempo y lo que hace que
alguien reabra el mismo debate dentro de un año.

---

## Cuándo escribir uno

**Sí**, si se cumple alguna:
- Es difícil o caro de revertir
- Afecta a más de un módulo
- Alguien preguntará "¿por qué se hizo así?"
- Se descartaron alternativas razonables
- Introduce una dependencia importante
- Cambia cómo se despliega, se prueba o se opera el sistema

**No**, si: es reversible en una tarde, afecta a un solo archivo, o es preferencia
de estilo. Eso va a `.ai/DECISIONS.md`, o a ningún sitio.

## Cómo crear uno

1. Coge el siguiente número libre.
2. Copia [`0000-adr-template.md`](0000-adr-template.md) a `NNNN-titulo-en-kebab-case.md`.
3. Rellénalo. Usa `.prompts/adr.md` si quieres ayuda de una IA.
4. Añade la fila al índice de abajo.
5. Actualiza `.ai/ARCHITECTURE.md` si la decisión cambia la estructura.

O usa el script:

```bash
pwsh scripts/new-adr.ps1 "Usar PostgreSQL como base de datos principal"
```

## Reglas

- **Un ADR nunca se borra ni se reescribe.** Si deja de valer, se cambia su estado
  y se escribe uno nuevo que lo reemplace.
- Los ADR rechazados **se conservan**. Saber qué se descartó y por qué evita repetir
  la discusión.
- El contexto describe el **problema**, no la solución.
- Las consecuencias incluyen las **malas**. Un ADR que solo lista beneficios es
  publicidad, no un registro.

## Estados

| Estado | Significa |
|--------|-----------|
| `Propuesto` | Escrito, pendiente de acuerdo |
| `Aceptado` | En vigor |
| `Rechazado` | Se consideró y se descartó |
| `Obsoleto` | Ya no aplica, nada lo reemplazó |
| `Reemplazado por NNNN` | Otro ADR lo sustituye |

---

## Índice

| # | Título | Estado | Fecha |
|---|--------|--------|-------|
| [0001](0001-registrar-decisiones-de-arquitectura.md) | Registrar decisiones de arquitectura | Aceptado | 2026-01-01 |
