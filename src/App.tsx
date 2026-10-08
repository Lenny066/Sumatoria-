import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginUsuario/login";
import PantallaUno from "./pages/PantallaUno/pantallauno";
import PantallaDos from "./pages/PantallaDos/pantallados";
import PantallaTres from "./pages/PantallaTres/pantallatres";
import Mapa from "./pages/mapa";
import Registrarse from "./pages/registrarse/regitrarse";
import CuentaNegocio from "./pages/CuentaNegocio/cuentanegocio";
import Inicio from "./pages/inicio/inicio";
import Favoritos from "./pages/favoritos/favoritos";
import IA from "./pages/IA/IA";
import Tarjetas from "./pages/tarjetas/tarjetas";
import Perfil from "./pages/perfil/perfil";
import TarjetasVinculadas from "./pages/perfil/Perfiltodo/tarjetasvinculadas/tarjetasvinculadas";
import Negocio from "./pages/negocio/negocio";
import PerfilEditarNegocio from "./pages/perfileditarnegocio/perfileditarnegocio";
import Notificaciones from "./pages/notificaciones/notificaciones";
import NegociosQueSigo from "./pages/perfil/Perfiltodo/negociosquesigo/negociosquesigo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PantallaUno />} />
        <Route path="/pantalla-dos" element={<PantallaDos />} />
        <Route path="/pantalla-tres" element={<PantallaTres />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/registrarse" element={<Registrarse />} />
        <Route path="/cuenta-negocio" element={<CuentaNegocio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/ia" element={<IA />} />
        <Route path="/agregar-tarjeta" element={<Tarjetas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/tarjetas-vinculadas" element={<TarjetasVinculadas />} />
        <Route path="/negocio/:id" element={<Negocio />} />
        <Route path="/perfil-negocio" element={<PerfilEditarNegocio />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/negocios-que-sigo" element={<NegociosQueSigo />} />
      </Routes>
    </BrowserRouter>
  );
}
