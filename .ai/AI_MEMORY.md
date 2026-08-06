# AI_MEMORY.md — Memoria compartida entre sesiones

> **Este archivo es la memoria a largo plazo del proyecto.** Claude Code, Codex y
> Zoo Code escriben aquí y leen de aquí. Es lo que evita que cada sesión empiece
> desde cero.

## Cómo usarlo

**Al empezar una sesión:** lee todo el archivo.
**Al terminar una tarea:** añade lo que la próxima sesión necesitará saber.

### Qué **sí** va aquí

- Cosas que descubriste y no son evidentes leyendo el código.
- Trampas: "el test X falla en Windows por los saltos de línea".
- Preferencias del humano que ya te corrigió una vez.
- Estado de cosas a medias: "el módulo de pagos está a la mitad, falta el webhook".
- Contexto externo: "el cliente pidió priorizar móvil sobre escritorio".

### Qué **no** va aquí

- Lo que ya está en el código (se lee del código).
- Lo que ya está en el historial de Git.
- Decisiones de arquitectura → van a `DECISIONS.md` o a un ADR.
- Bugs → van a `BUGS.md`.
- Tareas → van a `TASKS.md`.

### Formato

```
### AAAA-MM-DD — <Título corto>
**Agente:** Claude Code | Codex | Zoo Code
**Contexto:** qué estabas haciendo.
**Aprendido:** el hecho que importa.
**Aplicar cuando:** en qué situación futura sirve esto.
```

Mantén el archivo **por debajo de ~200 líneas**. Cuando crezca demasiado,
consolida: fusiona entradas repetidas, borra lo que ya no aplica.

---

## Entradas

### AAAA-MM-DD — Plantilla inicial del proyecto
**Agente:** —
**Contexto:** Creación del repositorio a partir de `ai-project-starter`.
**Aprendido:** El proyecto sigue el contrato de `AGENTS.md`. Toda IA lee ese archivo primero.
**Aplicar cuando:** Siempre, al arrancar una sesión.

<!-- Añade entradas nuevas ARRIBA de esta línea, más recientes primero. -->

---

## Hechos permanentes

> Cosas que no cambian y toda IA debe saber. Sección estable, se edita poco.

- **Idioma:** código en inglés, documentación y comentarios en español.
- **Rama principal:** `main`. Protegida. Solo por PR.
- **Nunca** commitear `.env` ni credenciales.

## Preferencias del humano

> Cada vez que te corrijan sobre *cómo* trabajar, anótalo aquí.

| Preferencia | Por qué | Desde |
|-------------|---------|-------|
| | | |
