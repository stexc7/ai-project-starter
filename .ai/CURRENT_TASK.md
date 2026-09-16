# CURRENT_TASK.md — La tarea de ahora mismo

---

## Tarea activa

**ID:** `TASK-005`
**Título:** Juntos — watch party para dos, sincronizado y desplegable en Vercel
**Estado:** `en revisión`
**Agente asignado:** Claude Code
**Rama:** `claude/netflix-watch-party-app-1v4ud0`
**Iniciada:** 2026-09-16

### Objetivo

Que dos personas en dos casas puedan empezar la misma película en el mismo
instante desde sus iPhone, y recuperar el sincronismo solas cuando se pierda,
sin coordinarse por WhatsApp.

### Criterios de aceptación

- [x] Sala privada para dos con código y PIN, sin cuentas ni correos.
- [x] **Sincronización automática** con YouTube y archivos: play, pausa y saltos
      compartidos sin que nadie coordine nada.
- [x] **Corrección de deriva** automática: los vídeos no se separan solos.
- [x] **Extensión de escritorio** que hace lo mismo con Netflix y compañía.
- [x] **Modo asistido** para Netflix en iPhone: reloj común, cuenta atrás
      simultánea y timecode compartido.
- [x] **Chat de voz** entre los dos.
- [x] Chat, reacciones y presencia.
- [x] Instalable en el iPhone desde Safari.
- [x] Lint, tipos, tests (103) y build en verde.
- [x] Desplegable en Vercel con un runbook que se pueda seguir sin preguntar.

### Archivos tocados

```
app/                  páginas y API
src/domain/           lógica pura: ancla, reloj, corrector, fuentes
src/server/           almacén, sesión, validación
src/ui/               componentes de React, adaptadores de reproductor, voz
extension/            extensión MV3 para Netflix, Prime, Disney+, Max
tests/                103 tests
scripts/generate-icons.mjs
docs/JUNTOS.md, docs/runbooks/deployment.md, docs/adr/0002-*.md
.ai/*                 contexto del proyecto
.github/workflows/ci.yml
```

### Fuera de alcance en esta tarea

- Reproducir contenido con DRM dentro de la web: imposible. Para eso, la extensión.
- Vídeo (cámara) entre las dos personas. La voz sí está.
- Salas de más de dos.
- Publicar la extensión en la Chrome Web Store.
- Tests de navegador automatizados en el CI (se validó a mano con Playwright).

---

## Progreso

| Paso | Estado | Nota |
|------|--------|------|
| Delimitar qué es posible con DRM en iOS | Hecho | Condiciona el diseño entero: ver ADR-0002 |
| Lógica de sincronización (ancla + reloj NTP) | Hecho | `src/domain/`, 67 tests |
| API y almacén | Hecho | Upstash por REST con CAS; memoria en local |
| Interfaz | Hecho | Validada con dos contextos de Playwright a la vez |
| Adaptadores de reproductor y corrector de deriva | Hecho | Deriva de 2,9 s corregida a 0,15 s en 1,4 s |
| Chat de voz (WebRTC) | Hecho | Conecta en ~3 s, audio en los dos sentidos |
| Extensión de escritorio | Hecho | Probada contra un `netflix.com` interceptado |
| Documentación y runbook | Hecho | `docs/JUNTOS.md`, `deployment.md`, ADR-0002 |
| Despliegue real en Vercel | **Pendiente del humano** | Hacen falta las cuentas: ver bloqueos |

## Bloqueos

| Qué bloquea | Quién lo desbloquea | Desde |
|-------------|---------------------|-------|
| Crear la base de datos en Upstash y poner las 3 variables en Vercel | El humano (son sus cuentas) | 2026-09-16 |

---

## Al terminar

- [x] Tests en verde
- [x] `.ai/TASKS.md` actualizado
- [x] `.ai/AI_MEMORY.md` actualizado
- [x] `.ai/CHANGELOG.md` actualizado
- [ ] PR abierto — **solo si el humano lo pide**
- [ ] Este archivo reseteado con la siguiente tarea de `TASKS.md`
