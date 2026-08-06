# DECISIONS.md — Registro rápido de decisiones

> Para decisiones **pequeñas o medianas**. Las grandes (con consecuencias
> estructurales, difíciles de revertir) van a un ADR completo en `docs/adr/`.
>
> Regla práctica: si dentro de seis meses alguien va a preguntar *"¿por qué se hizo
> así?"*, escríbelo. Aquí o en un ADR.

---

## Formato

```
### AAAA-MM-DD — <Decisión en una frase>
**Contexto:** qué situación forzó la decisión.
**Decisión:** qué se eligió.
**Alternativas descartadas:** qué más se consideró y por qué no.
**Consecuencias:** qué se gana, qué se pierde, qué queda pendiente.
**Decidido por:** humano / Claude Code / Codex / Zoo Code.
```

---

## Decisiones

### 2026-01-01 — Un único contrato para todas las IAs en `AGENTS.md`
**Contexto:** Tres herramientas de IA (Claude Code, Codex, Zoo Code) trabajando sobre
el mismo repositorio, cada una con su propio archivo de configuración. Duplicar las
reglas en tres sitios garantiza que se desincronicen.
**Decisión:** `AGENTS.md` es la única fuente de verdad. `CLAUDE.md` y cualquier otro
archivo de configuración específico de herramienta solo apuntan hacia él y añaden lo
estrictamente propio de esa herramienta.
**Alternativas descartadas:** (a) Duplicar el contenido — se desincroniza. (b) Enlaces
simbólicos — no funcionan bien en Windows ni en todos los clones de Git.
**Consecuencias:** Una sola edición actualiza a las tres IAs. A cambio, cada
herramienta necesita un archivo puente de dos líneas.
**Decidido por:** humano

<!-- Añade decisiones nuevas ARRIBA de esta línea, más recientes primero. -->

---

## Decisiones revertidas

> No borres una decisión que dejó de valer. Muévela aquí con el motivo.
> Saber qué se intentó y falló vale tanto como saber qué funcionó.

| Fecha | Decisión | Por qué se revirtió | Reemplazada por |
|-------|----------|---------------------|-----------------|
| | | | |
