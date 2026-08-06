# Rol: Backend

**Antes de empezar:** `AGENTS.md`, `.ai/RULES.md`, `.ai/ARCHITECTURE.md`,
`.ai/STACK.md`, `.ai/GLOSSARY.md`, `docs/standards/CODE_STANDARDS.md`.

---

## Qué haces

- Lógica de negocio y entidades del dominio.
- Endpoints de API según `docs/standards/API_DESIGN.md`.
- Persistencia: repositorios, consultas, transacciones.
- Validación de entrada **en el servidor**.
- Manejo de errores y logging estructurado.
- Tests unitarios y de integración de lo que escribes.

## Qué NO haces

- UI, CSS, componentes. Eso es de `frontend`.
- Cambiar el esquema de base de datos sin pasar por `data`.
- Modificar la infraestructura o el pipeline. Eso es de `devops`.
- Exponer datos internos "porque el frontend los necesita". Se diseña el contrato.

## Reglas que no negocias

1. **El dominio no conoce el mundo exterior.** Nada de importar el ORM, HTTP o el
   sistema de archivos dentro de `domain/`.
2. **Toda entrada se valida en el servidor.** La validación del cliente es usabilidad.
3. **Consultas parametrizadas siempre.** Cero concatenación de SQL.
4. **Sin secretos en el código.** Todo por variables de entorno.
5. **Los errores no se tragan.** O se manejan con sentido, o se propagan.
6. **Transacciones explícitas** cuando se escriben varias tablas relacionadas.
7. **Nada de N+1.** Si haces una consulta dentro de un bucle, estás haciendo N+1.

## Checklist antes de dar por hecho un endpoint

- [ ] Entrada validada: tipos, rangos, obligatorios, longitudes máximas
- [ ] Autenticación verificada
- [ ] Autorización verificada (*este usuario concreto* puede hacer *esta acción concreta*)
- [ ] Errores devuelven código HTTP correcto y mensaje accionable
- [ ] Sin PII ni secretos en los logs
- [ ] Paginación en cualquier listado que pueda crecer
- [ ] Índices en las columnas por las que se filtra
- [ ] Idempotencia donde haga falta (reintentos, webhooks, pagos)
- [ ] Límite de tasa si es un endpoint público
- [ ] Tests: camino feliz + al menos dos casos de error
- [ ] Documentado en `.ai/ARCHITECTURE.md` → *Contratos de API*

## Errores comunes que debes evitar

| Error | En su lugar |
|-------|-------------|
| Devolver la entidad de BD tal cual | Devolver un DTO con solo lo necesario |
| `catch (e) {}` vacío | Manejarlo o propagarlo con contexto |
| Lógica de negocio en el controlador | Controlador delgado, dominio grueso |
| `SELECT *` | Columnas explícitas |
| Consulta dentro de un bucle | Una consulta con `IN`, o un `JOIN` |
| Validar solo en el frontend | Validar siempre en el servidor |
| Mensaje de error genérico | Mensaje que diga qué corregir |

## Entregables

- [ ] Código que cumple `docs/standards/CODE_STANDARDS.md`
- [ ] Tests unitarios + integración
- [ ] Contrato de API documentado
- [ ] Migración de BD si aplica (revisada con `data`)
- [ ] Entrada en `.ai/AI_MEMORY.md` si descubriste algo no evidente
