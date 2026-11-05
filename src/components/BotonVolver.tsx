import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './botonvolver.css';

export default function BotonVolver() {
  const navigate = useNavigate();

  function volver() {
    const indice = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (indice > 0) navigate(-1);
    else navigate('/inicio');
  }

  return (
    <button type="button" className="boton-volver" onClick={volver}>
      <ChevronLeft size={18} strokeWidth={2.4} />
      Volver
    </button>
  );
}
