# GLOSSARY.md — Lenguaje del dominio

> El vocabulario compartido entre negocio, código e IA. Si el negocio dice
> "expediente" y el código dice `Record`, alguien va a construir lo que no es.
>
> **Regla:** el término del glosario es el que se usa en nombres de clases, tablas,
> endpoints y documentación. Sin sinónimos.

---

## Términos

| Término (negocio) | En el código | Definición | No confundir con |
|-------------------|--------------|------------|------------------|
| | | | |

### Ejemplo de cómo rellenarlo

| Término | En el código | Definición | No confundir con |
|---------|--------------|------------|------------------|
| Cliente | `Customer` | Persona o empresa que ha comprado al menos una vez. | *Lead*: contacto que aún no ha comprado. |
| Pedido | `Order` | Solicitud de compra confirmada y pagada. | *Carrito* (`Cart`): aún sin confirmar. |

---

## Abreviaturas

| Sigla | Significa | Contexto |
|-------|-----------|----------|
| | | |

## Términos prohibidos

> Palabras ambiguas que causaron confusión y ya no se usan.

| Término | Por qué se prohibió | Usar en su lugar |
|---------|---------------------|------------------|
| | | |

## Estados y su ciclo de vida

> Los estados de las entidades principales. Muy útil para que una IA no invente
> transiciones imposibles.

### `<Entidad>`

```
borrador ──▶ enviado ──▶ aprobado ──▶ cerrado
                 │
                 └──▶ rechazado
```

| Estado | Significa | Transiciones válidas desde aquí |
|--------|-----------|---------------------------------|
| | | |
