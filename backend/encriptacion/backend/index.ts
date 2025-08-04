import 'dotenv/config';
import express, { Request, Response } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { CryptoService } from '../src/CryptoService'; // Ajusta el path según tu estructura

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// Leer clave de cifrado del entorno
const ENCRYPT_KEY = process.env.ENCRYPT_KEY;
if (!ENCRYPT_KEY || ENCRYPT_KEY.length !== 32) {
  console.error('Error de configuración de cifrado.');
  process.exit(1);
}

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Configuración incompleta. Variables requeridas no encontradas.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const cryptoService = new CryptoService(ENCRYPT_KEY);

// SUBIR CIFRADO AL STORAGE
app.post('/subir', upload.single('archivo'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('Archivo requerido.');
    }

    const buffer = fs.readFileSync(file.path);

    const encryptedBuffer = cryptoService.encryptBuffer(buffer);

    // Nombre de archivo original, sin limpiar
    const storagePath = `incidentes/${file.originalname}.enc`;

    const result = await supabase
      .storage
      .from('evidencias')
      .upload(storagePath, encryptedBuffer, { upsert: true });

    fs.unlinkSync(file.path);

    if (result.error) {
      // Log solo para desarrolladores, mensaje genérico al cliente
      console.error('Error interno al subir archivo:', result.error);
      return res.status(500).send('Error interno al procesar el archivo.');
    }

    res.json({ mensaje: 'Archivo procesado correctamente.', nombre: storagePath });
  } catch (e: any) {
    // Mensaje genérico para el cliente
    console.error('Error interno al procesar la subida:', e);
    res.status(500).send('Error interno.');
  }
});

// DESCARGAR Y DESCIFRAR DEL STORAGE
app.get('/descargar/:nombre', async (req: Request, res: Response) => {
  try {
    const storagePath = `incidentes/${req.params.nombre}`;

    const { data, error } = await supabase
      .storage
      .from('evidencias')
      .download(storagePath);

    if (error) {
      console.error('Error interno al descargar archivo:', error);
      return res.status(404).send('Archivo no encontrado.');
    }

    const encryptedBuffer = Buffer.from(await data.arrayBuffer());
    const decryptedBuffer = cryptoService.decryptBuffer(encryptedBuffer);

    const nombreDescarga = req.params.nombre.replace(/\.enc$/i, '');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreDescarga}"`);
    res.end(decryptedBuffer);
  } catch (e: any) {
    console.error('Error interno al procesar la descarga:', e);
    res.status(500).send('Error interno.');
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log('Servidor iniciado.');
});
