interface BotonSiguienteProps {
  onClick?: () => void;
  texto?: string;
}

export default function BotonSiguiente({ onClick, texto = "Siguiente" }: BotonSiguienteProps) {
  return (
    <button className="btn-siguiente" onClick={onClick}>
      {texto}
    </button>
  );
}