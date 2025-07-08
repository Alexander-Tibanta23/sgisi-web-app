# Backend SGISI

Guía para desarrollo y despliegue del backend (Supabase, funciones edge, migraciones SQL).

## Estructura
- `/migrations`: Scripts SQL para tablas, RLS, triggers.
- `/functions`: Edge Functions (TypeScript).
- `.env`: Variables de entorno Supabase.

## Requisitos
- Supabase CLI
- Node.js >= 18

## Comandos útiles
```sh
# Iniciar Supabase local
supabase start

# Ejecutar migraciones
supabase db push
```