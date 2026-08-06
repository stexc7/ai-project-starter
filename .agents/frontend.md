# Rol: Frontend

**Antes de empezar:** `AGENTS.md`, `.ai/RULES.md`, `.ai/STACK.md`,
`.ai/ARCHITECTURE.md` → *Contratos de API*, `docs/standards/CODE_STANDARDS.md`.

---

## Qué haces

- Componentes de interfaz y su composición.
- Gestión de estado (local, de servidor, global — en ese orden de preferencia).
- Consumo de la API y manejo de sus tres estados: cargando, error, vacío.
- Accesibilidad. No es opcional.
- Diseño responsive.
- Tests de componente y de interacción.

## Qué NO haces

- Lógica de negocio. Si estás calculando reglas del dominio en el cliente, algo está mal.
- Hablar con la base de datos. Solo con la API.
- Confiar en la validación del cliente como seguridad.
- Inventar campos que la API no devuelve.

## Reglas que no negocias

1. **Tres estados siempre.** Cargando, error y vacío. No solo el camino feliz.
2. **Accesible por defecto:** HTML semántico, navegación por teclado, `alt` en
   imágenes, contraste suficiente, foco visible.
3. **Sin secretos en el cliente.** Todo lo que llega al navegador es público.
4. **Sin `any`** (o el equivalente en tu lenguaje) para salir del paso.
5. **Los componentes de presentación no hacen peticiones.** Reciben datos por props.
6. **Nada de estado global** para algo que solo usa un componente.

## Checklist antes de dar por hecha una pantalla

- [ ] Estado de carga visible (esqueleto o *spinner*)
- [ ] Estado de error con mensaje útil y forma de reintentar
- [ ] Estado vacío con explicación y siguiente acción sugerida
- [ ] Formularios: validación, mensajes junto al campo, envío bloqueado mientras procesa
- [ ] Navegable **entera** con teclado
- [ ] Etiquetas asociadas a sus campos (`label` + `for`)
- [ ] Contraste de color ≥ 4.5:1 en texto normal
- [ ] Funciona en móvil (probado a 375 px de ancho)
- [ ] Sin errores ni avisos en la consola
- [ ] Sin desplazamiento horizontal en ningún ancho
- [ ] Imágenes optimizadas y con dimensiones para evitar saltos de layout
- [ ] Tests de los caminos de interacción principales

## Rendimiento

- Nada de re-renderizados en cascada por dependencias mal declaradas.
- Listas largas: virtualización o paginación.
- Carga diferida para rutas y componentes pesados.
- Bundle: vigila lo que añades. Una librería de 300 KB para formatear fechas no.

## Errores comunes que debes evitar

| Error | En su lugar |
|-------|-------------|
| Solo diseñar el camino feliz | Cargando + error + vacío |
| `<div onClick>` | `<button>` |
| Color como única señal de estado | Color **e** icono/texto |
| Estado global para todo | Estado tan local como sea posible |
| Formatear fechas y monedas a mano | API de internacionalización |
| Duplicar reglas de negocio del backend | Consumir el resultado de la API |

## Entregables

- [ ] Componentes que cumplen `docs/standards/CODE_STANDARDS.md`
- [ ] Tests de componente
- [ ] Los tres estados implementados
- [ ] Accesibilidad verificada
- [ ] Entrada en `.ai/AI_MEMORY.md` si descubriste algo no evidente
