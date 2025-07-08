# sgisi-web-app
Web app para gestión de incidentes de seguridad con MFA, RBAC y cifrado AES-256. Stack: React + Supabase. Alineado a ISO/IEC 27035 y NIST SP 800-53.

# SGISI - Sistema de Gestión de Incidentes de Seguridad Informática  

**Aplicación web segura** para la gestión integral del ciclo de vida de incidentes de seguridad, desarrollada bajo estándares **ISO/IEC 27035** y **NIST SP 800-53**.  

## 🔐 Características Clave  
- **Autenticación MFA** (TOTP/OAuth) con Supabase Auth.  
- **Gestión de incidentes** con estados personalizables (Nuevo → Cerrado).  
- **Cifrado AES-256** para evidencias adjuntas (hasta 50 MB).  
- **Control de acceso RBAC** (CISO, Analista, Usuario) mediante Row-Level Security (RLS).  
- **Dashboard interactivo** con métricas clave (MTTR, MTTD).  

## 🛠️ Stack Tecnológico  
- **Frontend**: React 18 + TypeScript, Material-UI, Formik/Yup.  
- **Backend**: Supabase (PostgreSQL, Auth, Storage), Redis (rate-limiting).  
- **Seguridad**: Validación Zod, JWT short-lived, OWASP Top 10 mitigado.

## 📌 Requisitos
- Node.js v18+
- PostgreSQL 15+
- Supabase CLI

## 🚀 Instalación
1. Clonar repositorio.
2. Configurar `.env` (ver `.env.example`).
3. Ejecutar `supabase start` (backend) y `npm run dev`(frontend).

## Flujo de Trabajo

```mermaid
graph TD  
    A[Clonar Repo] --> B[Configurar .env]  
    B --> C[Backend: supabase start]  
    B --> D[Frontend: npm run dev]  
    C --> E[Probar Edge Functions]  
    D --> F[Desarrollar componentes]  
    E & F --> G[Integrar y revisar PRs]

## 📄 Documentación  
- [Arquitectura](/docs/ARCHITECTURE.md)
- [API Reference](/docs/API_REFERENCE.md)
- [Checklist de Seguridad](/docs/SECURITY.md)