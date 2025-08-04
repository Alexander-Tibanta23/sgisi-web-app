// Configuración global para Jest
require('dotenv').config();

// Timeout más largo para las pruebas de API
jest.setTimeout(10000);

// Mock console.log en las pruebas si es necesario
global.console = {
  ...console,
  // Uncomment to ignore specific log levels
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
