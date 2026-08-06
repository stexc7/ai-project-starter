# Postmortem — <Título del incidente>

> **Sin culpables.** El objetivo es entender qué falló en el **sistema**, no quién
> se equivocó. Si la gente teme el postmortem, dejará de reportar incidentes y
> perderás la información que más necesitas.
>
> Copia a `docs/process/postmortems/AAAA-MM-DD-titulo.md`.

---

## Resumen

**Fecha:** `<AAAA-MM-DD>`
**Duración:** `<HH:MM>` — desde el inicio hasta la resolución completa
**Severidad:** `S0` (caída total) / `S1` (funcionalidad crítica) / `S2` (degradación)
**Autor:** `<...>`

**Qué pasó, en tres frases:**

<Para alguien que no estuvo. Sin jerga.>

## Impacto

| Aspecto | Detalle |
|---------|---------|
| Usuarios afectados | `<número o %>` |
| Funcionalidad afectada | |
| Datos perdidos o corrompidos | |
| Impacto económico estimado | |
| Impacto en reputación | |

## Cronología

> Todas las horas en la misma zona horaria. Sé preciso: los huecos revelan
> problemas de detección.

| Hora | Qué pasó |
|------|----------|
| 10:15 | Se despliega la versión 1.2.0 |
| 10:23 | Empiezan a llegar errores 500 en `/api/invoices` |
| 10:41 | Un usuario reporta el problema por soporte |
| 10:44 | El equipo se entera |
| 10:52 | Se identifica el despliegue como causa probable |
| 11:03 | Se revierte a 1.1.4 |
| 11:07 | Servicio restablecido |
| 11:30 | Causa raíz confirmada |

**Tiempo de detección:** `<de inicio a que el equipo se entera>`
**Tiempo de mitigación:** `<de que se entera a servicio restablecido>`

> Si el tiempo de detección es alto, tu problema está en la monitorización, no en
> el bug.

## Causa raíz

> Usa los **5 porqués**. No pares en el primer nivel.

**Síntoma:** los usuarios veían un error 500 al listar facturas.

1. **¿Por qué?** El endpoint lanzaba una excepción.
2. **¿Por qué?** Accedía a un campo que llegaba nulo.
3. **¿Por qué?** La migración añadió la columna sin valor por defecto.
4. **¿Por qué?** La migración se probó sobre una BD vacía, no con datos reales.
5. **¿Por qué?** No hay entorno de staging con un volcado representativo.

**Causa raíz:** `<la del último nivel — casi siempre es un problema de proceso o de
herramientas, no de una persona>`

## Qué funcionó bien

> Importante. Refuerza lo que ya está bien.

- 

## Qué no funcionó

- 

## Dónde tuvimos suerte

> Lo que podría haber ido mucho peor. Señala riesgos que aún no se han materializado.

- 

## Acciones correctivas

| # | Acción | Tipo | Responsable | Fecha | Estado |
|---|--------|------|-------------|-------|--------|
| 1 | | Prevención | | | |
| 2 | | Detección | | | |
| 3 | | Mitigación | | | |

**Tipos:**
- **Prevención** — que no vuelva a pasar
- **Detección** — que nos enteremos antes
- **Mitigación** — que duela menos si pasa

> Cada acción con responsable y fecha, o no es una acción: es un deseo.
> Prioriza **detección**: no puedes prevenir todo, pero sí enterarte rápido.

## Lecciones para las IAs

- [ ] ¿Hay que añadir una regla a `.ai/RULES.md`?
- [ ] ¿Hay que añadir una comprobación a algún checklist?
- [ ] ¿Hay que registrar algo en `.ai/AI_MEMORY.md`?
- [ ] ¿Falta un runbook en `docs/runbooks/`?

## Enlaces

| Recurso | URL |
|---------|-----|
| Bug en `.ai/BUGS.md` | |
| PR del arreglo | |
| Logs / panel del incidente | |
| Hilo de comunicación | |
