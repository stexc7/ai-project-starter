# frontend/

Código de cliente: interfaz, estado y consumo de la API.

> Carpeta vacía a propósito. Se llena al elegir el stack (`TASK-002`).
> Si tu proyecto no tiene frontend, borra esta carpeta.

---

## Estructura sugerida

```
src/
  components/   Componentes de presentación. Reciben datos por props.
                Sin peticiones, sin lógica de negocio.

  features/     Una carpeta por funcionalidad. Cohesión alta:
                dentro va todo lo de esa funcionalidad.

  lib/          Utilidades compartidas.

  api/          Cliente HTTP y tipos de la API.

  hooks/        Lógica reutilizable de estado (si el framework lo usa).

  styles/       Estilos globales y tokens de diseño.
```

## Reglas

- El frontend **nunca** conoce el esquema de la base de datos. Solo la API.
- La lógica de negocio vive en el backend. Aquí se consume el resultado.
- Toda pantalla implementa **tres estados**: cargando, error y vacío.
- Nada de secretos: todo lo que llega al navegador es público.

## Antes de escribir código aquí

Lee [`.agents/frontend.md`](../.agents/frontend.md) y
[`.ai/ARCHITECTURE.md`](../.ai/ARCHITECTURE.md) → *Contratos de API*.
