import { useNavigate } from "react-router-dom";
import BotonSiguiente from "../../components/BotonSiguiente";
import BotonSaltear from "../../components/BotonSaltear";
import PuntosPaginacion from "../../components/PuntosPaginacion";
import Logo from "../../components/Logo";
import "./pantallatres.css";


export default function PantallaTres() {
  const navigate = useNavigate();

  const handleEmpezar = (): void => {
    navigate("/login");
  };

  const handleSaltear = (): void => {
    navigate("/login");
  };

  return (
    <div className="contenedor-tres">
      <Logo />

      <h1 className="titulo-tres">
        ¿Tenés un negocio?
      </h1>

      <p className="descripcion-tres">
        Registrate como cuenta Negocio y publicá tus propias promociones para que más gente las encuentre.
      </p>

      <PuntosPaginacion total={3} activo={2} />
      <BotonSiguiente texto="Empezar" onClick={handleEmpezar} />
      <BotonSaltear onClick={handleSaltear} />
    </div>
  );
}
