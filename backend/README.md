# backend/

Código de servidor: dominio, casos de uso, API y persistencia.

> Carpeta vacía a propósito. Se llena al elegir el stack (`TASK-002`).
> Si tu proyecto no tiene backend, borra esta carpeta.

---

## Estructura sugerida

Arquitectura por capas con la **dependencia apuntando hacia dentro**:

```
src/
  domain/          Entidades y reglas de negocio.
                   NO importa nada de fuera. Ni ORM, ni HTTP, ni ficheros.

  application/     Casos de uso. Orquesta el dominio.
                   Puede importar domain. Nada más.

  infrastructure/  Base de datos, HTTP, colas, ficheros, servicios externos.
                   Implementa las interfaces que definen domain/application.

  interfaces/      Controladores, DTOs, validación de entrada, mapeo.
```

Adapta los nombres a la convención de tu framework. Lo que **no** se adapta es la
regla de dependencia.

## Regla de dependencia

```
interfaces ──▶ application ──▶ domain ◀── infrastructure
```

- `domain` no conoce a nadie.
- `application` solo conoce `domain`.
- `infrastructure` implementa lo que `domain`/`application` declaran.

Romper esta regla requiere un ADR que lo justifique.

## Antes de escribir código aquí

Lee [`.agents/backend.md`](../.agents/backend.md) y
[`docs/standards/API_DESIGN.md`](../docs/standards/API_DESIGN.md).
