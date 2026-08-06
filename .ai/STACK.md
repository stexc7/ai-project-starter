# STACK.md — Tecnologías del proyecto

> Una IA que no sabe el stack genera código de otro stack. Rellena esto pronto.

**Última revisión:** `<AAAA-MM-DD>`

---

## Resumen

| Capa | Tecnología | Versión | Por qué |
|------|-----------|---------|---------|
| Lenguaje (backend) | | | |
| Framework (backend) | | | |
| Lenguaje (frontend) | | | |
| Framework (frontend) | | | |
| Base de datos | | | |
| Caché | | | |
| Cola / mensajería | | | |
| Autenticación | | | |
| Tests | | | |
| Linter / formateador | | | |
| Empaquetado | | | |
| CI/CD | | | |
| Hosting | | | |
| Observabilidad | | | |

## Versiones exigidas

```
<runtime>  <versión mínima>
<gestor de paquetes>  <versión>
```

> Fija las versiones. "La última" no es una versión.

## Puesta en marcha

```bash
# 1. Clonar
git clone <url>
cd <proyecto>

# 2. Variables de entorno
cp .env.example .env
# rellenar .env

# 3. Dependencias
<comando>

# 4. Base de datos
<migraciones / seed>

# 5. Arrancar
<comando>
```

Debería quedar funcionando en `http://localhost:<puerto>`.

## Variables de entorno

| Variable | Obligatoria | Ejemplo | Para qué |
|----------|-------------|---------|----------|
| | | | |

> Los valores reales **nunca** van aquí. Solo en `.env`, que no se commitea.

## Convenciones del stack

<Cosas propias de estas tecnologías que una IA debe respetar: estructura de
carpetas del framework, forma de las migraciones, convención de nombres de rutas...>

- 

## Lo que este proyecto **no** usa

> Evita que una IA introduzca algo que ya se descartó.

| Tecnología | Por qué no |
|------------|------------|
| | |
