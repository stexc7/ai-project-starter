# SECURITY.md — Qué es sensible en este proyecto

> Reporte de vulnerabilidades: [`../SECURITY.md`](../SECURITY.md).
> Checklist al programar: [`../docs/standards/SECURITY_CHECKLIST.md`](../docs/standards/SECURITY_CHECKLIST.md).

**Última revisión:** `2026-09-16`

---

## Lo primero

**Aquí no se piden ni se guardan las credenciales de Netflix.** La app no las
necesita para nada: cada persona reproduce en su propio Netflix, en su propio
dispositivo. Si alguna vez aparece un campo que las pida, es un bug grave o algo
peor. No lo hay, y no debe haberlo.

## Qué protege una sala

Una sala contiene poco, pero es de dos personas y no de nadie más: qué están
viendo, su conversación y su lista de pelis. No es crítico; es privado.

| Dato | Dónde vive | Cómo se protege |
|------|-----------|-----------------|
| PIN de la sala | `room.pinHash` en Redis | scrypt con sal aleatoria. **Nunca** sale del servidor |
| Sesión | Cookie `juntos_s_<CODIGO>` | HMAC-SHA256, `httpOnly`, `secure` en producción, `sameSite=lax` |
| Chat y lista | Redis, dentro de la sala | El código de sala y el PIN son la puerta |
| `SESSION_SECRET` | Variables de Vercel | Nunca en el repositorio, nunca en logs |
| Token de Upstash | Variables de Vercel | Da acceso total a la base de datos |

## Reglas que no se negocian

1. **El hash del PIN no viaja al navegador.** Lo que se manda lo construye
   `buildStateDelta`, que no lo incluye. Hay un test que lo comprueba
   (`sync.test.ts`); si alguien añade un campo nuevo a la sala, ese test es el
   que avisa.
2. **Código inexistente y PIN incorrecto dan el mismo error.** Si se
   distinguieran, se podría averiguar qué salas existen probando códigos.
3. **Toda entrada se valida en el servidor**, en `src/domain/validation.ts` y
   `src/server/actions.ts`. Lo del cliente es cortesía. Las reacciones solo
   aceptan emoji de una lista cerrada; los textos se limpian de caracteres de
   control; las posiciones no pueden ser negativas ni de cuarenta horas.
4. **Las comparaciones de secretos van en tiempo constante** (`timingSafeEqual`).
5. **El cuerpo de error de Upstash no se propaga**: puede llevar la URL con el
   token dentro. Solo se registra el código de estado.
6. **En producción, si falta una variable de entorno la app no arranca.** Un
   fallo silencioso aquí es peor que uno ruidoso.

## Lo que se ha aceptado a conciencia

| Riesgo | Por qué se acepta |
|--------|-------------------|
| PIN de 4 dígitos | El secreto fuerte es el código de sala (~900 millones). El PIN solo cubre que alguien lo vea de reojo, y hay bloqueo a los 10 fallos |
| El bloqueo de intentos es por sala, no por IP | En serverless no hay estado de IP fiable. Efecto: alguien con el código puede dejar la sala bloqueada 15 minutos. Anotado en `TASKS.md` |
| Quien pierde el código pierde la sala | No hay correo con el que recuperarla, porque no hay cuentas. Es el precio de no pedir datos |
| Sin cifrado extremo a extremo del chat | Quien tenga acceso a la base de datos lee el chat. Para dos personas y una conversación de sofá, no compensa la complejidad |

## Antes de tocar nada de esto

- Cualquier cambio en `src/server/auth.ts` o en `src/server/store.ts` se revisa
  con `docs/standards/SECURITY_CHECKLIST.md` en la mano.
- Si se añade un campo sensible a `Room`, hay que comprobar que no acaba en
  `buildStateDelta`, y ampliar el test de `sync.test.ts`.
- Cambiar `SESSION_SECRET` invalida todas las sesiones abiertas. No rompe nada,
  pero hay que volver a meter el PIN.
