# TASKS.md — Backlog

> El backlog completo. `CURRENT_TASK.md` toma **una** tarea de aquí a la vez.
>
> Prioridad: `P0` bloquea todo · `P1` sprint actual · `P2` siguiente · `P3` algún día.

---

## 🔴 En progreso

| ID | Tarea | Prioridad | Agente | Rama |
|----|-------|-----------|--------|------|
| TASK-005 | Juntos — watch party para dos | P0 | Claude Code | `claude/netflix-watch-party-app-1v4ud0` |

---

## 📋 Listo para empezar

| ID | Tarea | Prioridad | Estimación | Depende de |
|----|-------|-----------|------------|------------|
| TASK-006 | Desplegar en Vercel y anotar la URL en `PROJECT.md` | P1 | 15 min | Cuentas de Vercel y Upstash |
| TASK-007 | Usarla dos noches y apuntar qué estorba | P1 | — | TASK-006 |

---

## 🧊 Backlog

| ID | Tarea | Prioridad | Nota |
|----|-------|-----------|------|
| TASK-008 | Botón «lo mismo que ayer»: retomar el título y el minuto de la última sesión | P2 | Ya se guarda todo lo necesario en la sala |
| TASK-009 | Aviso al entrar si la otra persona lleva rato conectada esperando | P2 | Con la presencia que ya existe |
| TASK-010 | Tests de navegador automatizados con Playwright | P2 | Ahora la UI se valida a mano |
| TASK-011 | Marcar el desfase sin teclear el minuto: botón «ya» al pasar una escena | P3 | Idea sin cocinar |
| TASK-012 | Capítulos de serie: pasar al siguiente sin volver a poner el título | P3 | |
| TASK-013 | Servidor TURN si la llamada falla en redes móviles | P2 | Hoy solo hay STUN; se avisa cuando no conecta |
| TASK-014 | Más adaptadores de reproductor: Vimeo, Twitch, Dailymotion | P3 | Es un archivo por servicio, sin tocar la sincronización |
| TASK-015 | Probar la extensión contra Prime Video y Disney+ de verdad | P2 | Están en el manifiesto pero solo se ha verificado Netflix |

---

## 🚧 Bloqueadas

| ID | Tarea | Qué la bloquea | Desde |
|----|-------|----------------|-------|
| TASK-006 | Desplegar en Vercel | Hacen falta las cuentas del humano | 2026-09-16 |

---

## ✅ Hecho

| ID | Tarea | Cerrada | PR |
|----|-------|---------|-----|
| TASK-001 | Rellenar `.ai/PROJECT.md` con el proyecto real | 2026-09-16 | — |
| TASK-002 | Definir el stack en `.ai/STACK.md` | 2026-09-16 | — |
| TASK-003 | Dibujar la arquitectura en `.ai/ARCHITECTURE.md` | 2026-09-16 | — |
| TASK-004 | Adaptar el CI al stack | 2026-09-16 | — |

---

## 💡 Detectado al paso

| Qué | Dónde | Detectado por | Fecha |
|-----|-------|---------------|-------|
| `REACTION_TTL_MS` (room.ts) y `REACTION_VISIBLE_MS` (sync.ts) deben valer lo mismo y nada lo comprueba | `src/domain/` | Claude Code | 2026-09-16 |
| El sondeo a 2 s hace que una pausa del otro tarde hasta 2 s en verse. Se nota poco, pero se nota | `src/domain/sync.ts` | Claude Code | 2026-09-16 |
| El bloqueo por intentos de PIN es por sala: alguien con el código puede dejarla bloqueada 15 min | `app/api/rooms/[code]/join` | Claude Code | 2026-09-16 |
| `docs/process/` y las plantillas de Scrum sobran para un proyecto de una persona | `docs/process/` | Claude Code | 2026-09-16 |
