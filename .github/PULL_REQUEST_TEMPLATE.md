# <Título del PR>

**Tarea:** `TASK-000` · **Tipo:** feat / fix / refactor / docs / chore

---

## Por qué

<Qué problema resuelve. Empieza por aquí: es lo primero que necesita saber el revisor.>

## Qué cambia

<Qué es distinto de forma observable. Si un usuario no notaría nada, dilo.>

- 

## Cómo probarlo

<Pasos concretos para que el revisor lo verifique.>

1. 
2. 

## Dónde quiero atención

<Sé honesto. "La lógica de reintentos del paso 3 es la parte que menos me convence."
Un PR que dice "todo bien" recibe una revisión superficial.>

## Decisiones tomadas

<Si elegiste entre varias opciones, di cuál y por qué. Si merece ADR, enlázalo.>

---

## Definition of Done

> Marca solo lo que **es cierto**. Lo que no esté, explícalo debajo.

**Funcionalidad**
- [ ] Cumple todos los criterios de aceptación
- [ ] Probado a mano el camino feliz
- [ ] Probados los casos de error
- [ ] No rompe nada existente

**Código**
- [ ] Cumple `docs/standards/CODE_STANDARDS.md`
- [ ] Sigue los patrones existentes del repositorio
- [ ] Sin `console.log` / `print()` / `debugger`
- [ ] Sin código comentado ni `TODO` sin ticket
- [ ] Linter y tipos en verde

**Tests**
- [ ] Tests nuevos para el código nuevo
- [ ] Si es un bug: hay test que fallaba antes y pasa ahora
- [ ] Suite completa en verde en local
- [ ] Ningún test borrado ni en *skip*
- [ ] Comprobado que los tests fallan si rompo el código nuevo

**Seguridad**
- [ ] Sin secretos en código, config ni logs
- [ ] Entrada validada en el servidor
- [ ] Autorización verificada a nivel de objeto
- [ ] Sin PII en los logs

**Documentación**
- [ ] `.ai/ARCHITECTURE.md` actualizado si cambió la estructura
- [ ] `.ai/CHANGELOG.md` actualizado si es visible para el usuario
- [ ] ADR escrito si hubo decisión estructural

**Contexto de IA**
- [ ] `.ai/CURRENT_TASK.md` actualizado
- [ ] `.ai/TASKS.md` actualizado
- [ ] `.ai/AI_MEMORY.md` con lo aprendido

### Lo que NO está hecho

<Casilla sin marcar = explicación aquí. Si hay trabajo pendiente, enlaza la tarea.>

- 

---

## Extras

**¿Cambios incompatibles?** No / Sí → <qué rompe y cómo migrar>

**¿Migraciones de BD?** No / Sí → <reversible: sí/no · probada con datos reales: sí/no>

**¿Variables de entorno nuevas?** No / Sí → <cuáles, y creadas ya en los entornos>

**¿Dependencias nuevas?** No / Sí → <cuál, por qué, registrada en `.ai/DECISIONS.md`>

**Capturas** (si hay cambios de UI — sin datos reales de clientes):

<!-- imagen -->

---

## Para el revisor

Checklist completo en `docs/standards/CODE_REVIEW_CHECKLIST.md`.

Empieza por: ¿autorización por objeto? ¿los tests fallan si rompo el código?
¿hay N+1? ¿qué pasa con entrada vacía?
