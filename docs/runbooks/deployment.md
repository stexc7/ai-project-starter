# Runbook: desplegar Juntos en Vercel

> Tiempo: unos 15 minutos la primera vez. Después, cada `git push` despliega solo.
> Todo lo que hace falta cabe en el plan gratuito de Vercel y de Upstash.

Para revertir: [`rollback.md`](rollback.md).

---

## Qué vas a montar

```
 iPhone ─┐
         ├──▶  Vercel (Next.js)  ──▶  Upstash Redis
 iPhone ─┘        la app              donde vive la sala
```

Dos servicios, los dos gratis para dos personas. Nada más.

---

## 1. La base de datos (Upstash Redis)

Hace falta porque en Vercel cada petición puede caer en una función distinta. Sin
un sitio común, cada una tendría su propia copia de las salas y los dos móviles
no se verían.

1. Entra en [console.upstash.com](https://console.upstash.com) y crea una cuenta.
2. **Create Database**. Tipo *Redis*.
   - Nombre: `juntos`
   - Región: la más cercana a vosotros (`eu-west-1` para España).
   - Plan: **Free**.
3. Abre la base de datos → pestaña **REST API**. Copia estos dos valores:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

> El token da acceso completo a esa base de datos. No lo pegues en un chat, ni en
> un issue, ni en el código. Solo en las variables de entorno de Vercel.

## 2. El secreto de la sesión

Genera uno de verdad, en tu terminal:

```bash
openssl rand -base64 32
```

Guárdalo: es `SESSION_SECRET`. Si lo cambias más adelante, todas las sesiones
abiertas se caen y hay que volver a meter el PIN. No pasa nada, pero avisa.

## 3. Desplegar

1. Entra en [vercel.com](https://vercel.com) con tu cuenta de GitHub.
2. **Add New → Project** y elige este repositorio.
3. Vercel detecta Next.js solo. **No cambies nada** del build.
4. Despliega **la rama donde está la app**, no `main`, hasta que la mezcles.
5. Antes de pulsar *Deploy*, abre **Environment Variables** y añade las tres,
   marcadas para *Production*, *Preview* y *Development*:

   | Variable | Valor |
   |----------|-------|
   | `SESSION_SECRET` | el que generaste en el paso 2 |
   | `UPSTASH_REDIS_REST_URL` | el de Upstash |
   | `UPSTASH_REDIS_REST_TOKEN` | el de Upstash |

6. **Deploy**.

Si falta alguna variable, la app **no arranca en silencio**: falla con un mensaje
que dice exactamente cuál falta. Es a propósito — es mejor que dos personas
descubran a mitad de película que no se ven.

## 4. Comprobar que funciona

```bash
# El reloj responde
curl https://TU-APP.vercel.app/api/time
# → {"serverMs":1789535348796}
```

Y luego, con los dos móviles:

- [ ] Uno crea una sala. Sale un código de 6 caracteres.
- [ ] El otro entra con ese código y el PIN.
- [ ] En la cabecera de los dos aparecen **dos avatares con el punto verde**.
- [ ] Abajo del todo pone *Relojes sincronizados · ±xx ms*. Si pone más de
      ±300 ms, la cobertura de alguno va mal: se corrige sola al mejorar.
- [ ] Uno escribe en el chat y le llega al otro en 2-3 segundos.
- [ ] Uno pulsa **Empezar juntos**: la cuenta atrás sale **en los dos**.
- [ ] Al acabar, los dos marcan el mismo timecode.

## 5. Instalarla en el iPhone

Abrid la URL en **Safari** (no en Chrome: en iOS solo Safari instala PWAs) →
botón de compartir → **Añadir a pantalla de inicio**.

Se abre a pantalla completa, sin barra de navegador. El icono es un corazón con
un play dentro.

---

## Mantenimiento

**No hay.** Las salas caducan solas al mes de no usarse y los contadores de
intentos fallidos a los 15 minutos. No hay copias de seguridad que hacer porque
no hay nada que valga la pena guardar: un chat de anoche y una lista de pelis.

### Cuánto gasta

Dos personas, tres horas de película a la semana:

- **Vercel:** unas 40.000 invocaciones al mes. El plan gratuito da de sobra.
- **Upstash:** unos 20.000 comandos al mes, sobre 500.000 gratis.

Si en algún momento se acercara al límite, lo primero que hay que mirar es si
alguna pestaña se quedó abierta sondeando. La app espacia el sondeo a 10 s en
segundo plano justo para eso.

---

## Cuando algo va mal

| Síntoma | Causa más probable | Qué hacer |
|---------|--------------------|-----------|
| Error 500 nada más entrar | Falta una variable de entorno | Míralas en Vercel → Settings → Environment Variables, y **vuelve a desplegar**: no se aplican solas |
| «Tu sesión ha caducado» sin parar | `SESSION_SECRET` cambió, o no está puesta | Ponla fija y redespliega |
| Cada uno ve una sala distinta | Faltan las variables de Upstash | Igual que arriba |
| «Demasiados intentos fallidos» | 10 PIN mal en 15 minutos | Esperar, o borrar la clave `juntos:attempts:CODIGO` desde la consola de Upstash |
| La cuenta atrás no suena | iOS no deja sonar hasta el primer toque | Tocar la pantalla una vez al entrar en la sala |
| El reloj marca ±500 ms o más | Red móvil con mucha latencia | Se corrige solo; si no, cerrar y abrir la app fuerza una medición nueva |
