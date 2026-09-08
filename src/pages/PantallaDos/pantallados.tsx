import { useNavigate } from "react-router-dom";
import BotonSiguiente from "../../components/BotonSiguiente";
import BotonSaltear from "../../components/BotonSaltear";
import PuntosPaginacion from "../../components/PuntosPaginacion";
import Logo from "../../components/Logo";
import "./pantallados.css";

export default function PantallaDos() {
  const navigate = useNavigate();

  const handleSiguiente = (): void => {
    navigate("/pantalla-tres");
  };

  const handleSaltear = (): void => {
    navigate("/login");
  };

  return (
    <div className="contenedor-dos">
      <Logo />

      <h1 className="titulo-dos">
        Guardá tus favoritas
      </h1>

      <p className="descripcion-dos">
        Guardá las promociones que te interesan y recibí un aviso antes de que venzan.
      </p>

      <PuntosPaginacion total={3} activo={1} />
      <BotonSiguiente onClick={handleSiguiente} />
      <BotonSaltear onClick={handleSaltear} />
    </div>
  );
}
