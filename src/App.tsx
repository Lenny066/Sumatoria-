import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home/home";
import Login from "./pages/Login/login";


export default function App() {
    return (
      <BrowserRouter>
        <nav>
          <Link to="/">Inicio</Link> 
          <Link to="/about">Sobre Nosotros</Link>
        </nav>


        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login /> }/>
        </Routes>
      </BrowserRouter>
    );
  }