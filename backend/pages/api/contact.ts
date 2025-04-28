import nodemailer from 'nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

// Función para manejar la solicitud de la API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configura las cabeceras CORS para permitir solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');  // Permite solicitudes desde cualquier dominio (cambia '*' por tu dominio si es necesario)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde a las solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Si el método es POST
  if (req.method === 'POST') {
    const { name, username, email, contactReason, message } = req.body;

    // Configura el transportador de Nodemailer con las credenciales del correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Correo de Gmail configurado en .env
        pass: process.env.GMAIL_PASS, // Contraseña de aplicación generada en Gmail
      },
    });

    // Opciones del correo a enviar
    const mailOptions = {
      from: process.env.GMAIL_USER, // Correo remitente
      to: process.env.GMAIL_USER,   // Correo destinatario (tú mismo)
      subject: `Nuevo mensaje de ${name}`, // Asunto
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Usuario:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Motivo:</strong> ${contactReason}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `, // Contenido del correo
    };

    try {
      // Intenta enviar el correo
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Correo enviado correctamente' });
    } catch (error) {
      // En caso de error, responde con un error 500
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ message: 'Error al enviar el correo' });
    }
  } else {
    // Si el método no es POST, responde con un error 405 (Método no permitido)
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
