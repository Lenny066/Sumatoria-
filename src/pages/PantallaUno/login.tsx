import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  
  // Le agregamos el tipo de dato a la "e"
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Enviando los datos...");
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <input type="email" onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>Ingresar</button>
    </div>
  );
}