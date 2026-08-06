# Estrategia de pruebas

> Qué tipo de test escribir, cuándo, y hasta dónde llegar.
> El estado actual de la cobertura está en `.ai/TESTING.md`.

---

## La pirámide

```
        ╱  E2E  ╲          Pocos. Lentos. Frágiles. Solo caminos críticos.
      ╱───────────╲
    ╱ Integración  ╲       Bastantes. Módulos hablando entre sí.
  ╱─────────────────╲
╱     Unitarios       ╲    Muchos. Rápidos. Aislados.
───────────────────────
```

| Tipo | Proporción | Qué prueba | Velocidad |
|------|-----------|------------|-----------|
| Unitario | ~70 % | Una función o clase, aislada | ms |
| Integración | ~20 % | Varios componentes juntos, con BD real | cientos de ms |
| E2E | ~10 % | Flujo completo desde la UI | segundos |

Si tu pirámide está invertida (muchos E2E, pocos unitarios), la suite tardará
demasiado y fallará por razones equivocadas.

## Qué probar en cada nivel

### Unitarios
- Lógica de negocio pura
- Cálculos, transformaciones, validaciones
- Casos límite y manejo de errores
- **Sin** base de datos, sin red, sin sistema de archivos

### Integración
- Endpoints de API completos (petición → respuesta)
- Repositorios contra base de datos real (no *mock*)
- Transacciones y *rollback*
- Autenticación y autorización

### E2E
Solo los caminos que, si se rompen, el negocio para:
- Registro e inicio de sesión
- El flujo principal de valor del producto
- Pago o conversión

No pruebes cada botón en E2E. Es caro y frágil.

## Cuándo se escribe cada test

| Situación | Test obligatorio |
|-----------|------------------|
| Función nueva | Unitario |
| Endpoint nuevo | Integración |
| Bug corregido | Test de regresión que fallaba antes |
| Refactor | Ninguno nuevo — los existentes deben pasar sin tocarlos |
| Flujo crítico nuevo | E2E |

## Anatomía de un buen test

```
✅ Falla si el código está mal
✅ Pasa de forma consistente si el código está bien
✅ Dice QUÉ falló, no solo "esperaba true"
✅ Es independiente: sin orden implícito, sin estado compartido
✅ Es rápido
✅ Prueba comportamiento observable, no detalles internos
```

### Nombres

```
❌ test_1, testGetUser, it("works")
✅ "devuelve 403 cuando el usuario pide una factura de otro usuario"
✅ "redondea al céntimo más cercano cuando el IVA da decimales"
```

El nombre debe decirte qué se rompió sin abrir el test.

### Estructura: AAA

```
// Arrange — preparar
const invoice = buildInvoice({ total: 100, taxRate: 0.21 });

// Act — ejecutar
const result = calculateTax(invoice);

// Assert — comprobar
expect(result).toBe(21.00);
```

## Qué NO probar

- Código de terceros (asume que la librería funciona).
- Getters y setters triviales.
- Configuración estática.
- Detalles de implementación privados. Prueba a través de la interfaz pública:
  si pruebas los internos, cada refactor rompe los tests.

## Mocks

**Mockea:** servicios externos, tiempo, aleatoriedad, sistema de archivos, red.
**No mockees:** tu propia base de datos en tests de integración, tu propia lógica.

Regla: si mockeas tanto que el test no prueba nada real, borra el test.

## Datos de prueba

- Usa *builders* o *factories*, no literales copiados.
- Cada test crea sus propios datos y los limpia.
- Ningún test depende de datos que dejó otro.
- **Nunca** datos reales de producción. Ni anonimizados "a ojo".

## Tests frágiles (*flaky*)

Un test que falla de forma intermitente **entrena al equipo a ignorar el rojo**.
Eso es peor que no tener el test.

Causas habituales:
- `sleep()` en lugar de esperar una condición
- Dependencia del orden de ejecución
- Estado compartido entre tests
- Dependencia de la fecha/hora actual
- Dependencia de un servicio externo real

Un test frágil se arregla o se elimina. No se ignora. Regístralo en `.ai/TESTING.md`.

## Cobertura

- **Umbral:** define uno en `.ai/TESTING.md`. Aplícalo a las **líneas modificadas**,
  no al total del proyecto.
- La cobertura mide qué se ejecutó, **no** qué se verificó. 100 % de cobertura con
  assertions vacías es 0 % de garantía.
- Prioriza cubrir lo que **duele** si se rompe, no lo que sube el porcentaje.

## Prueba de fuego

Rompe una línea del código de producción a propósito.

- ¿Falla algún test? ✅ Tus tests sirven.
- ¿No falla ninguno? ❌ Tus tests no prueban nada. Reescríbelos.

Hazlo de vez en cuando. Es la única forma de saber si la suite vale.

## Prohibido

- Borrar un test para que el build pase.
- Marcar un test como *skip* sin ticket y sin fecha.
- Cambiar lo que un test espera para adaptarlo a un bug.
- Commitear con la suite en rojo.
