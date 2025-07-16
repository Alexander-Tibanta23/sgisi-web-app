# SETUP.md - Guía de instalación y comandos útiles para el equipo SGISI (Frontend)

Este documento recopila los comandos y pasos clave para instalar, configurar y solucionar problemas comunes en el desarrollo del frontend de SGISI.

---

## 1. Instalación de dependencias

Desde la carpeta `frontend/`:

```bash
npm install
```

---

## 2. Ejecución en modo desarrollo

```bash
npm start
```

---

## 3. Construcción para producción

```bash
npm run build
```

---

## 4. Limpieza de dependencias y caché (si hay conflictos)

```bash
# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Limpiar caché de npm
npm cache clean --force

# Instalar dependencias nuevamente
npm install
```

---

## 5. Solución a errores de dependencias de TypeScript (ejemplo: 'Cannot find type definition file for ...')

Si ves errores como:
```
Cannot find type definition file for 'babel__core'.
```
Ejecuta:
```bash
npm install --save-dev @types/babel__core @types/babel__generator @types/babel__template @types/babel__traverse @types/jest @types/json-schema @types/stack-utils
```

---

## 6. Buenas prácticas para commits

- Haz commit de los archivos `package-lock.json`, `tsconfig.json` y todos los archivos de la carpeta `public/`.
- Ejemplo:
```bash
git add package-lock.json tsconfig.json public/*
git commit -m "chore: lock dependencies and freeze public assets"
```

---

## 7. Notas adicionales

- La carpeta `public/` está congelada y no debe modificarse salvo para agregar nuevos assets documentados.
- Consulta el `README-frontend.md` para la guía de diseño, colores y estructura recomendada.

---

**¡Listo! Con estos pasos puedes instalar, ejecutar y solucionar los problemas más comunes del frontend de SGISI.** 