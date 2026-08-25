import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginUsuario/login";
import PantallaUno from "./pages/PantallaUno/pantallauno";
import PantallaDos from "./pages/PantallaDos/pantallados";
import PantallaTres from "./pages/PantallaTres/pantallatres";
import Mapa from "./pages/mapa";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PantallaUno />} />
        <Route path="/pantalla-dos" element={<PantallaDos />} />
        <Route path="/pantalla-tres" element={<PantallaTres />} />
        <Route path="/mapa" element={<Mapa />} />
      </Routes>
    </BrowserRouter>
  );
}