# Extensión de escritorio

Sincroniza **de verdad** el reproductor de Netflix, Prime Video, Disney+ o Max
con vuestra sala de Juntos. Uno le da al play y al otro le arranca solo; uno
pausa y el otro se para. Sin cuentas atrás.

Es lo mismo que hacen Teleparty y el plugin de escritorio de Hearo, y funciona
por el mismo motivo: **desde dentro de la propia página de Netflix, el elemento
`<video>` es accesible como cualquier otro**. El DRM impide incrustar o
controlar ese reproductor desde otro sitio web, pero no desde una extensión que
vive dentro de esa misma página.

> **Solo ordenador.** En el iPhone no hay extensiones que puedan hacer esto, y
> Netflix ni siquiera reproduce fuera de su app. Ahí la app web usa el modo
> asistido. Es la misma frontera que tiene Hearo, no una limitación nuestra.

---

## Instalar

No está en la Chrome Web Store (publicarla cuesta 5 $ y una revisión; para dos
personas no compensa). Se carga en modo desarrollador, que funciona igual:

1. Chrome o Edge → `chrome://extensions`
2. Activa **Modo de desarrollador** (arriba a la derecha).
3. **Cargar descomprimida** → elige esta carpeta `extension/`.
4. Ancla el icono del corazón a la barra.

Firefox no vale tal cual: usa otra API de extensiones.

## Usar

1. En la app web, crea la sala como siempre y quédate con el código y el PIN.
2. Pulsa el icono de la extensión y rellena:
   - **Dirección de vuestra app** — la URL de Vercel, por ejemplo
     `https://juntos.vercel.app`
   - **Código de sala**, **tu nombre** y el **PIN**
3. Chrome pedirá permiso para hablar con esa dirección. Hay que darlo: la
   dirección la ponéis vosotros, así que no puede venir en el manifiesto.
4. Abre Netflix y dale al play.

Abajo a la izquierda aparece un aviso *«Juntos · Sincronizado con la sala»*
cuando ha enganchado el reproductor.

Los dos podéis usar la extensión, o uno la extensión y el otro la app web en
modo asistido: la sala es la misma.

## Cómo está hecho

```
manifest.json   Permisos y dónde se inyecta
content.js      Vive dentro de netflix.com: engancha el <video> y lo sincroniza
sync.js         La matemática de sincronización (espejo de src/domain/playback.ts)
background.js   Habla con la sala: sesión, reloj y sondeo
popup.js/html   Conectar y desconectar
```

**El bucle** vive en `content.js` y es el mismo que en la app web: cada 250 ms
compara dónde debería ir el vídeo con dónde va, y corrige — sin tocar nada si el
desfase es menor de 150 ms, con un ajuste de velocidad imperceptible si es
pequeño, y con un salto si ya se vería. Al revés también: lo que hagas en los
controles de Netflix se manda a la sala.

**El puerto persistente** entre `content.js` y `background.js` no es solo un
canal de mensajes: en Manifest V3 Chrome duerme el service worker a los treinta
segundos sin actividad, y un puerto abierto lo mantiene vivo. Sin eso, el sondeo
moriría a mitad de película. Hay además una alarma cada 30 s como red de
seguridad.

**El token.** La app web usa una cookie `httpOnly`, pero desde `netflix.com` esa
cookie no viaja (es `SameSite=Lax`). Por eso la extensión pide el token al
entrar (`wantToken`) y lo manda en `Authorization: Bearer`. Solo se entrega a
quien acaba de acertar el PIN.

### `sync.js` es una copia, y está vigilada

Una extensión carga archivos sueltos: sin TypeScript, sin empaquetador. Meter un
paso de compilación por cuarenta líneas costaría más de lo que ahorra, así que la
matemática está duplicada de `src/domain/playback.ts`.

Las copias a mano se separan del original tarde o temprano, así que hay un test
(`tests/extension-sync.test.ts`) que compara las dos implementaciones con
cientos de entradas y falla en cuanto discrepan en un milisegundo. **Si tocas
una, toca la otra** — el CI te lo dirá igualmente.

## Límites conocidos

- Netflix reconstruye su reproductor al cambiar de episodio. El content script
  se reengancha solo cada dos segundos, pero puede haber un salto en el cambio.
- Prime Video y Disney+ están en el manifiesto y usan `<video>` estándar, pero
  se han probado menos que Netflix.
- Si los dos abrís la misma película en dos pestañas del mismo navegador, la
  extensión sincroniza las dos contra la sala. Es raro, pero no rompe nada.
