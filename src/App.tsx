import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginUsuario/login";
import PantallaUno from "./pages/PantallaUno/pantallauno";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PantallaUno />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}