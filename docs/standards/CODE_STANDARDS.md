# Estándares de código

> Aplican a humanos y a IAs por igual. Lo que el linter puede verificar, lo verifica
> el linter — lo que no, está aquí.

---

## Principio rector

**El código nuevo debe parecer escrito por quien escribió el que ya está.**

Antes de introducir un patrón nuevo, busca cómo se resuelve ese problema en otra
parte del repositorio. La consistencia vale más que tu preferencia personal.

## Nombres

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Variables y funciones | `camelCase` (o `snake_case` según el lenguaje) | `activeUsers` |
| Clases y tipos | `PascalCase` | `InvoiceService` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Booleanos | prefijo `is` / `has` / `can` / `should` | `isActive`, `canDelete` |
| Funciones | verbo + sustantivo | `calculateTotal()` |
| Archivos | según convención del framework | |

**Reglas:**
- Nombres en **inglés** en el código. Comentarios y docs en **español**.
- Usa los términos de `.ai/GLOSSARY.md`. Si el negocio dice "factura", la clase es
  `Invoice`, no `Bill` ni `Receipt`.
- Sin abreviaturas salvo las universales (`id`, `url`, `http`).
- Sin sufijos vacíos: `UserManager`, `DataHelper`, `ThingUtil` no dicen nada.
- El nombre debe hacer innecesario el comentario.

## Funciones

- **Una responsabilidad.** Si el nombre necesita un "y", son dos funciones.
- **Máximo ~50 líneas.** Más allá, casi siempre se puede dividir.
- **Máximo ~4 parámetros.** Más, agrupa en un objeto.
- **Máximo 3 niveles de anidamiento.** Usa cláusulas de guarda:

```
// ❌
function process(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.isPaid) {
        // lógica real, tres niveles adentro
      }
    }
  }
}

// ✅
function process(order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (!order.isPaid) return;
  // lógica real, al nivel principal
}
```

- **Devuelve pronto.** Un `return` temprano es más claro que un `else` largo.
- **Sin efectos secundarios ocultos.** Si una función llamada `getUser()` además
  escribe en la base de datos, el nombre miente.

## Comentarios

- Explica el **porqué**, nunca el **qué**.

```
// ❌ Incrementa el contador en uno
counter++;

// ✅ El proveedor cuenta desde 1, no desde 0. Sin este ajuste el
// último elemento de cada página se pierde.
counter++;
```

- Comenta lo raro: por qué esa librería, por qué ese rodeo, qué bug motivó esa línea.
- `TODO` sin ticket asociado está prohibido. `// TODO(TASK-042): ...`
- Código comentado se borra. Para eso está Git.

## Constantes

Sin números ni cadenas mágicas.

```
// ❌
if (user.role === 3) { ... }
setTimeout(fn, 86400000);

// ✅
if (user.role === Role.ADMIN) { ... }
setTimeout(fn, ONE_DAY_MS);
```

## Errores

- Nunca captures para silenciar. O manejas, o propagas.
- Nunca captures `Exception` genérica si sabes qué puede fallar.
- El mensaje de error debe ser **accionable** para quien lo lee.
- Incluye contexto: qué operación, sobre qué recurso, con qué entrada. Sin PII.

```
// ❌
throw new Error("Error");
try { ... } catch (e) {}

// ✅
throw new ValidationError(`El campo 'email' no tiene formato válido: ${maskedValue}`);
```

## Tipos

- Tipado estricto donde el lenguaje lo permita.
- **Prohibido `any`** (o equivalente) para salir del paso. Si no sabes el tipo,
  averígualo.
- Tipos en los límites: entrada de API, respuesta de API, esquema de BD.

## Imports

Orden: biblioteca estándar → dependencias externas → módulos internos → relativos.
Sin imports sin usar. Sin imports circulares.

## Estructura de archivos

- Un concepto principal por archivo.
- Archivos por debajo de ~300 líneas. Más allá, probablemente hay dos cosas dentro.
- El nombre del archivo coincide con lo que exporta.

## Formato

Lo decide el formateador automático (`.editorconfig` + el del lenguaje). No se discute
en las revisiones, no se ajusta a mano.

## Prohibido

- `console.log` / `print()` / `debugger` en código que se mergea.
- Código muerto o comentado.
- Copiar y pegar. A la tercera repetición, extrae.
- Desactivar reglas del linter sin comentario que lo justifique.
- Mezclar cambios de formato con cambios funcionales en el mismo commit.
