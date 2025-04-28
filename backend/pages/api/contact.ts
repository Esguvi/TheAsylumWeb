import nodemailer from 'nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, username, email, contactReason, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // tu correo de Gmail
        pass: process.env.GMAIL_PASS, // tu contraseña de aplicación
      },
    });

    // Opciones del correo
    const mailOptions = {
      from: process.env.GMAIL_USER,  // Remitente
      to: process.env.GMAIL_USER,    // Tu propio correo (para recibir los mensajes)
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Usuario:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Motivo:</strong> ${contactReason}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    };

    try {
      // Enviar el correo
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Correo enviado correctamente' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return res.status(500).json({ message: 'Error al enviar el correo' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
