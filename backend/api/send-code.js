// backend/api/send-code.js
// Endpoint para enviar código de autenticación por correo usando Gmail y Nodemailer

const nodemailer = require('nodemailer');
require('dotenv').config({ path: './migrations/.env' });

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});

module.exports = async (req, res) => {
    const { to, code } = req.body;
    if (!to || !code) {
        return res.status(400).json({ error: 'Faltan parámetros' });
    }

    const mailOptions = {
        from: `SGISI <${GMAIL_USER}>`,
        to,
        subject: 'Tu código de autenticación',
        html: `
      <div style="font-family:Arial;padding:24px;background:#f6f8fa;border-radius:8px;">
        <h2 style="color:#161b22;">Tu código de autenticación</h2>
        <p>Ingresa el siguiente código en la aplicación:</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;color:#0070f3;background:#fff;padding:16px;border-radius:8px;display:inline-block;">${code}</div>
        <p style="margin-top:24px;color:#555;">Este código expira en 5 minutos.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error enviando el correo', details: err.message });
    }
};
