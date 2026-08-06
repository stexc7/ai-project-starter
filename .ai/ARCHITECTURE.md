# ARCHITECTURE.md — Cómo está construido

> Este archivo responde a *"¿dónde va este código?"* y *"¿por qué está así?"*.
> Manténlo al día: una arquitectura documentada que ya no coincide con la realidad
> es peor que no tener ninguna.

**Última revisión:** `<AAAA-MM-DD>`

---

## Vista general

```
<Diagrama de bloques. ASCII está bien. Mermaid también.>

  Cliente ──▶ API ──▶ Servicio ──▶ Repositorio ──▶ Base de datos
                │
                └──▶ Cola ──▶ Worker
```

## Decisiones estructurales

| Decisión | Elección | Por qué | ADR |
|----------|----------|---------|-----|
| Estilo de arquitectura | | | |
| Base de datos | | | |
| Autenticación | | | |
| Comunicación entre servicios | | | |

> Cada fila con consecuencias reales merece un ADR en `docs/adr/`.

## Estructura de carpetas

```
backend/
  src/
    domain/        # Entidades y reglas de negocio. Sin dependencias externas.
    application/   # Casos de uso. Orquesta el dominio.
    infrastructure/# BD, HTTP, colas, ficheros. Todo lo que toca el mundo exterior.
    interfaces/    # Controladores, DTOs, validación de entrada.
frontend/
  src/
    components/    # Componentes de presentación. Sin lógica de negocio.
    features/      # Una carpeta por funcionalidad. Cohesión alta.
    lib/           # Utilidades compartidas.
    api/           # Cliente HTTP y tipos de la API.
```

## Reglas de dependencia

> La regla más importante del archivo. Las flechas apuntan **hacia dentro**.

- `domain` no importa nada de `application`, `infrastructure` ni `interfaces`.
- `application` puede importar `domain`. Nada más.
- `infrastructure` implementa interfaces definidas en `domain`/`application`.
- El `frontend` nunca conoce el esquema de la base de datos. Solo la API.

Romper una de estas reglas requiere un ADR que lo justifique.

## Flujos principales

### Flujo: `<nombre>`

1. 
2. 
3. 

## Modelo de datos

| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| | | |

## Contratos de API

<Enlace a OpenAPI/Swagger, o resumen de los endpoints principales.>

| Método | Ruta | Qué hace | Auth |
|--------|------|----------|------|
| | | | |

## Puntos de integración externos

| Servicio | Para qué | Qué pasa si se cae |
|----------|----------|--------------------|
| | | |

## Rendimiento y escala

- Carga esperada: 
- Cuellos de botella conocidos: 
- Estrategia de caché: 

## Deuda técnica conocida

> Sé honesto aquí. La deuda no documentada se convierte en sorpresa.

| Qué | Por qué existe | Impacto | Cuándo se paga |
|-----|----------------|---------|----------------|
| | | | |
