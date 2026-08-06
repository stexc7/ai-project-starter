# Checklist de revisión de código

> Para el revisor. El objetivo no es aprobar: es encontrar lo que el autor no vio.

---

## Antes de empezar

- [ ] ¿Entiendo qué debía hacer este cambio? (lee la descripción del PR)
- [ ] ¿El PR es de un tamaño revisable? Si supera ~400 líneas, pide dividirlo

## 1. Intención

- [ ] ¿Hace lo que dice que hace?
- [ ] ¿Hace **además** cosas que nadie pidió?
- [ ] ¿Cumple los criterios de aceptación de la tarea?
- [ ] ¿Hay una forma sustancialmente más simple de conseguir lo mismo?

## 2. Correctitud

- [ ] ¿Qué pasa con `null`, `undefined`, `""`, `[]`, `{}`?
- [ ] ¿Qué pasa con 0, 1, negativo, el máximo, el máximo + 1?
- [ ] ¿Qué pasa con una entrada enorme?
- [ ] ¿Qué pasa si falla a mitad? ¿Queda estado inconsistente?
- [ ] ¿Qué pasa si se ejecuta dos veces? ¿Es idempotente donde debe serlo?
- [ ] ¿Qué pasa con dos peticiones concurrentes sobre el mismo recurso?
- [ ] ¿Los `if` cubren todos los casos? ¿Falta un `else`?
- [ ] ¿Hay off-by-one en índices, rangos o paginación?

## 3. Errores

- [ ] ¿Se capturan errores solo para silenciarlos?
- [ ] ¿Los mensajes de error son accionables para quien los lee?
- [ ] ¿Se propaga contexto suficiente para depurar?
- [ ] ¿Se loguean datos que no deberían loguearse?

## 4. Tests

- [ ] ¿Existen tests para el código nuevo?
- [ ] ¿Prueban comportamiento observable, o solo repiten la implementación?
- [ ] **Prueba de fuego:** si comento una línea del código nuevo, ¿falla algún test?
- [ ] ¿Cubren casos límite, no solo el camino feliz?
- [ ] ¿Se modificó algún test existente? ¿Por qué? ¿Se adaptó el test al bug?
- [ ] ¿Se borró o se hizo *skip* de algún test?

## 5. Seguridad

- [ ] **Autorización por objeto**: ¿verifica que el recurso es de este usuario,
      o solo que hay sesión?
- [ ] ¿Entrada de usuario validada en el servidor?
- [ ] ¿Consultas parametrizadas? ¿Cero concatenación de SQL?
- [ ] ¿HTML escapado antes de renderizar?
- [ ] ¿Secretos fuera del código y de los logs?
- [ ] ¿Se exponen campos internos en la respuesta de la API?
- [ ] ¿Hace falta límite de tasa en este endpoint?
- [ ] ¿Dependencia nueva? ¿Justificada? ¿Con CVEs?

## 6. Rendimiento

- [ ] ¿Hay una consulta dentro de un bucle? (N+1)
- [ ] ¿Hay índice en las columnas por las que se filtra u ordena?
- [ ] ¿Los listados están paginados?
- [ ] ¿Se carga en memoria algo que puede crecer sin límite?
- [ ] ¿Se ha probado con volumen realista?

## 7. Mantenibilidad

- [ ] ¿Los nombres dicen la verdad sobre lo que hacen?
- [ ] ¿Se puede entender sin preguntarle al autor?
- [ ] ¿Sigue los patrones que ya existen en el repositorio?
- [ ] ¿Hay duplicación introducida?
- [ ] ¿Hay abstracciones creadas para un solo uso?
- [ ] ¿Las funciones caben en la pantalla?
- [ ] ¿Hay más de 3 niveles de anidamiento?

## 8. Documentación

- [ ] ¿Se actualizó la documentación afectada, en **este mismo** PR?
- [ ] ¿Se registró la decisión si tuvo consecuencias?
- [ ] ¿`.ai/CHANGELOG.md` si el cambio es visible para el usuario?
- [ ] ¿Los comentarios explican el porqué, no el qué?

## 9. Higiene

- [ ] ¿Sin `console.log`, `print()`, `debugger`?
- [ ] ¿Sin código comentado?
- [ ] ¿Sin `TODO` sin ticket?
- [ ] ¿Sin archivos que no pertenecen (`.env`, temporales, `node_modules`)?
- [ ] ¿Commits limpios y con formato correcto?
- [ ] ¿Se mezclaron cambios de formato con cambios funcionales?

## 10. Definition of Done

- [ ] `docs/standards/DEFINITION_OF_DONE.md` repasado y honesto

---

## Cómo clasificar cada hallazgo

| Nivel | Qué es | ¿Bloquea? |
|-------|--------|-----------|
| 🔴 **Bloqueante** | Bug, fallo de seguridad, pérdida de datos, rompe algo | Sí |
| 🟠 **Importante** | Deuda cara, falta de tests en camino crítico | Sí, salvo acuerdo |
| 🟡 **Sugerencia** | Mejorable, no urgente | No |
| 🔵 **Nota** | Pregunta, contexto, aprendizaje | No |

**Regla:** si marcas algo como bloqueante, debes poder describir el escenario
concreto de fallo — entradas o estado → resultado incorrecto. Si no puedes,
no es bloqueante.

## Cómo escribir el comentario

**Mal:** "Esto está mal."
**Mal:** "¿En serio?"
**Mal:** "Yo lo habría hecho con un map."

**Bien:** "🔴 `report.ts:42` — si `items` llega vacío, `items[0]` lanza. Se dispara
desde `/report` cuando el mes no tiene registros. ¿Guarda temprana, o devolvemos
un informe vacío?"

Qué falla · cuándo · una vía de salida. Sin sarcasmo.

## Y también

Menciona lo que está **bien** resuelto. Una revisión que solo señala fallos entrena
a la gente a temer las revisiones, no a mejorar el código.
