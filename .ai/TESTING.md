# TESTING.md — Estado de los tests

**Última revisión:** `2026-09-16`

Estrategia y criterios: [`../docs/standards/TESTING_STRATEGY.md`](../docs/standards/TESTING_STRATEGY.md).

---

## Cómo se ejecutan

```bash
npm test            # una pasada
npm run test:watch  # mientras se desarrolla
```

Vitest sobre `tests/`. Tardan menos de un segundo porque **no levantan nada**: ni
navegador, ni servidor, ni red. Eso es consecuencia directa de la regla de
`src/domain/`, que no toca el exterior y recibe la hora como parámetro.

## Qué está cubierto

| Archivo | Qué prueba | Tests |
|---------|-----------|-------|
| `playback.test.ts` | Fases, posición, pausa, salto, consejo de desfase, punto de reencuentro | 13 |
| `security.test.ts` | PIN con scrypt, token de sesión (manipulado, caducado, de otra sala), códigos, validación de entrada | 17 |
| `room.test.ts` | Reducer de la sala: entrar, presencia, acciones, límites del chat y de la lista | 12 |
| `sync.test.ts` | Protocolo de sondeo: deltas, fusión, duplicados, que no se filtra el hash del PIN | 11 |
| `clock.test.ts` | Estimación del desfase: muestras lentas, mediana, margen de error | 6 |
| `format.test.ts` | Timecodes de ida y vuelta, entradas inválidas | 8 |
| `reconcile.test.ts` | El corrector de deriva: zona muerta, ajuste de velocidad, saltos y convergencia | 11 |
| `sources.test.ts` | Clasificar enlaces: YouTube, archivos, DRM, esquemas peligrosos | 14 |
| `extension-sync.test.ts` | Que `extension/sync.js` no se separe de `domain/playback.ts` | 5 |
| `store-upstash.test.ts` | El camino de Redis: colisiones de escritura, reintentos, sala inexistente, que el token no se filtre en los errores | 6 |
| | **Total** | **116** |

Lo que se prueba es lo que duele si se rompe: **la sincronización** (si falla,
la app no sirve para nada) y **la seguridad** (si falla, cualquiera entra en la
sala). Los componentes de React son casi todos presentación sobre esa lógica.

## Huecos conocidos

| Hueco | Por qué | Riesgo |
|-------|---------|--------|
| Sin tests de navegador automatizados | Se validó a mano con Playwright: dos «teléfonos» en la misma sala, la llamada de voz con micrófonos falsos, y la extensión cargada en Chromium contra un `netflix.com` interceptado | Una regresión de integración no la ve el CI. Es TASK-010 |
| `src/server/store.ts` contra Upstash de verdad | Haría falta una base de datos en el CI | Cubierto con un doble de su API REST, en test y a mano contra un servidor local que implementa su protocolo. Falta probarlo contra Upstash real |
| `useRoom` y `useServerClock` | Son hooks: necesitarían entorno de DOM y temporizadores falsos | La lógica que contienen (`mergeDelta`, `estimateClock`) sí está probada, que es donde están los errores |

## Tests frágiles

Ninguno conocido. No hay esperas por tiempo real: donde hace falta una hora, se
pasa como número.

## Lo verificado a mano, y con qué números

Con dos navegadores independientes contra el servidor de desarrollo:

| Qué | Resultado |
|-----|-----------|
| Uno da al play, el otro no toca nada | Arranca solo |
| Uno pausa | El otro se para solo |
| Uno salta de minuto | El otro salta también |
| Deriva forzada de 2,9 s | Corregida a 0,15 s en 1,4 s |
| Llamada de voz | Conecta en ~3 s, audio en los dos sentidos |
| Extensión en un `netflix.com` interceptado | Play desde la web arranca el reproductor; pausar en el reproductor lo refleja la web |
| Build de producción contra un Upstash local | Crear, entrar, chat, archivos sincronizados y llamada de voz, todo correcto |
| 30 escrituras simultáneas | 0 perdidas (antes del arreglo se perdían 5) |

## Qué validar a mano antes de dar algo por hecho

Con **dos dispositivos**, no dos pestañas del mismo:

- [ ] La cuenta atrás sale en los dos y el pitido cae a la vez.
- [ ] Con YouTube: uno le da al play y al otro le arranca sin tocar nada.
- [ ] La llamada de voz abre, y con auriculares no hay eco.
- [ ] Al acabar, los dos marcan el mismo timecode.
- [ ] Un mensaje llega al otro en 2-3 segundos.
- [ ] El punto verde se apaga al cerrar la app en el otro móvil.
- [ ] Añadida a la pantalla de inicio, abre sin barra de Safari.
