# BUGS.md — Registro de bugs

> Codex lee este archivo como fuente principal de trabajo.
>
> Severidad: `S0` producción caída · `S1` funcionalidad rota sin rodeo ·
> `S2` rota con rodeo · `S3` cosmético.

---

## 🔥 Abiertos

### BUG-001 — `<título>`

| Campo | Valor |
|-------|-------|
| **Severidad** | S? |
| **Estado** | abierto / investigando / esperando · |
| **Reportado** | AAAA-MM-DD |
| **Entorno** | prod / staging / local |
| **Asignado** | |

**Qué pasa:**
<Comportamiento observado.>

**Qué debería pasar:**
<Comportamiento esperado.>

**Reproducir:**
1. 
2. 
3. 

**Evidencia:**
```
<Logs, traza de la excepción, captura. Sin datos sensibles.>
```

**Causa raíz:**
<Rellenar al encontrarla. No al sospecharla.>

**Rodeo temporal:**
<Si existe.>

---

## ✅ Cerrados

| ID | Título | Severidad | Causa raíz | Fix (PR) | Test que lo cubre |
|----|--------|-----------|------------|----------|-------------------|
| | | | | | |

---

## Reglas para corregir bugs

1. **Reproduce primero.** Un bug que no sabes reproducir no lo sabes arreglar.
2. **Escribe el test antes del fix.** Debe fallar. Si pasa, no reprodujiste el bug.
3. **Arregla la causa, no el síntoma.** Un `try/catch` alrededor no es un fix.
4. **Un bug, un commit**, con formato `fix(scope): descripción` y referencia al ID.
5. **Busca hermanos.** Si el bug vino de un patrón equivocado, ese patrón está en
   más sitios. Anótalos en `TASKS.md`.
6. **Registra la causa raíz aquí** al cerrar. Es lo que evita que vuelva.

## Patrones recurrentes

> Cuando el mismo tipo de bug aparece tres veces, es un problema de diseño, no tres bugs.

| Patrón | Veces visto | Causa de fondo | Acción estructural |
|--------|-------------|----------------|--------------------|
| | | | |
