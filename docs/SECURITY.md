# Checklist de Seguridad SGISI

- OWASP Top 10
- RBAC
- Auditoría


### **3. `SECURITY.md` (Checklist)**  
```markdown
# Checklist de Seguridad  

## Backend  
- [ ] Validar JWT en todas las Edge Functions.  
- [ ] Asegurar RLS en todas las tablas.  
- [ ] Usar `pg_crypto` para campos sensibles.  

## Frontend  
- [ ] Sanitizar inputs con Zod/Formik.  
- [ ] Deshabilitar `dangerouslySetInnerHTML`.  
- [ ] Headers CSP en `vite.config.ts`.  