# Runbooks

Procedimientos operativos. Escritos para ejecutarse **a las tres de la madrugada,
por alguien medio dormido, que no escribió este sistema**.

---

## Reglas de un buen runbook

1. **Pasos numerados y literales.** Comandos copiables, no descripciones.
2. **Sin suposiciones.** Di dónde ejecutar cada comando y con qué permisos.
3. **Salida esperada** después de cada paso crítico. Si no coincide, hay que saberlo.
4. **Qué hacer si falla** cada paso.
5. **Cuándo escalar**, y a quién.
6. **Probado.** Un runbook sin ejecutar es una hipótesis.

## Estructura

```markdown
# Runbook: <Qué resuelve>

**Cuándo usarlo:** <disparador concreto>
**Duración estimada:** <tiempo>
**Requisitos:** <accesos, herramientas, permisos>
**Riesgo:** bajo / medio / alto

## Antes de empezar
- [ ] <verificaciones>

## Pasos
### 1. <Acción>
​```bash
<comando>
​```
**Esperado:** <salida>
**Si falla:** <qué hacer>

## Verificación final
- [ ] <cómo saber que funcionó>

## Reversión
<cómo deshacer>

## Escalar
| Situación | A quién |
```

## Runbooks disponibles

| Runbook | Cuándo |
|---------|--------|
| [`deployment.md`](deployment.md) | Desplegar a producción |
| [`rollback.md`](rollback.md) | Revertir un despliegue |

## Runbooks que deberías escribir

Uno por cada alerta que tengas configurada. Además:

- Restaurar una copia de seguridad
- Rotar credenciales
- Escalar recursos bajo carga
- Purgar la caché
- Investigar latencia alta
- Investigar la cola de trabajos atascada
- Poner el sistema en modo mantenimiento
