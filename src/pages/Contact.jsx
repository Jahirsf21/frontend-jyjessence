import React, { useState } from 'react';

const Contact = () => {
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el correo
    setEnviado(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-['Lato',sans-serif]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Contáctanos</h1>
        <p className="mb-6 text-gray-600">Envíanos tu consulta y la recibiremos en <span className="font-semibold">jyjessence@gmail.com</span></p>
        {enviado ? (
          <div className="text-green-600 font-semibold text-center">¡Tu mensaje ha sido enviado!</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 resize-none text-base text-gray-800"
              rows={6}
              placeholder="Escribe tu mensaje aquí..."
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >Enviar</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
