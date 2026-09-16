# PROJECT.md — Qué es este proyecto

## Nombre

`Juntos`

## En una frase

Una PWA para dos personas que sincroniza el momento exacto en que las dos le dan
al play a la misma película, cada una en su casa y en su propio Netflix.

## Problema que resuelve

Rave cerró y con él la forma que tenía una pareja a distancia de ver algo a la
vez desde el iPhone. Las alternativas que quedan no sirven para este caso:

- **Teleparty** es una extensión de Chrome de escritorio. En el iPhone no existe.
- **Compartir pantalla** por FaceTime o Discord da negro: el DRM lo impide.
- **Contar «tres, dos, uno» por WhatsApp** falla por uno o dos segundos, que es
  justo lo que rompe la sensación de estar viéndolo juntos.

El contenido con DRM **no se puede reproducir ni controlar desde una web**. Lo
que sí se puede es sincronizar a las dos personas con precisión de milisegundos
y llevar la cuenta de por dónde va cada una. Eso es lo que hace Juntos.

## Usuarios

| Perfil | Qué necesita | Qué le frustra hoy |
|--------|--------------|--------------------|
| Pareja a distancia, dos iPhone | Empezar la peli a la vez sin pelearse con la cuenta atrás por WhatsApp | Que se desfasan y no hay forma limpia de reencontrarse |
| La misma pareja, desde el portátil | Que Netflix vaya sincronizado de verdad, sin tocar nada | Teleparty va, pero es otra cuenta y otro chat |
| La misma pareja, cualquier noche | Comentar la peli mientras pasa | Tener que abrir una llamada aparte |

## Alcance

**Dentro:**
- Sala privada para dos, con código y PIN. Sin cuentas ni correos.
- **Sincronización automática** de lo que se puede incrustar (YouTube, archivos
  de vídeo): play, pausa y saltos compartidos, con corrección de deriva.
- **Extensión de escritorio** que hace lo mismo con Netflix, Prime, Disney+ y
  Max, metiéndose dentro de su página.
- **Modo asistido** para Netflix en el iPhone, donde nada de lo anterior es
  posible: reloj compartido, cuenta atrás simultánea y timecode común.
- **Chat de voz** entre los dos, punto a punto.
- Chat de texto, reacciones flotantes y presencia.
- Lista de «qué vemos» con elección al azar.
- Instalable en iOS desde Safari.

**Fuera (explícitamente):**
- **Reproducir contenido con DRM dentro de la web.** Imposible, y no se va a
  intentar rodear. Para eso está la extensión, que es el camino legítimo.
- Guardar o pedir las credenciales de Netflix. Nunca.
- Vídeo de las dos personas: la voz sí, la cámara no.
- Salas de más de dos. Nada lo impide técnicamente, pero no es el objetivo.
- Cuentas, perfiles, notificaciones push, histórico de lo visto.
- Publicar la extensión en la Chrome Web Store: se carga descomprimida.

## Criterios de éxito

- [x] Con YouTube o la extensión: uno le da al play y al otro le arranca **solo**.
- [x] Una deriva de 3 segundos se corrige sola en menos de 2, sin tirones.
- [x] Los dos móviles arrancan la cuenta atrás con menos de 100 ms de diferencia.
- [x] Se puede hablar mientras se ve, sin abrir otra app.
- [x] Entrar en la sala son dos datos: código y PIN. Sin registro.
- [ ] Lo usan dos noches seguidas sin abrir WhatsApp para coordinarse.

## Estado actual

`MVP` — funciona de punta a punta y está listo para desplegar.

## Stack

Ver [`STACK.md`](STACK.md).

## Restricciones

- **Presupuesto:** cero. Tiene que caber en los planes gratuitos de Vercel y Upstash.
- **Plazo:** ninguno. Es un proyecto personal.
- **Técnicas:** iOS Safari es el navegador principal. No hay app nativa, no hay
  extensión de navegador, no hay servidor propio con estado.
- **Legales:** no se toca el DRM, no se redistribuye contenido, no se guardan
  credenciales de terceros. La app no sabe ni le importa qué estáis viendo.

## Enlaces

| Recurso | URL |
|---------|-----|
| Repositorio | https://github.com/stexc7/ai-project-starter |
| Producción | *(pendiente: la URL de Vercel al desplegar)* |
| Guía de la app | [`../docs/JUNTOS.md`](../docs/JUNTOS.md) |
| Cómo desplegarla | [`../docs/runbooks/deployment.md`](../docs/runbooks/deployment.md) |

## Glosario

Ver [`GLOSSARY.md`](GLOSSARY.md).
