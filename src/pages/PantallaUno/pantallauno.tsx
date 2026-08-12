import { useState } from "react";
import BotonSiguiente from "../../components/BotonSiguiente";
import BotonSaltear from "../../components/BotonSaltear";
import PuntosPaginacion from "../../components/PuntosPaginacion";
import Logo from "../../components/Logo";
import "./pantallauno.css";

export default function PantallaUno() {
  const [paginaActual, setPaginaActual] = useState<number>(0);

  const handleSiguiente = (): void => {
    if (paginaActual < 2) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  const handleSaltear = (): void => {
    console.log('Onboarding omitido');
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

      <PuntosPaginacion total={3} activo={paginaActual} />
      <BotonSiguiente onClick={handleSiguiente} />
      <BotonSaltear onClick={handleSaltear} />
    </div>
  );
}