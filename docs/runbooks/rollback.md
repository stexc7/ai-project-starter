# Runbook: Revertir un despliegue

**Cuándo usarlo:** el despliegue actual causa un problema en producción.
**Duración estimada:** `<N>` minutos
**Requisitos:** acceso de despliegue, acceso a la base de datos si hubo migraciones
**Riesgo:** bajo (revertir) / alto (si hubo migraciones destructivas)

---

## Criterios: revierte YA si...

- Pérdida o corrupción de datos
- Funcionalidad crítica caída
- Tasa de error por encima del doble de la línea base
- Fallo de seguridad detectado
- Han pasado 10 minutos y no sabes qué está pasando

> **Revierte primero, investiga después.** El diagnóstico se hace con el sistema
> estable. Cada minuto que dedicas a entender el problema en caliente es un minuto
> de usuarios afectados.

---

## Antes de empezar

- [ ] Avisa al equipo: "revirtiendo `<versión>` por `<motivo>`"
- [ ] Anota la hora exacta de inicio (la necesitarás para el postmortem)
- [ ] **Captura evidencia antes de revertir** — logs, métricas, capturas.
      Al revertir, el estado que causaba el fallo desaparece.

```bash
# Guardar logs del periodo afectado
<comando> > incidente-$(date +%Y%m%d-%H%M).log
```

---

## Pasos

### 1. Identificar la versión estable anterior

```bash
<comando para listar despliegues recientes>
```

**Esperado:** la lista con la versión anterior identificada.

### 2. Revertir el código

```bash
<comando de reversión>
```

**Esperado:** despliegue completado con la versión anterior.
**Si falla:** ver **Escalar**.

### 3. Verificar

```bash
curl -f https://<dominio>/health
curl -f https://<dominio>/health/ready
```

**Esperado:** `200 OK`.

### 4. Revertir migraciones — solo si es necesario

> **Piénsalo antes de ejecutar.** Si la migración solo **añadió** columnas o tablas,
> normalmente **no** hace falta revertirla: la versión anterior las ignora. Revertir
> puede destruir datos escritos entre el despliegue y ahora.
>
> Revierte la migración solo si la versión anterior **no puede funcionar** con el
> esquema nuevo.

```bash
<comando de rollback de migración>
```

**Si la migración borró o transformó datos:** no la reviertas a ciegas. Restaura
desde la copia de seguridad y consulta antes de tocar nada.

### 5. Probar el camino crítico

- [ ] Iniciar sesión
- [ ] `<flujo principal>`
- [ ] Lo que estaba fallando ya no falla

### 6. Confirmar las métricas

| Métrica | Debe volver a |
|---------|---------------|
| Tasa de error | Línea base |
| Latencia p95 | Línea base |
| Health check | Verde de forma sostenida |

Obsérvalo durante 10 minutos.

---

## Después de revertir

- [ ] Avisar al equipo: incidente mitigado, hora de resolución
- [ ] Registrar el bug en `.ai/BUGS.md` con severidad
- [ ] **No volver a desplegar** hasta entender la causa raíz
- [ ] Postmortem si el impacto fue serio → `docs/process/INCIDENT_POSTMORTEM.md`
- [ ] Test de regresión que cubra el fallo, antes de reintentar el despliegue

---

## Escalar

| Situación | A quién | Cómo |
|-----------|---------|------|
| La reversión falla | | |
| Hay que restaurar una copia de seguridad | | |
| Pérdida de datos confirmada | | |
| Más de 30 minutos de caída | | |
