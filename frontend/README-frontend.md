# Frontend SGISI

Guía para desarrollo de la app React (Kanban, formularios, dashboards).

## Estructura
- `/src/components`: Componentes reutilizables (Navbar, AuthForm, Kanban).
- `/src/hooks`: Custom hooks (useTheme).
- `/src/pages`: Vistas principales (Home, Login, Dashboard).
- `/src/styles`: Estilos globales y CSS variables.
- `/src/theme`: Configuración de temas Material-UI.
- `/src/utils`: Helpers (validación, cifrado).

## Tecnologías
- React 18 + TypeScript
- Material-UI (MUI) v5
- Axios para HTTP requests
- React Router DOM

## Paleta de Colores (GitHub-inspired)

### Modo Claro
- **Primario**: `#0969da` (Azul GitHub)
- **Secundario**: `#656d76` (Gris texto)
- **Fondo**: `#ffffff` (Blanco)
- **Fondo sutil**: `#f6f8fa` (Gris muy claro)
- **Texto principal**: `#24292f` (Negro suave)
- **Texto secundario**: `#656d76` (Gris medio)
- **Bordes**: `#d0d7de` (Gris claro)

### Modo Oscuro
- **Primario**: `#58a6ff` (Azul claro)
- **Secundario**: `#7d8590` (Gris claro)
- **Fondo**: `#0d1117` (Negro profundo)
- **Fondo sutil**: `#161b22` (Negro medio)
- **Texto principal**: `#f0f6fc` (Blanco suave)
- **Texto secundario**: `#7d8590` (Gris claro)
- **Bordes**: `#30363d` (Gris oscuro)


### Estados y Acciones
- **Éxito**: `#1a7f37` (Verde)
- **Error**: `#cf222e` (Rojo)
- **Advertencia**: `#9a6700` (Amarillo)
- **Información**: `#0969da` (Azul)

## Requisitos
- Node.js >= 18
- pnpm o npm

## Comandos útiles
```sh
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build

# Ejecutar tests
pnpm test
```

## Características Implementadas
- ✅ Tema claro/oscuro con colores de GitHub
- ✅ Navbar responsive con logo SGISI
- ✅ Página de inicio con hero section
- ✅ Ícono de escudo interactivo
- ✅ Botón de inicio de sesión estilizado
- ✅ Transiciones suaves y efectos hover
- ✅ Favicon personalizado (escudo + chip)
- ✅ Variables CSS para consistencia de colores
- ✅ Accesibilidad (WCAG 2.2 AA compatible)

## Próximos Pasos
- [ ] Implementar autenticación
- [ ] Crear dashboard principal
- [ ] Implementar Kanban de incidentes
- [ ] Formularios de reporte
- [ ] Integración con backend

---

## 🎨 Guía de Diseño y Colores SGISI (Frontend)

### 1. Paleta de Colores (GitHub Inspired)
- **Primario (azul):**
  - Claro: `#0969da`
  - Oscuro: `#58a6ff`
- **Secundario (gris):**
  - Claro: `#656d76`
  - Oscuro: `#7d8590`
- **Fondo principal:**
  - Claro: `#ffffff`
  - Oscuro: `#0d1117`
- **Fondo sutil:**
  - Claro: `#f6f8fa`
  - Oscuro: `#161b22`
- **Texto principal:**
  - Claro: `#24292f`
  - Oscuro: `#f0f6fc`
- **Texto secundario:**
  - Claro: `#656d76`
  - Oscuro: `#7d8590`
- **Bordes:**
  - Claro: `#d0d7de`
  - Oscuro: `#30363d`
- **Éxito:** `#1a7f37`
- **Error:** `#cf222e`
- **Advertencia:** `#9a6700`
- **Información:** `#0969da`

### 2. Tipografía
- **Fuente base:**
  - `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
- **Tamaños recomendados:**
  - Título principal: `2.2rem` a `2.7rem`
  - Subtítulo: `1.5rem` a `2rem`
  - Texto normal: `1rem` a `1.2rem`
  - Botones: `1.1rem` a `1.18rem`

### 3. Componentes y Layout
- **Navbar:** Flotante, sombra sutil, logo SGISI a la izquierda, botón de tema a la derecha.
- **Paper/Card:** Bordes redondeados (`borderRadius: 5`), sombra suave, padding generoso.
- **Botones:** Bordes redondeados, transiciones suaves, colores de tema, efectos hover y active.
- **Inputs:** Bordes suaves, validaciones visuales, helperText para errores.
- **Responsividad:** Usar breakpoints de MUI (`xs`, `sm`, `md`, `lg`, `xl`).
- **Transiciones:**
  - `transition: 'all 0.2s ease-in-out'` para hover/focus
  - `transition: 'background 0.4s'` para cambios de tema

### 4. Accesibilidad
- Contraste alto en todos los modos.
- Etiquetas `aria-label` en botones e inputs.
- No usar `innerHTML` para datos de usuario.
- No mostrar errores técnicos al usuario.

### 5. Estructura de carpetas
- `/src/components`: Componentes reutilizables (Navbar, formularios, etc.)
- `/src/pages`: Vistas principales (Home, Login, Dashboard, etc.)
- `/src/styles`: Estilos globales y CSS variables.
- `/src/theme`: Configuración de temas y colores.
- `/src/utils`: Helpers y validaciones.

---

## 📝 Notas sobre la carpeta `public`
- Los archivos de `frontend/public` (favicon, manifest, index.html, etc.) están **congelados** y no deben modificarse más.
- Si necesitas agregar nuevos assets, crea una carpeta nueva (ej: `/assets`) y documenta el cambio.