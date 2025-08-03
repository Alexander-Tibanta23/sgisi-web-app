// utils/secureStorage.ts
// Utilitario para guardar y leer datos cifrados en localStorage/sessionStorage
// Nunca almacenes contraseñas ni claves secretas en el frontend

import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_STORAGE_KEY || 'default_key'; // Debe estar en .env y nunca ser público

export const setSecureItem = (key: string, value: string) => {
  const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  localStorage.setItem(key, encrypted);
};

export const getSecureItem = (key: string): string | null => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const removeSecureItem = (key: string) => {
  localStorage.removeItem(key);
};

// Puedes usar setSecureItem('token', token) para guardar tokens de sesión de forma segura
// Nunca guardes contraseñas ni claves secretas aquí
