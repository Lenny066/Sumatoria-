import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('')
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Enviando los datos...");
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <input className = "mail"    type="email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className = "contraseña" />
      <button onClick={handleSubmit}>Ingresar</button>                
    </div>
  );    
}
