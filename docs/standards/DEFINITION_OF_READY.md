# Definition of Ready

> Una tarea no se empieza hasta que cumple esto. Empezar una tarea mal definida
> garantiza retrabajo — y con una IA, garantiza que construya lo que no era.

---

## ✅ La tarea está lista si...

### Claridad

- [ ] Tiene un **objetivo en una frase**, en lenguaje de negocio
- [ ] Se entiende **quién** se beneficia y **por qué** importa
- [ ] Está escrita de forma que alguien ajeno la entienda sin preguntar

### Criterios de aceptación

- [ ] Hay al menos uno, y son **verificables**
- [ ] Están redactados como comprobaciones, no como deseos

```
❌ "Que el listado funcione bien"
✅ "Al abrir /facturas se muestran las 20 más recientes, ordenadas por fecha
    descendente, con paginación"

❌ "Manejar errores"
✅ "Si la API devuelve 500, se muestra 'No pudimos cargar tus facturas' con
    un botón de reintentar"
```

### Alcance

- [ ] Está claro qué **entra**
- [ ] Está claro qué **NO entra**
- [ ] Cabe en 3 días o menos. Si no, se divide

### Dependencias

- [ ] No depende de nada que esté sin terminar
- [ ] Los accesos, credenciales y permisos necesarios están disponibles
- [ ] Las decisiones de diseño previas están tomadas

### Contexto técnico

- [ ] Se sabe aproximadamente qué parte del sistema toca
- [ ] Si necesita una decisión de arquitectura, esa decisión ya está tomada (ADR)
- [ ] Si necesita diseño de UI, el diseño existe
- [ ] Los términos del dominio están en `.ai/GLOSSARY.md`

### Verificabilidad

- [ ] Se sabe cómo se va a probar
- [ ] Se sabe qué datos de prueba hacen falta

---

## ❌ Señales de que NO está lista

| Señal | Qué hacer |
|-------|-----------|
| "Mejorar el rendimiento" | ¿De qué? ¿De cuánto a cuánto? ¿Medido cómo? |
| "Arreglar el módulo de pagos" | ¿Qué está roto exactamente? Pasos de reproducción |
| "Como el sistema anterior" | Escribir qué hacía el sistema anterior |
| "Ya lo hablamos en la reunión" | Si no está escrito, no existe |
| Sin criterios de aceptación | Escribirlos antes de empezar |
| "Depende de lo que decida X" | Bloqueada hasta que X decida |
| Estimada en más de una semana | Dividirla |

---

## Plantilla de tarea lista

```markdown
### TASK-042 — Exportar facturas a CSV

**Objetivo:** que un usuario pueda descargar sus facturas para llevarlas a su
contabilidad sin copiarlas a mano.

**Beneficiario:** usuario final con más de 20 facturas al mes.

**Criterios de aceptación:**
- [ ] Hay un botón "Exportar CSV" en la vista de facturas
- [ ] El CSV incluye: número, fecha, cliente, base, IVA, total
- [ ] Respeta los filtros activos en la vista
- [ ] Máximo 10 000 filas; por encima, avisa y sugiere filtrar
- [ ] El nombre del archivo es `facturas-AAAA-MM-DD.csv`
- [ ] Si la exportación falla, se muestra un error accionable

**Fuera de alcance:**
- Exportar a Excel (XLSX)
- Exportación programada por correo

**Notas técnicas:**
- Generar en streaming, no en memoria
- Codificación UTF-8 con BOM (Excel lo necesita para los acentos)

**Cómo se prueba:**
- Cuenta con 0, 1, 50 y 15 000 facturas
- Con filtros aplicados y sin filtros
- Cliente con acentos y con comas en el nombre

**Estimación:** 1 día
```

---

## Quién decide

Si no está lista, **no entra en la columna "Listo para empezar"** de `.ai/TASKS.md`.
Se devuelve para refinar. Es más barato refinar durante 20 minutos que reconstruir
durante dos días.
