import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/LoginUsuario/login";
import pantallauno from "./pages/PantallaUno/pantallauno";
import Pantallauno from "./pages/PantallaUno/pantallauno";

export default function App() {
    return (
      <BrowserRouter>
        <nav>
        </nav>


        <Routes>
          <Route path="/login" element={<Login/> }/>
          <Route path="/pantallauno" element={<Pantallauno/> }/>
        </Routes>
      </BrowserRouter>
    );
  }