# Proceso de release

---

## Versionado — SemVer

```
MAJOR.MINOR.PATCH
  │     │     └── correcciones compatibles
  │     └──────── funcionalidad compatible
  └────────────── cambios incompatibles
```

| Cambio | Sube |
|--------|------|
| Corregir un bug sin cambiar la API | PATCH |
| Añadir funcionalidad sin romper nada | MINOR |
| Eliminar o cambiar algo público | MAJOR |
| Deprecar (sin retirar todavía) | MINOR |

**Antes de 1.0.0:** todo puede cambiar. Documenta que la API no es estable.

## Pasos

### 1. Preparar

- [ ] Todas las tareas del release están en *Hecho*
- [ ] `main` en verde
- [ ] Sin bugs S0 ni S1 abiertos
- [ ] Dependencias auditadas, sin CVEs críticos

### 2. Changelog

- [ ] `.ai/CHANGELOG.md` actualizado: mover *No publicado* a la versión nueva
- [ ] Escrito para el **usuario**, no para el programador
- [ ] Cambios incompatibles destacados, con guía de migración

### 3. Versión

- [ ] Subir el número en los archivos que corresponda (`package.json`, etc.)
- [ ] Commit: `chore(release): v1.2.0`

### 4. Etiquetar

```bash
git tag -a v1.2.0 -m "Exportación CSV y correcciones de autenticación"
git push origin v1.2.0
```

### 5. Desplegar

Seguir `docs/runbooks/deployment.md`. Paso a paso, sin saltarse ninguno.

### 6. Verificar

- [ ] Health check en verde
- [ ] Camino crítico probado a mano en producción
- [ ] Tasa de errores sin cambios respecto a antes
- [ ] Latencia sin cambios
- [ ] Logs limpios los primeros 15 minutos

### 7. Comunicar

- [ ] Notas de release publicadas
- [ ] Equipo avisado
- [ ] Usuarios avisados si hay cambios visibles o incompatibles

### 8. Cerrar

- [ ] `.ai/AI_MEMORY.md` con lo aprendido en este release
- [ ] Incidencias registradas si las hubo

---

## Ventanas de despliegue

| Momento | ¿Desplegar? |
|---------|-------------|
| Martes a jueves, mañana | ✅ Ideal |
| Lunes | ⚠️ Aceptable |
| Viernes tarde | ❌ No |
| Antes de un festivo | ❌ No |
| Con el equipo no disponible | ❌ No |

No es superstición: es que si algo se rompe, quieres gente despierta y disponible
para arreglarlo.

## Reversión

**Criterios para revertir de inmediato:**
- Tasa de error por encima del doble de la línea base
- Cualquier pérdida o corrupción de datos
- Funcionalidad crítica caída
- Fallo de seguridad detectado

**Regla:** revierte primero, investiga después. El diagnóstico se hace con el sistema
estable, no con usuarios afectados.

```bash
# Revertir el despliegue (según tu plataforma)
<comando>

# O revertir el commit y volver a desplegar
git revert <sha>
git push origin main
```

**Cuidado con las migraciones de base de datos:** una migración aplicada no se
deshace sola. Por eso toda migración lleva su `down` probado. Ver `.agents/data.md`.

## Release de emergencia (hotfix)

1. Rama `hotfix/<descripcion>` desde `main`
2. Arreglo **mínimo** + test que lo cubre
3. Revisión acelerada (una aprobación basta)
4. Merge, tag `PATCH`, desplegar
5. Verificar
6. Postmortem si fue grave → `docs/process/INCIDENT_POSTMORTEM.md`

Un hotfix arregla **una** cosa. No es el momento de meter nada más.
