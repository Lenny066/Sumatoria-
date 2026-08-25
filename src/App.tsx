import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginUsuario/login";
import PantallaUno from "./pages/PantallaUno/pantallauno";
import Mapa from "./pages/mapa";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PantallaUno />} />
        <Route path="/mapa" element={<Mapa />} />
      </Routes>
    </BrowserRouter>
  );
}