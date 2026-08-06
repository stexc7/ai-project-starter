# Política de seguridad

> Este documento es la política **pública** de reporte de vulnerabilidades.
> El contexto de seguridad interno para las IAs está en [`.ai/SECURITY.md`](.ai/SECURITY.md);
> el checklist operativo, en [`docs/standards/SECURITY_CHECKLIST.md`](docs/standards/SECURITY_CHECKLIST.md).

---

## Versiones soportadas

| Versión | Soporte de seguridad |
|---------|----------------------|
| `1.x`   | ✅ |
| `< 1.0` | ❌ |

## Cómo reportar una vulnerabilidad

**No abras un issue público.** Un issue público expone el fallo a cualquiera antes
de que exista un parche.

Usa una de estas vías:

1. **GitHub Security Advisories** (preferido)
   Pestaña *Security* → *Report a vulnerability*.

2. **Correo**
   `<correo de seguridad>`

### Qué incluir

- Tipo de vulnerabilidad
- Archivo o componente afectado
- Pasos de reproducción
- Impacto: qué consigue un atacante
- Versión afectada
- Prueba de concepto, si la tienes (sin causar daño a datos reales)

### Qué esperar

| Momento | Qué pasa |
|---------|----------|
| 48 h | Confirmación de recepción |
| 7 días | Evaluación inicial y severidad asignada |
| 30 días | Parche o plan con fechas |
| Tras el parche | Crédito público, si lo deseas |

## Divulgación responsable

Te pedimos que:

- Nos des un plazo razonable para publicar el parche antes de divulgarlo.
- No accedas, modifiques ni elimines datos que no sean tuyos.
- No degrades el servicio (nada de DoS ni pruebas de carga).
- No hagas ingeniería social sobre usuarios o personal.
- Te limites a los sistemas del proyecto.

Nos comprometemos a:

- Responder en los plazos indicados.
- Mantenerte informado del progreso.
- Darte crédito si lo quieres.
- No emprender acciones legales por investigación de buena fe conforme a esta política.

## Fuera de alcance

- Ataques que requieren acceso físico al dispositivo
- Ingeniería social
- Vulnerabilidades en dependencias de terceros ya reportadas públicamente
  (repórtalas al proyecto correspondiente)
- Ausencia de cabeceras HTTP sin un impacto demostrable
- Autocompletado de contraseñas activado en formularios
- Resultados de escáneres automáticos sin verificación manual

## Prácticas de seguridad de este proyecto

- Escaneo de secretos en cada PR ([`.github/workflows/security.yml`](.github/workflows/security.yml))
- Auditoría de dependencias semanal
- Actualizaciones automáticas vía Dependabot
- Vulnerabilidades críticas y altas bloquean el merge
- Checklist de seguridad en toda revisión que toque datos o autenticación

## Para agentes de IA

Si encuentras una vulnerabilidad mientras trabajas en este repositorio:

1. **No** la publiques en un issue público.
2. **No** subas un exploit funcional.
3. Anótala en `.ai/BUGS.md` con severidad S0/S1 y descripción mínima.
4. Avisa al humano de inmediato.

Ver [`.agents/security.md`](.agents/security.md).
