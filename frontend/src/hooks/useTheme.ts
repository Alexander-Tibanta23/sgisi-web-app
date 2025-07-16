import { useState, useEffect } from 'react';
import { applyColors } from '../theme';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar preferencia guardada en localStorage
    const saved = localStorage.getItem('sgisi-theme');
    if (saved) {
      return saved === 'dark';
    }
    // Verificar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Aplicar colores CSS al documento
    applyColors(isDarkMode);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('sgisi-theme', isDarkMode ? 'dark' : 'light');
    
    // Actualizar el atributo data-theme en el body para CSS personalizado
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return {
    isDarkMode,
    toggleTheme,
  };
}; 