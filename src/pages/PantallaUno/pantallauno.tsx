import { useNavigate } from "react-router-dom";
import BotonSiguiente from "../../components/BotonSiguiente";
import BotonSaltear from "../../components/BotonSaltear";
import PuntosPaginacion from "../../components/PuntosPaginacion";
import Logo from "../../components/Logo";
import "./pantallauno.css";

export default function PantallaUno() {
  const navigate = useNavigate();

  const handleSiguiente = (): void => {
    navigate("/pantalla-dos");
  };

  const handleSaltear = (): void => {
    navigate("/login");
  };

  return (
    <div className="container">
      <Logo />

      <h1 className="title">
        Descubrí promociones cerca tuyo
      </h1>

      <p className="description">
        Encontrá descuentos de comercios y bancos en gastronomía, indumentaria, supermercados y más.
      </p>

      <PuntosPaginacion total={3} activo={0} />
      <BotonSiguiente onClick={handleSiguiente} />
      <BotonSaltear onClick={handleSaltear} />
    </div>
  );
}
