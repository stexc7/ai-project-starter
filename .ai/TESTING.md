# TESTING.md — Estado de las pruebas

> Qué está cubierto, qué no, y cómo se ejecuta todo. Codex lee este archivo.
> La *estrategia* (qué tipo de test escribir y cuándo) está en
> `docs/standards/TESTING_STRATEGY.md`.

**Última actualización:** `<AAAA-MM-DD>`

---

## Cómo ejecutar

```bash
# Todo
<comando>

# Solo unitarios
<comando>

# Solo integración
<comando>

# Un archivo concreto
<comando>

# Con cobertura
<comando>

# En modo watch (desarrollo)
<comando>
```

## Herramientas

| Capa | Framework | Config |
|------|-----------|--------|
| Unitarios | | |
| Integración | | |
| E2E | | |
| Cobertura | | |
| Mocks / fixtures | | |

## Cobertura actual

| Módulo | Cobertura | Objetivo | Nota |
|--------|-----------|----------|------|
| | | | |

**Umbral mínimo para hacer merge:** `<N>%` sobre líneas modificadas.

## Zonas sin cubrir

> Sé explícito. Un hueco conocido se puede gestionar; uno desconocido, no.

| Qué | Por qué no está cubierto | Riesgo |
|-----|--------------------------|--------|
| | | |

## Tests frágiles (*flaky*)

> Un test que falla de forma intermitente es peor que no tenerlo: entrena al equipo
> a ignorar el rojo.

| Test | Frecuencia de fallo | Causa sospechada | Estado |
|------|---------------------|------------------|--------|
| | | | |

## Datos de prueba

- **Fixtures:** `<ruta>`
- **Factories / builders:** `<ruta>`
- **Base de datos de test:** `<cómo se levanta y se limpia>`
- Ningún test depende de datos de producción. Nunca.

## Reglas

- Cada test es independiente. Sin orden implícito, sin estado compartido.
- Nada de `sleep()` para esperar. Usa esperas explícitas sobre condiciones.
- Un test que falla debe decir **qué** falló, no solo *"esperaba true, recibí false"*.
- Test nuevo obligatorio para: código nuevo, bug corregido, caso límite descubierto.
- **Prohibido** hacer `skip` de un test para desbloquear un merge. Se arregla o se
  documenta aquí con fecha de caducidad.
