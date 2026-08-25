import React from 'react';
import { Home, Search, MapPin, Bookmark, User } from 'lucide-react';
import './barra.css';

export const Barra: React.FC = () => {
  return (
    <nav className="barra">
      <button className="barra__item" type="button">
        <span className="barra__icono">
          <Home size={23} strokeWidth={1.9} />
        </span>
        <span className="barra__etiqueta">Inicio</span>
      </button>

      <button className="barra__item" type="button">
        <span className="barra__icono">
          <Search size={23} strokeWidth={1.9} />
        </span>
        <span className="barra__etiqueta">Buscar</span>
      </button>

      <button className="barra__item barra__item--activo" type="button">
        <span className="barra__circulo">
          <MapPin size={26} color="#ffffff" strokeWidth={2.2} />
        </span>
        <span className="barra__etiqueta">Cerca</span>
      </button>

      <button className="barra__item" type="button">
        <span className="barra__icono">
          <Bookmark size={23} strokeWidth={1.9} />
        </span>
        <span className="barra__etiqueta">Favoritos</span>
      </button>

      <button className="barra__item" type="button">
        <span className="barra__icono">
          <User size={23} strokeWidth={1.9} />
        </span>
        <span className="barra__etiqueta">Perfil</span>
      </button>
    </nav>
  );
};

export default Barra;
