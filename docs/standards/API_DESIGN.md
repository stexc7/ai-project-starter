# Diseño de API

Convenciones para APIs REST. Si el proyecto usa GraphQL o gRPC, reemplaza este
archivo por el equivalente y regístralo con un ADR.

---

## URLs

```
✅ GET    /api/v1/invoices
✅ GET    /api/v1/invoices/1042
✅ POST   /api/v1/invoices
✅ PATCH  /api/v1/invoices/1042
✅ DELETE /api/v1/invoices/1042
✅ GET    /api/v1/customers/77/invoices

❌ /api/getInvoices          → el verbo va en el método HTTP
❌ /api/invoice              → los recursos van en plural
❌ /api/v1/invoices/1042/delete → DELETE existe para eso
```

**Reglas:**
- Sustantivos en plural, `kebab-case` si hay varias palabras.
- El verbo lo pone el método HTTP.
- Anidamiento máximo de un nivel.
- Versión en la ruta: `/api/v1/`.

## Métodos

| Método | Para qué | ¿Idempotente? |
|--------|----------|---------------|
| `GET` | Leer. **Nunca** modifica | Sí |
| `POST` | Crear | No |
| `PUT` | Reemplazar completo | Sí |
| `PATCH` | Modificar parcial | Sí |
| `DELETE` | Eliminar | Sí |

## Códigos de estado

| Código | Cuándo |
|--------|--------|
| `200` | OK con cuerpo |
| `201` | Creado (incluye cabecera `Location`) |
| `204` | OK sin cuerpo (típico en `DELETE`) |
| `400` | Petición mal formada o validación fallida |
| `401` | No autenticado (no sabemos quién eres) |
| `403` | Autenticado pero sin permiso (sabemos quién eres, y no puedes) |
| `404` | No existe **o no es tuyo** |
| `409` | Conflicto (duplicado, estado incompatible) |
| `422` | Semánticamente incorrecto |
| `429` | Límite de tasa superado |
| `500` | Error del servidor |

> **Nota de seguridad:** ante un recurso que existe pero no es del usuario, devolver
> `404` en lugar de `403` evita filtrar qué IDs existen.

## Respuestas

### Éxito, recurso único

```json
{
  "id": 1042,
  "number": "F-2026-0042",
  "total": 121.00,
  "currency": "EUR",
  "issuedAt": "2026-03-14T10:30:00Z"
}
```

### Éxito, colección — siempre paginada

```json
{
  "items": [ ... ],
  "page": 1,
  "pageSize": 20,
  "total": 137,
  "hasNext": true
}
```

Nunca devuelvas un array desnudo: no puedes añadir metadatos después sin romper
compatibilidad.

### Error — formato único para toda la API

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La petición contiene campos inválidos",
    "details": [
      { "field": "email", "message": "Formato de correo no válido" },
      { "field": "total", "message": "Debe ser mayor que 0" }
    ],
    "traceId": "a3f9c2e1"
  }
}
```

- `code`: identificador estable, para que el cliente pueda reaccionar.
- `message`: legible por una persona, accionable.
- `traceId`: para correlacionar con los logs del servidor.
- **Nunca** trazas de pila en producción.

## Convenciones de datos

| Dato | Formato |
|------|---------|
| Fechas | ISO 8601 en UTC: `2026-03-14T10:30:00Z` |
| Dinero | Decimal exacto + código de moneda ISO 4217. **Nunca** coma flotante |
| Booleanos | `true` / `false`. Nunca `"yes"`, `1`, `"S"` |
| Nulos | `null` explícito, no cadena vacía |
| Nombres de campo | `camelCase`, consistente en toda la API |
| Enums | Cadenas en `UPPER_SNAKE_CASE` |

## Paginación, filtrado, ordenación

```
GET /api/v1/invoices?page=2&pageSize=20&sort=-issuedAt&status=PAID&from=2026-01-01
```

- `pageSize` con un máximo (p. ej. 100). Si piden más, se limita en silencio o se
  devuelve `400`. Decídelo y documéntalo.
- `sort`: prefijo `-` para descendente.
- Filtros por nombre de campo.

## Autenticación

- `Authorization: Bearer <token>` en la cabecera.
- **Nunca** tokens en la URL: acaban en los logs del servidor y del proxy.
- Todo endpoint es privado por defecto; los públicos se marcan explícitamente.

## Idempotencia

Para operaciones que crean o mueven dinero:

```
POST /api/v1/payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

Repetir la petición con la misma clave devuelve el resultado original, sin duplicar.

## Compatibilidad

**Cambios seguros (no rompen):**
- Añadir un campo opcional a la respuesta
- Añadir un endpoint
- Añadir un parámetro opcional

**Cambios que rompen (requieren versión nueva):**
- Eliminar o renombrar un campo
- Cambiar el tipo de un campo
- Hacer obligatorio un parámetro que era opcional
- Cambiar el significado de un valor

Al deprecar: cabecera `Deprecation`, aviso en la documentación, y un plazo de migración
anunciado antes de retirar nada.

## Checklist de endpoint nuevo

- [ ] URL en plural, sin verbos
- [ ] Método HTTP correcto
- [ ] Entrada validada en el servidor
- [ ] Autenticación verificada
- [ ] **Autorización por objeto** verificada
- [ ] Códigos de estado correctos
- [ ] Errores en el formato estándar
- [ ] Paginación si el resultado puede crecer
- [ ] Límite de tasa si es público o caro
- [ ] Idempotencia si crea recursos o mueve dinero
- [ ] Sin datos internos ni PII de más en la respuesta
- [ ] Documentado en `.ai/ARCHITECTURE.md` → *Contratos de API*
- [ ] Test de integración: éxito + al menos dos errores + permisos
