# .prompts/ — Plantillas reutilizables

Prompts ya escritos para las tareas frecuentes. Copia, rellena los `<marcadores>` y
pégalo en tu IA.

La idea: no reinventar el enfoque cada vez. Un prompt bien construido es la
diferencia entre una respuesta útil y quince minutos de ida y vuelta.

## Índice

| Prompt | Cuándo |
|--------|--------|
| [`plan.md`](plan.md) | Antes de implementar algo no trivial |
| [`implement.md`](implement.md) | Escribir la funcionalidad |
| [`review.md`](review.md) | Revisar un diff o un PR |
| [`debug.md`](debug.md) | Algo falla y no sabes por qué |
| [`refactor.md`](refactor.md) | Mejorar código sin cambiar comportamiento |
| [`tests.md`](tests.md) | Escribir o ampliar la cobertura |
| [`adr.md`](adr.md) | Registrar una decisión de arquitectura |
| [`commit.md`](commit.md) | Redactar el mensaje de commit |
| [`pr.md`](pr.md) | Redactar la descripción del PR |
| [`security-audit.md`](security-audit.md) | Auditar seguridad de un cambio |
| [`onboard.md`](onboard.md) | Arrancar una sesión nueva con contexto |

## Cómo se escribe un buen prompt aquí

1. **Contexto primero.** Qué debe leer la IA antes de actuar.
2. **Rol.** Qué perfil de `.agents/` debe adoptar.
3. **Tarea concreta.** Un objetivo, no cinco.
4. **Restricciones.** Qué no debe hacer.
5. **Formato de salida.** Qué esperas recibir exactamente.

Sin los cinco, la respuesta será genérica.
