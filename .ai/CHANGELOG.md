# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado según [SemVer](https://semver.org/lang/es/).

> **Regla:** se escribe para quien **usa** el software, no para quien lo programa.
> "Corregido: el informe mensual ya no pierde la última fila" — no
> "Corregido: off-by-one en `ReportBuilder.build()`".
>
> El detalle técnico ya está en el historial de Git.

---

## [No publicado]

### Añadido
- **Juntos**: una aplicación web para ver una película a la vez desde dos casas.
  Se instala en el iPhone desde Safari y no necesita cuenta.
- **Sincronización automática** con YouTube y con archivos de vídeo: pegas un
  enlace, uno le da al play y al otro le arranca solo. Pausar, adelantar y
  retroceder también se aplican en los dos.
- **Se corrige solo**: si los vídeos se separan, la app los vuelve a juntar sin
  que nadie toque nada — cambiando la velocidad un 5 % cuando la diferencia es
  pequeña, o saltando cuando ya se notaría.
- **Extensión para el ordenador** que hace lo mismo con Netflix, Prime Video,
  Disney+ y Max: play, pausa y saltos compartidos dentro del propio Netflix.
- **Chat de voz** entre los dos, para comentar la peli sin abrir otra app. El
  audio va directo de un móvil al otro.
- **Salas privadas para dos**, con un código de 6 caracteres y un PIN. Cada una
  se guarda un mes, así que podéis volver a la misma cada noche.
- **Cuenta atrás simultánea**: los dos teléfonos cuentan 5, 4, 3, 2, 1 con el
  mismo reloj y avisan con un pitido en el momento exacto de darle al play.
- **Timecode compartido**: en todo momento se ve por qué minuto va la sesión, sin
  que nadie tenga que decirlo.
- **Recuperar el sincronismo**: si uno se desfasa, escribe por qué minuto va y la
  app propone un minuto redondo para reencontrarse.
- **Pausa, reanudar, ±30 segundos y saltar** a un minuto concreto, para los dos.
- **Chat, reacciones flotantes** y un punto verde que dice si la otra persona está.
- **Lista de «qué vemos»** con botón para que decida la suerte.

### Cambiado
- La plantilla pasa a documentar el proyecto real: contexto, arquitectura,
  stack, ADR de la sincronización y runbook de despliegue.
- El CI ejecuta lint, tipos, tests y build de Node.

### Eliminado
- Carpetas `backend/` y `frontend/` de la plantilla: la app es un único proyecto
  Next.js y esos README describían una estructura que no existe.

### Seguridad
- El PIN se guarda con scrypt y sal aleatoria; nunca sale del servidor.
- La sesión va firmada con HMAC-SHA256 en una cookie `httpOnly`, una por sala.
- Diez intentos de PIN fallidos bloquean la sala 15 minutos.
- Un código inexistente y un PIN incorrecto dan el mismo error, para que no se
  puedan descubrir salas probando códigos.

---

## [0.1.0] — AAAA-MM-DD

### Añadido
- Versión inicial.

---

[No publicado]: https://github.com/USUARIO/REPO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/USUARIO/REPO/releases/tag/v0.1.0
