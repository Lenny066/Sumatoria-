interface BotonSaltearProps {
  onClick?: () => void;
  texto?: string;
}

export default function BotonSaltear({ onClick, texto = "Saltear" }: BotonSaltearProps) {
  return (
    <button className="btn-saltear" onClick={onClick}>
      {texto}
    </button>
  );
}