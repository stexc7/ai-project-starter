# Prompt: Auditoría de seguridad

---

```
Adopta el rol de .agents/security.md.

CONTEXTO:
- .ai/SECURITY.md
- docs/standards/SECURITY_CHECKLIST.md
- .ai/ARCHITECTURE.md

ALCANCE DE LA AUDITORÍA:
<diff, módulo, endpoint o "toda la rama frente a main">

---

INSTRUCCIONES:

Revisa en este orden, del fallo más frecuente al menos frecuente:

1. AUTORIZACIÓN POR OBJETO
   Para CADA endpoint que reciba un identificador: ¿verifica que el recurso
   pertenece al usuario autenticado, o solo que hay sesión?
   Este es el fallo número uno. Míralo primero.

2. INYECCIÓN
   SQL, NoSQL, comandos de shell, rutas de archivo, LDAP, plantillas.
   Busca concatenación de entrada de usuario en cualquiera de ellos.

3. XSS Y RENDERIZADO
   HTML sin escapar, innerHTML, dangerouslySetInnerHTML, plantillas sin escape.

4. SECRETOS
   Claves, tokens, contraseñas o cadenas de conexión en código, config o logs.
   Revisa también el historial del diff, no solo el estado final.

5. VALIDACIÓN DE ENTRADA
   ¿Se valida en el SERVIDOR? ¿Tipos, rangos, longitudes máximas, formato?

6. EXPOSICIÓN DE DATOS
   ¿Se devuelven campos internos, hashes, IDs de otros usuarios, trazas de error?

7. LÍMITE DE TASA
   Login, registro, recuperación de contraseña, envío de correo, endpoints caros.

8. CRIPTOGRAFÍA
   Algoritmos obsoletos (MD5, SHA1 para contraseñas), IV reutilizado,
   aleatoriedad no criptográfica, comparación de secretos sin tiempo constante.

9. DEPENDENCIAS
   CVEs conocidos en lo que se añadió o actualizó.

10. CONFIGURACIÓN
    Debug activo, CORS permisivo, cabeceras de seguridad ausentes, cookies
    sin HttpOnly/Secure/SameSite.

---

PARA CADA HALLAZGO, dame:
- Ubicación exacta (archivo:línea)
- Qué está mal
- CÓMO SE EXPLOTA — el escenario concreto. Si no puedes describirlo, no es
  un hallazgo confirmado: márcalo como "sospecha, requiere verificación".
- Impacto real (qué consigue el atacante)
- Corrección propuesta

NO escribas exploits funcionales.
NO reportes riesgos teóricos sin vector de ataque como si fueran críticos.

FORMATO:

## Auditoría de seguridad: <alcance>
**Fecha:** <fecha>

### 🔴 Crítico — bloquea despliegue
| # | Hallazgo | Ubicación | Explotación | Corrección |

### 🟠 Alto
### 🟡 Medio
### 🔵 Informativo

### Revisado y correcto
<Qué comprobaste que está bien. Delimita el alcance.>

### No cubierto por esta auditoría
<Sé honesto sobre los límites de lo que miraste.>
```

---

**Recordatorio:** un hallazgo crítico no se publica en un issue abierto. Va a
`.ai/BUGS.md` con severidad S0 y se avisa al humano directamente.
