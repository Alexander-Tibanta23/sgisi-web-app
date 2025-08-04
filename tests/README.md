# Supabase Jest Testing Setup

Este proyecto contiene pruebas automatizadas para APIs de Supabase usando Jest.

## Configuración

### Variables de entorno
Las siguientes variables están configuradas en el archivo `.env`:

- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_KEY`: Clave anon/public de tu proyecto Supabase  
- `ENCRYPT_KEY`: Clave de encriptación personalizada
- `PORT`: Puerto del servidor (3000)

### Instalación

```bash
npm install
```

### Ejecución de pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con coverage
npm run test:coverage
```

## Estructura de pruebas

### `__tests__/supabase.test.js`
Pruebas básicas de conexión y configuración:
- Verificación de conexión a Supabase
- Validación de variables de entorno
- Pruebas de autenticación básica
- Consultas de base de datos simples
- Operaciones de storage

### `__tests__/supabase-crud.test.js`
Pruebas de operaciones CRUD:
- CREATE: Insertar nuevos registros
- READ: Consultar registros existentes
- UPDATE: Actualizar registros
- DELETE: Eliminar registros
- Consultas avanzadas con filtros y ordenamiento

### `__tests__/supabase-auth.test.js`
Pruebas de autenticación:
- Registro de usuarios
- Inicio y cierre de sesión
- Manejo de tokens de sesión
- Recuperación de contraseña
- Estados de autenticación

## Configuración de archivos

### `supabase.config.js`
Configuración del cliente de Supabase que se reutiliza en todas las pruebas.

### `jest.setup.js`
Configuración global de Jest:
- Carga de variables de entorno
- Timeout extendido para pruebas de API
- Configuración de mocks si es necesario

## Personalización

### Adaptar a tu esquema de base de datos

1. **Modifica las pruebas CRUD** en `supabase-crud.test.js`:
   - Cambia `'users'` por el nombre real de tu tabla
   - Ajusta los campos en los objetos de prueba según tu esquema
   - Actualiza las consultas según tus necesidades

2. **Ajusta las pruebas de autenticación** en `supabase-auth.test.js`:
   - Usa emails de prueba válidos
   - Configura las URLs de redirección según tu aplicación

3. **Personaliza las pruebas básicas** en `supabase.test.js`:
   - Ajusta las consultas a tablas reales de tu base de datos
   - Modifica las pruebas de storage según tus buckets

### Añadir nuevas pruebas

Crea nuevos archivos de prueba en la carpeta `__tests__/` siguiendo el patrón:
- `nombre-funcionalidad.test.js`
- Importa `{ supabase }` desde `../supabase.config`
- Usa `describe()` y `test()` para organizar las pruebas

## Notas importantes

- Las pruebas están configuradas para no fallar si las tablas no existen aún
- Los errores se registran en la consola para facilitar el debugging
- Las operaciones de prueba se limpian automáticamente
- Los timeouts están configurados para 10 segundos para operaciones de red

## Troubleshooting

- **Error de conexión**: Verifica que las variables `SUPABASE_URL` y `SUPABASE_KEY` sean correctas
- **Errores de tabla**: Ajusta los nombres de tabla en las pruebas según tu esquema
- **Errores de autenticación**: Asegúrate de que el registro de usuarios esté habilitado en tu proyecto Supabase
