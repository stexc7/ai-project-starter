# tests/

Tests de la lógica del proyecto, con [Vitest](https://vitest.dev).

```bash
npm test            # una pasada
npm run test:watch  # mientras se desarrolla
```

## Por qué están todos aquí

En muchos proyectos el test unitario vive junto al código que prueba. Aquí no
hace falta: lo que merece la pena probar está concentrado en `src/domain/`, que
es **puro** — no toca red, ni React, ni el reloj del sistema. La hora entra
siempre como parámetro.

Eso es lo que permite que 67 tests sobre una aplicación de sincronización en
tiempo real corran en menos de un segundo, sin levantar un navegador ni un
servidor.

| Archivo | Qué cubre |
|---------|-----------|
| `playback.test.ts` | El ancla: fases, posición, pausa, salto, desfase |
| `clock.test.ts` | Estimación del desfase entre relojes |
| `room.test.ts` | La sala como reducer |
| `sync.test.ts` | Protocolo de sondeo y fusión en el cliente |
| `security.test.ts` | PIN, token de sesión, códigos, validación de entrada |
| `format.test.ts` | Timecodes |

Estado de la cobertura y huecos conocidos: [`../.ai/TESTING.md`](../.ai/TESTING.md).
