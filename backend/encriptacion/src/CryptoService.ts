import * as crypto from 'crypto';

const IV_LENGTH = 16;

export class CryptoService {
  private readonly encryptKey: string;

  constructor(encryptKey: string) {
    if (!encryptKey || encryptKey.length !== 32) {
      // Mensaje genérico, no revela la variable
      throw new Error('Configuración de cifrado inválida.');
    }
    this.encryptKey = encryptKey;
  }

  encryptBuffer(buffer: Buffer): Buffer {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptKey, 'utf8'), iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  }

  decryptBuffer(encryptedBuffer: Buffer): Buffer {
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const encrypted = encryptedBuffer.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptKey, 'utf8'), iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}
