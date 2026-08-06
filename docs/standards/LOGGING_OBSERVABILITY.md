# Logging y observabilidad

> Un sistema que no puedes observar es un sistema que no puedes operar.

---

## Niveles

| Nivel | Cuándo | ¿Alerta? |
|-------|--------|----------|
| `ERROR` | Algo falló y afecta al usuario. Requiere acción | Sí |
| `WARN` | Algo raro pero recuperable. Puede degenerar | Revisar |
| `INFO` | Eventos de negocio relevantes | No |
| `DEBUG` | Detalle para depurar. **Desactivado en producción** | No |

**Regla:** si un `ERROR` no requiere que alguien haga algo, no es un `ERROR`.
Un log de errores lleno de ruido es un log que nadie lee.

## Logs estructurados

Siempre en formato estructurado (JSON), nunca cadenas concatenadas.

```json
{
  "timestamp": "2026-03-14T10:30:00.123Z",
  "level": "ERROR",
  "message": "No se pudo procesar el pago",
  "traceId": "a3f9c2e1-4b8d-4f1a-9e2c-7d5b3a1f8e6c",
  "userId": 1042,
  "operation": "payment.process",
  "orderId": 5501,
  "errorCode": "GATEWAY_TIMEOUT",
  "durationMs": 30012
}
```

```
❌ log(`Error processing payment for user ${email}: ${JSON.stringify(request)}`)
✅ log.error("No se pudo procesar el pago", { traceId, userId, orderId, errorCode })
```

## ID de correlación

Cada petición entrante recibe un `traceId` que:
- Se genera si no viene en la cabecera.
- Se propaga a todas las llamadas internas y externas.
- Aparece en **todos** los logs de esa petición.
- Se devuelve al cliente en la respuesta de error.

Sin esto, depurar un fallo en producción es imposible.

## Qué NUNCA se loguea

- Contraseñas, ni siquiera con hash
- Tokens, claves de API, cookies de sesión
- Números de tarjeta, CVV, IBAN
- Documentos de identidad
- Correos, teléfonos, direcciones (usa el ID interno)
- El cuerpo completo de la petición o la respuesta
- Contenido de mensajes privados

Si necesitas identificar a alguien en el log, usa su ID interno. Si necesitas parte de
un dato sensible, enmascáralo: `****4242`.

## Qué SÍ se loguea

| Evento | Nivel | Campos |
|--------|-------|--------|
| Petición recibida | INFO | método, ruta, traceId, userId |
| Petición completada | INFO | estado, duración |
| Error de negocio | WARN | operación, código, contexto |
| Error inesperado | ERROR | operación, excepción, traceId |
| Login correcto/fallido | INFO/WARN | userId o intento, IP |
| Cambio de permisos | INFO | quién, a quién, qué |
| Operación de dinero | INFO | operación, importe, referencia |
| Llamada a servicio externo | INFO | servicio, duración, resultado |

## Métricas

Las cuatro señales de oro:

| Señal | Qué mide | Por qué |
|-------|----------|---------|
| **Latencia** | p50, p95, p99 | El promedio esconde el problema |
| **Tráfico** | Peticiones por segundo | Contexto para el resto |
| **Errores** | Tasa de error por endpoint | Detección de degradación |
| **Saturación** | CPU, memoria, disco, conexiones de BD | Antes de que caiga |

Mide siempre percentiles, no promedios. Si el p99 es de 8 segundos, el 1 % de tus
usuarios lo está pasando mal aunque el promedio sea de 120 ms.

## Alertas

Una alerta debe cumplir **las tres**:

1. **Es urgente** — requiere acción ahora, no mañana
2. **Es accionable** — quien la recibe sabe qué hacer
3. **Tiene runbook** — el procedimiento está escrito en `docs/runbooks/`

Si falla alguna, no es una alerta: es una métrica en un panel.

| Alerta | Umbral orientativo |
|--------|--------------------|
| Tasa de error | > 1 % durante 5 min |
| Latencia p95 | > 2× la línea base durante 10 min |
| Servicio caído | Health check fallando 2 veces seguidas |
| Disco | > 85 % |
| Cola de trabajos | Creciendo sin drenar durante 15 min |
| Certificado TLS | Caduca en < 14 días |

**La fatiga de alertas mata.** Si el equipo empieza a silenciar alertas, el problema
son las alertas, no el equipo.

## Health checks

```
GET /health        → ¿el proceso está vivo?
GET /health/ready  → ¿puede atender tráfico? (BD, dependencias)
```

`/health` debe ser barato: si consulta la base de datos, tumbará la base de datos
cuando el balanceador lo llame cada segundo.

## Checklist

- [ ] Logs estructurados en JSON
- [ ] `traceId` en toda petición, propagado
- [ ] Sin datos sensibles en los logs
- [ ] Niveles usados con criterio
- [ ] Las cuatro señales de oro instrumentadas
- [ ] Cada alerta tiene runbook
- [ ] Health checks implementados
- [ ] Retención de logs definida
- [ ] `DEBUG` desactivado en producción
