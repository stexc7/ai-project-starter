# 0001 — Registrar decisiones de arquitectura

**Estado:** Aceptado
**Fecha:** 2026-01-01
**Decisores:** equipo
**Tarea relacionada:** —

---

## Contexto

Un proyecto acumula decisiones. Algunas son evidentes al leer el código; otras no
dejan rastro. Seis meses después, nadie recuerda por qué se eligió una base de datos
sobre otra, ni qué alternativas se descartaron, ni qué restricción obligaba a hacerlo
así.

Con asistentes de IA trabajando sobre el repositorio, el problema se agrava. Una IA
que no conoce el contexto de una decisión previa:

- Propone soluciones que ya se descartaron por razones válidas.
- Rompe restricciones que no ve en el código.
- Contradice decisiones anteriores sin saberlo.

El código dice **qué** se hizo. No dice **por qué** ni **qué se rechazó**.

### Restricciones

- No queremos una herramienta externa que haya que mantener aparte del repositorio.
- El registro tiene que estar donde vive el código, para que se actualice con él.
- Tiene que ser legible por una IA sin procesamiento especial.

---

## Opciones consideradas

### Opción A — ADRs en Markdown dentro del repositorio

Archivos numerados en `docs/adr/`, versionados junto al código.

| ✅ A favor | ❌ En contra |
|-----------|-------------|
| Viven con el código, se revisan en el mismo PR | Requiere disciplina para escribirlos |
| Legibles por humanos y por IAs, sin herramientas | Se pueden quedar desactualizados |
| Cero infraestructura | |
| El historial de Git muestra su evolución | |

**Coste de implementación:** una plantilla y un README.
**Coste de revertirla después:** bajo.

### Opción B — Wiki o herramienta externa (Confluence, Notion)

| ✅ A favor | ❌ En contra |
|-----------|-------------|
| Mejor edición y búsqueda | Se desincroniza del código |
| Accesible para no técnicos | Las IAs no lo leen desde el repositorio |
| | Se convierte en un cementerio de páginas |
| | Requiere licencia y mantenimiento |

**Coste de implementación:** configuración de la herramienta.
**Coste de revertirla después:** medio — migrar el contenido.

### Opción C — No registrar nada, confiar en el historial de Git

| ✅ A favor | ❌ En contra |
|-----------|-------------|
| Cero esfuerzo | Los mensajes de commit no capturan alternativas descartadas |
| | Imposible de consultar por tema |
| | Una IA no puede reconstruir el porqué desde el diff |

---

## Decisión

**Elegimos la opción A: ADRs en Markdown dentro del repositorio.**

El criterio decisivo es la proximidad al código. Un registro que vive en otro sistema
se desactualiza porque nadie lo abre al hacer un cambio. Uno que está en `docs/adr/`
aparece en el mismo PR que la decisión que documenta.

Además, cualquier agente de IA puede leerlo sin integración ni credenciales, que es
un requisito central de este proyecto.

### Por qué no las otras

- **Opción B:** la desincronización con el código es un problema conocido de las
  wikis, y las IAs no acceden a ellas desde el repositorio.
- **Opción C:** el historial de Git registra el *qué* y el *cuándo*, pero no las
  alternativas descartadas — que es justo la parte que se pierde y que más cuesta
  reconstruir.

---

## Consecuencias

### Positivas

- El porqué de cada decisión estructural queda escrito y versionado.
- Las IAs pueden leer el contexto histórico antes de proponer cambios.
- Las alternativas descartadas quedan registradas: no se reabre el mismo debate.
- Un ADR se revisa en el PR, igual que el código.

### Negativas

- Escribir un ADR cuesta entre 20 y 40 minutos.
- Requiere disciplina: un registro que se abandona a medias es peor que ninguno,
  porque da falsa confianza.
- Riesgo de sobreuso: si se escribe un ADR para cada decisión trivial, nadie los lee.

### Qué se vuelve más difícil a partir de ahora

- Tomar una decisión estructural "sobre la marcha" sin dejarla escrita ya no es
  aceptable en una revisión.

### Qué hay que hacer como resultado

- [x] Crear `docs/adr/0000-adr-template.md`
- [x] Crear `docs/adr/README.md` con el índice y los criterios
- [x] Añadir `.prompts/adr.md` para generar ADRs con ayuda de IA
- [x] Referenciar el proceso desde `AGENTS.md` y `.agents/architect.md`
- [ ] Revisar en la primera retrospectiva si el umbral de "cuándo escribir uno"
      está bien calibrado

---

## Cómo revisar esta decisión

**Revisar si:**
- Pasan tres meses sin que se escriba ningún ADR pese a haber decisiones relevantes
  (señal de que el proceso no se sigue).
- Se escriben ADRs para decisiones triviales (señal de que el umbral está mal).

**Cómo mediríamos si fue acertada:**
- Que alguien nuevo, o una IA en una sesión nueva, pueda responder "¿por qué está
  hecho así?" leyendo solo el repositorio.

---

## Referencias

| Recurso | Enlace |
|---------|--------|
| Artículo original de Michael Nygard | https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions |
| adr.github.io | https://adr.github.io/ |
