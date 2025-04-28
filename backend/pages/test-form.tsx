import { useState } from 'react';

export default function TestForm() {
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      name: e.currentTarget.name.value,
      username: e.currentTarget.username.value,
      email: e.currentTarget.email.value,
      contactReason: e.currentTarget.contactReason.value,
      message: e.currentTarget.message.value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resJson = await res.json();
      setResult(resJson.message || 'Correo enviado correctamente');
    } catch (err) {
      setResult('Error al enviar el correo');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nombre completo" required />
      <input name="username" placeholder="Usuario" required />
      <input type="email" name="email" placeholder="Correo electrónico" required />
      <select name="contactReason" required>
        <option value="">Motivo</option>
        <option value="soporte">Soporte</option>
        <option value="comentario">Comentario</option>
      </select>
      <textarea name="message" placeholder="Mensaje" required />
      <button type="submit">Enviar</button>
      <p>{result}</p>
    </form>
  );
}
