# Definition of Done

> **Una tarea no está hecha porque el código funcione.** Está hecha cuando cumple
> todo lo de esta lista.
>
> Esta es la verificación final antes de decir "listo". Aplica a humanos y a IAs.

---

## ✅ Funcionalidad

- [ ] Todos los criterios de aceptación de `.ai/CURRENT_TASK.md` se cumplen
- [ ] Probado a mano el camino feliz
- [ ] Probados los casos de error principales
- [ ] Los estados vacío / cargando / error están contemplados (si hay UI)
- [ ] No rompe nada que funcionaba antes

## ✅ Código

- [ ] Cumple `docs/standards/CODE_STANDARDS.md`
- [ ] Sigue los patrones que ya existen en el repositorio
- [ ] Sin `console.log`, `print()`, `debugger`
- [ ] Sin código comentado ni código muerto
- [ ] Sin `TODO` sin ticket asociado
- [ ] Sin reglas del linter desactivadas sin justificación escrita
- [ ] Sin duplicación introducida
- [ ] Linter y comprobación de tipos en verde

## ✅ Tests

- [ ] Tests nuevos para el código nuevo
- [ ] Si era un bug: hay un test que fallaba antes y pasa ahora
- [ ] Camino feliz + al menos dos casos límite cubiertos
- [ ] Suite completa en verde en local
- [ ] Ningún test borrado ni marcado como *skip* para desbloquear
- [ ] Comprobado que los tests valen: romper una línea del código nuevo hace fallar algún test
- [ ] Cobertura de las líneas modificadas ≥ el umbral de `.ai/TESTING.md`

## ✅ Seguridad

- [ ] Sin secretos en el código, la configuración ni los logs
- [ ] Entrada de usuario validada **en el servidor**
- [ ] Autorización verificada a nivel de objeto (no solo "hay sesión")
- [ ] Sin datos personales ni sensibles en los logs
- [ ] Consultas parametrizadas
- [ ] Dependencias nuevas sin CVEs conocidos
- [ ] `docs/standards/SECURITY_CHECKLIST.md` repasado si el cambio toca datos o auth

## ✅ Rendimiento

- [ ] Sin consultas N+1 introducidas
- [ ] Índices en las columnas por las que se filtra
- [ ] Paginación en cualquier listado que pueda crecer
- [ ] Probado con volumen de datos realista, no con tres filas

## ✅ Documentación

- [ ] `.ai/ARCHITECTURE.md` actualizado si cambió la estructura
- [ ] `.ai/CHANGELOG.md` actualizado si el cambio es visible para el usuario
- [ ] ADR escrito si se tomó una decisión estructural
- [ ] `.ai/DECISIONS.md` actualizado si fue una decisión menor
- [ ] README o guías actualizadas si cambió la forma de usar algo
- [ ] Comentarios donde el código no es obvio

## ✅ Contexto de IA

- [ ] `.ai/CURRENT_TASK.md` actualizado o reseteado
- [ ] `.ai/TASKS.md`: tarea movida a *Hecho*; tareas detectadas al paso anotadas
- [ ] `.ai/AI_MEMORY.md`: entrada con lo aprendido que la próxima sesión necesita
- [ ] `.ai/BUGS.md` actualizado si se encontró o cerró un bug
- [ ] `.ai/TESTING.md` actualizado si cambió la cobertura

## ✅ Git

- [ ] Commits siguen `docs/standards/COMMIT_CONVENTIONS.md`
- [ ] Historial limpio (sin commits de `wip`)
- [ ] Rama actualizada con `main`, conflictos resueltos
- [ ] Sin archivos que no pertenecen al cambio
- [ ] PR abierto con la plantilla, checklist rellenado con la verdad

## ✅ Revisión

- [ ] CI en verde
- [ ] Al menos una aprobación
- [ ] Todos los comentarios bloqueantes resueltos
- [ ] Sin conversaciones abiertas sin responder

---

## Regla del PR bloqueado

Si no puedes marcar una casilla:

1. **No la marques igual.**
2. Explica en el PR por qué no está.
3. Si es algo que se hará después, crea la tarea en `.ai/TASKS.md` y enlázala.
4. El revisor decide si es aceptable.

Un *Definition of Done* que se rellena a medias no sirve para nada.

---

## Para agentes de IA

Antes de responder "he terminado", recorre esta lista de arriba abajo y reporta
**fielmente**:

- Qué está hecho.
- Qué **no** está hecho, y por qué.
- El resultado real de los tests, pegado — no resumido, no interpretado.

Reportar una tarea como completa sin haber verificado es peor que reportarla
incompleta.
