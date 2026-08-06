# Runbook: Desplegar a producción

**Cuándo usarlo:** release planificado o hotfix aprobado.
**Duración estimada:** `<N>` minutos
**Requisitos:** acceso a `<plataforma>`, permisos de despliegue, acceso a la monitorización
**Riesgo:** medio

> Rellena los `<marcadores>` con los comandos reales de tu proyecto la primera vez
> que despliegues. Un runbook con marcadores sin rellenar no sirve de nada.

---

## Antes de empezar

- [ ] Es martes, miércoles o jueves por la mañana (ver `docs/process/RELEASE_PROCESS.md`)
- [ ] Hay al menos una persona más disponible durante la próxima hora
- [ ] CI en verde en `main`
- [ ] Sin bugs S0 ni S1 abiertos
- [ ] `.ai/CHANGELOG.md` actualizado
- [ ] Tag de versión creado y subido
- [ ] Migraciones revisadas, con `down` probado
- [ ] Variables de entorno nuevas ya creadas en producción
- [ ] Copia de seguridad reciente **verificada** (restaurada en un entorno de prueba)
- [ ] Panel de monitorización abierto en otra ventana

---

## Pasos

### 1. Anunciar el inicio

Avisa al equipo por el canal habitual: versión, qué incluye, duración estimada.

### 2. Verificar el estado actual

```bash
<comando para ver la versión desplegada actualmente>
```

**Esperado:** la versión anterior a la que vas a desplegar.
**Si no coincide:** para. Alguien desplegó algo. Averigua qué antes de seguir.

### 3. Anotar la línea base

Antes de tocar nada, apunta los valores actuales:

| Métrica | Valor ahora |
|---------|-------------|
| Tasa de error | |
| Latencia p95 | |
| Peticiones/s | |

Sin esto no sabrás si el despliegue empeoró algo.

### 4. Aplicar migraciones de base de datos

> Solo si las hay. Van **antes** del código nuevo, y deben ser compatibles con la
> versión que está corriendo ahora.

```bash
<comando de migración>
```

**Esperado:** todas las migraciones aplicadas, sin errores.
**Si falla:** no despliegues el código. Revisa el error. La base de datos queda en
el estado en que esté — comprueba si la migración es transaccional.

### 5. Desplegar

```bash
<comando de despliegue>
```

**Esperado:** despliegue completado, health check en verde.
**Si falla:** ve directo a **Reversión**.

### 6. Verificar el health check

```bash
curl -f https://<dominio>/health
curl -f https://<dominio>/health/ready
```

**Esperado:** `200 OK` en ambos.
**Si falla:** espera 60 segundos y reintenta (puede estar arrancando). Si sigue
fallando, **revierte**.

### 7. Probar el camino crítico a mano

- [ ] Iniciar sesión
- [ ] `<flujo principal del producto>`
- [ ] `<lo que cambió en este release>`

**Si algo no funciona:** revierte. No intentes arreglarlo en caliente.

---

## Verificación final — primeros 15 minutos

Quédate mirando la monitorización. No te vayas.

| Minuto | Comprobación | Umbral para revertir |
|--------|--------------|----------------------|
| 1 | Health check | Falla dos veces seguidas |
| 3 | Tasa de error | Más del doble de la línea base |
| 5 | Latencia p95 | Más del doble de la línea base |
| 10 | Logs de error | Errores nuevos que no existían antes |
| 15 | Todo lo anterior | Cualquier cosa sin explicación |

- [ ] 15 minutos sin incidencias
- [ ] Equipo avisado de que el despliegue terminó bien

---

## Reversión

**Revierte de inmediato si:** hay pérdida de datos, funcionalidad crítica caída,
tasa de error por encima del doble, o fallo de seguridad.

**No lo pienses demasiado.** Revertir es barato; un incidente largo no.

```bash
<comando de reversión>
```

Después de revertir:

- [ ] Verificar que la versión anterior está sirviendo
- [ ] Health check en verde
- [ ] Métricas de vuelta a la línea base
- [ ] Avisar al equipo
- [ ] Registrar en `.ai/BUGS.md`
- [ ] Postmortem si el impacto fue serio (`docs/process/INCIDENT_POSTMORTEM.md`)

### Si había migraciones

Una migración aplicada no se revierte sola al revertir el código.

```bash
<comando de rollback de migración>
```

**Cuidado:** si la migración borró o transformó datos, el `down` puede no
recuperarlos. Por eso la copia de seguridad verificada es un requisito previo,
no una formalidad.

---

## Escalar

| Situación | A quién | Cómo |
|-----------|---------|------|
| No consigues revertir | `<...>` | `<...>` |
| Pérdida de datos | `<...>` | `<...>` |
| Fallo de seguridad | `<...>` | `<...>` |
| Lleva más de 30 min caído | `<...>` | `<...>` |

---

## Después

- [ ] `.ai/CHANGELOG.md` marcado como publicado
- [ ] `.ai/AI_MEMORY.md` con lo aprendido si hubo sorpresas
- [ ] Este runbook actualizado si algún paso no era exacto
