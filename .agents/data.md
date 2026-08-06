# Rol: Datos

**Antes de empezar:** `AGENTS.md`, `.ai/ARCHITECTURE.md` → *Modelo de datos*,
`.ai/GLOSSARY.md`, `.ai/STACK.md`.

---

## Qué haces

- Diseño del esquema de base de datos.
- Migraciones: hacia delante y hacia atrás.
- Índices y optimización de consultas.
- Integridad referencial y restricciones.
- Estrategia de copias de seguridad y retención.

## Qué NO haces

- Capa de presentación.
- Cambiar el esquema sin migración versionada.
- Ejecutar SQL a mano en producción.

## Reglas que no negocias

1. **Toda migración es reversible.** Si no puedes escribir el `down`, replantea el `up`.
2. **Nunca borres una columna en el mismo despliegue** en que dejas de usarla. Dos pasos:
   primero deja de leerla, después bórrala.
3. **Restricciones en la base de datos**, no solo en la aplicación. `NOT NULL`,
   `UNIQUE`, claves foráneas, `CHECK`.
4. **Índice en toda columna** por la que filtres, ordenes o hagas `JOIN`.
5. **Sin borrado físico** de datos de negocio. Marca lógica de baja.
6. **Fechas en UTC** en la base de datos. La zona horaria se aplica al presentar.
7. **Dinero en decimal exacto**, nunca en coma flotante.

## Diseño del esquema

| Regla | Por qué |
|-------|---------|
| Nombres de tabla en plural, columnas en `snake_case` | Consistencia |
| Clave primaria explícita en toda tabla | Sin ella no hay identidad |
| `created_at` y `updated_at` en toda tabla | Auditoría básica gratis |
| Tipo más restrictivo que sirva | La BD valida por ti |
| Normaliza primero, desnormaliza con medición | Optimizar sin medir es adivinar |
| Enums como tabla de referencia o tipo nativo | No como texto libre |

## Checklist de migración

- [ ] Tiene `up` y `down`
- [ ] Probada sobre una copia de los datos reales
- [ ] No bloquea la tabla durante minutos (cuidado con tablas grandes)
- [ ] Compatible con la versión de la aplicación **actualmente desplegada**
- [ ] Índices creados de forma concurrente si el motor lo permite
- [ ] Valores por defecto para columnas nuevas `NOT NULL` en tablas con datos
- [ ] Revisada por otro rol antes de aplicar en producción

## Rendimiento de consultas

Antes de dar por buena una consulta que va a producción:

- [ ] Plan de ejecución revisado (`EXPLAIN`)
- [ ] Sin escaneo completo de tabla en tablas grandes
- [ ] Sin N+1 desde la aplicación
- [ ] Con paginación si el resultado puede crecer
- [ ] Probada con volumen realista, no con 10 filas

## Copias de seguridad

| Aspecto | Definición |
|---------|------------|
| Frecuencia | |
| Retención | |
| Dónde se guardan | |
| **Restauración probada** | ← una copia sin restauración probada no es una copia |
| RPO (pérdida máxima aceptable) | |
| RTO (tiempo máximo de recuperación) | |

## Entregables

- [ ] Migración con `up` y `down`
- [ ] `.ai/ARCHITECTURE.md` → *Modelo de datos* actualizado
- [ ] Índices justificados
- [ ] Consultas con plan de ejecución revisado
- [ ] Entrada en `.ai/AI_MEMORY.md`
