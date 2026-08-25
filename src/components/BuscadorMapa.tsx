import React from 'react';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import './buscadormapa.css';

/* Filtros de la fila superior. Sólo maqueta: no filtran nada todavía. */
const filtros = [
  { etiqueta: 'Filtros', icono: null },
  { etiqueta: 'Cerca mío', icono: <MapPin size={14} color="#e5484d" strokeWidth={2.4} /> },
  { etiqueta: 'Abierto ahora', icono: <Clock size={14} color="#6b6480" strokeWidth={2.2} /> },
  { etiqueta: 'Mejor puntuados', icono: <Star size={14} color="#f5b301" fill="#f5b301" strokeWidth={1.6} /> },
];

/* Fila de chips. Va dentro del lienzo del mapa para que flote encima
   y no corte la pantalla con una banda de fondo. */
export const FiltrosMapa: React.FC = () => {
  return (
    <div className="buscador__filtros">
      {filtros.map((filtro) => (
        <button key={filtro.etiqueta} className="chip" type="button">
          {filtro.icono && <span className="chip__icono">{filtro.icono}</span>}
          {filtro.etiqueta}
        </button>
      ))}
    </div>
  );
};

export const BuscadorMapa: React.FC = () => {
  return (
    <header className="buscador">
      <h1 className="buscador__titulo">Lugares cercanos</h1>
      <p className="buscador__subtitulo">Mira las promociones cercanas a vos</p>

      <div className="buscador__campo">
        <Search className="buscador__lupa" size={18} strokeWidth={2.2} />
        <input
          className="buscador__input"
          type="text"
          placeholder="Buscar local o categoría"
          aria-label="Buscar local o categoría"
        />
      </div>
    </header>
  );
};

export default BuscadorMapa;
