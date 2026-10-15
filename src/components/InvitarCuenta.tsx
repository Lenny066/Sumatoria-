import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import "./invitarcuenta.css";

interface InvitarCuentaProps {
  icono: LucideIcon;
  titulo: string;
  texto: string;
}

export default function InvitarCuenta({ icono: Icono, titulo, texto }: InvitarCuentaProps) {
  const navigate = useNavigate();

  return (
    <section className="invitado">
      <span className="invitado__icono">
        <Icono size={22} strokeWidth={2} />
      </span>
      <h2 className="invitado__titulo">{titulo}</h2>
      <p className="invitado__texto">{texto}</p>

      <button type="button" className="invitado__crear" onClick={() => navigate("/registrarse")}>
        Crear cuenta
      </button>

      <button type="button" className="invitado__ingresar" onClick={() => navigate("/login")}>
        Ya tengo cuenta
      </button>
    </section>
  );
}
