# tests/

Tests que **cruzan capas**: end-to-end, integración amplia, pruebas de carga.

> Los tests unitarios viven junto al código que prueban (`backend/src/.../*.test.*`),
> no aquí. Esta carpeta es solo para lo que no pertenece a un módulo concreto.

---

## Estructura sugerida

```
tests/
  e2e/          Flujos completos desde la interfaz de usuario
  integration/  Varios módulos o servicios juntos
  load/         Pruebas de carga y rendimiento
  fixtures/     Datos de prueba compartidos
  helpers/      Utilidades comunes a los tests
```

## Qué va en cada sitio

| Tipo | Dónde | Cuántos |
|------|-------|---------|
| Unitario | Junto al código | Muchos |
| Integración de un módulo | Junto al código | Bastantes |
| Integración entre servicios | `tests/integration/` | Algunos |
| E2E | `tests/e2e/` | Pocos |

## Qué probar en E2E

Solo los caminos que, si se rompen, el negocio para:

- Registro e inicio de sesión
- El flujo principal de valor del producto
- Pago o conversión

No pruebes cada botón en E2E. Es caro y frágil.

## Reglas

- Cada test crea sus propios datos y los limpia.
- Ningún test depende de otro ni del orden de ejecución.
- Nada de `sleep()`. Esperas explícitas sobre condiciones.
- **Nunca** datos reales de producción, ni siquiera "anonimizados a ojo".

## Antes de escribir tests

Lee [`docs/standards/TESTING_STRATEGY.md`](../docs/standards/TESTING_STRATEGY.md)
y [`.agents/qa.md`](../.agents/qa.md).

El estado actual de la cobertura está en [`.ai/TESTING.md`](../.ai/TESTING.md).
