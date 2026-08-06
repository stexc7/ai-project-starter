# Checklist de seguridad

> Se repasa antes de cerrar cualquier cambio que toque autenticación, datos de
> usuario, dinero o entradas externas.
>
> El contexto de qué es sensible **en este proyecto** está en `.ai/SECURITY.md`.

---

## 1. Autorización — el fallo número uno

- [ ] Cada endpoint que recibe un ID verifica que el recurso **pertenece al usuario
      autenticado**, no solo que hay sesión

```
GET /api/invoices/1042     ← usuario A, su factura, OK
GET /api/invoices/1043     ← usuario A pidiendo la de usuario B
                             ¿devuelve datos? → brecha
```

- [ ] Los permisos se verifican en el **servidor**, no ocultando botones en la UI
- [ ] Los roles se comprueban por acción, no solo al entrar
- [ ] En sistemas multi-inquilino: toda consulta filtra por el inquilino del usuario

## 2. Inyección

- [ ] SQL: consultas parametrizadas. **Cero** concatenación de entrada de usuario
- [ ] NoSQL: los operadores del usuario no llegan al motor sin filtrar
- [ ] Comandos: nada de pasar entrada a shell. Si es inevitable, lista blanca estricta
- [ ] Rutas de archivo: entrada normalizada y validada contra `../`
- [ ] Plantillas: sin renderizar plantillas construidas con entrada de usuario

## 3. XSS y renderizado

- [ ] Toda salida se escapa por defecto
- [ ] Sin `innerHTML` / `dangerouslySetInnerHTML` con datos de usuario
- [ ] Si hay HTML de usuario, se sanea con una librería probada (lista blanca)
- [ ] Content-Security-Policy configurada

## 4. Autenticación

- [ ] Contraseñas con hash lento y con sal (`argon2`, `bcrypt`, `scrypt`)
- [ ] **Nunca** MD5 ni SHA1 para contraseñas
- [ ] Límite de intentos de login
- [ ] Los tokens caducan y se puede revocarlos
- [ ] El refresh de token valida la expiración, no solo la firma
- [ ] Cierre de sesión invalida el token en el servidor
- [ ] Comparación de secretos en tiempo constante
- [ ] Cookies con `HttpOnly`, `Secure`, `SameSite`

## 5. Secretos

- [ ] Sin claves, tokens ni contraseñas en el código
- [ ] Sin secretos en el YAML de CI
- [ ] `.env` en `.gitignore`; `.env.example` con valores falsos
- [ ] Sin secretos en el historial de Git (revisa, no solo el estado actual)
- [ ] Sin secretos en logs, mensajes de error ni trazas
- [ ] Rotación definida

## 6. Validación de entrada

- [ ] Validada **en el servidor**, siempre
- [ ] Tipo, rango, longitud máxima, formato
- [ ] Lista blanca, no lista negra
- [ ] Tamaño máximo de cuerpo de petición
- [ ] Subida de archivos: tipo verificado por contenido (no por extensión), tamaño
      limitado, almacenados fuera del directorio web, nombre saneado

## 7. Exposición de datos

- [ ] La API devuelve DTOs, no entidades completas
- [ ] Sin hashes de contraseña, tokens internos ni IDs de otros usuarios en respuestas
- [ ] Errores en producción sin traza de pila
- [ ] Sin PII en logs (correo, teléfono, documento, dirección, tarjeta)
- [ ] Sin PII en URLs ni parámetros de consulta

## 8. Límite de tasa

- [ ] Login, registro, recuperación de contraseña
- [ ] Envío de correo o SMS
- [ ] Endpoints computacionalmente caros
- [ ] API pública en general

## 9. Criptografía

- [ ] Algoritmos vigentes (AES-GCM, ChaCha20-Poly1305)
- [ ] IV/nonce único por operación
- [ ] Generador aleatorio criptográfico (no `Math.random()`)
- [ ] TLS en todas las conexiones; validación de certificado **activada**
- [ ] Sin criptografía casera

## 10. Dependencias

- [ ] Auditoría automática en CI
- [ ] Sin CVEs críticos ni altos
- [ ] Dependencias nuevas justificadas en `.ai/DECISIONS.md`
- [ ] Versiones fijadas (*lockfile* commiteado)

## 11. Configuración

- [ ] Modo debug desactivado en producción
- [ ] CORS restringido a orígenes concretos (nunca `*` con credenciales)
- [ ] Cabeceras: `Strict-Transport-Security`, `X-Content-Type-Options`,
      `X-Frame-Options`, `Content-Security-Policy`
- [ ] Directorios y buckets no públicos
- [ ] Puertos de administración cerrados al exterior

## 12. Registro y auditoría

- [ ] Se registran: inicios de sesión, cambios de permisos, accesos a datos
      sensibles, operaciones de dinero
- [ ] Los logs no contienen los datos sensibles en sí
- [ ] Los logs se conservan y no se pueden alterar

---

## Prohibido para desbloquearse

Ninguna de estas cosas se hace "temporalmente":

- Desactivar verificación TLS
- CORS en `*`
- Silenciar una regla del linter de seguridad
- Hacer público un bucket o directorio
- Loguear la petición completa "para depurar"
- Commitear un `.env`
- Ampliar permisos a `777`

Si parece necesario, **para y pregunta**.

## Si encuentras algo

1. **No** lo publiques en un issue abierto
2. **No** subas un exploit funcional al repositorio
3. Anótalo en `.ai/BUGS.md` con severidad S0/S1 y descripción mínima
4. Avisa al humano de inmediato
