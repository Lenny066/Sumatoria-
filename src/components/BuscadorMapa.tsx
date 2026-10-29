import React from 'react';
import { Search, MapPin, Clock, Star, SlidersHorizontal, X } from 'lucide-react';
import { RUBROS, type Rubro } from '../services/negociosService';
import './buscadormapa.css';

export type FiltroRapido = 'cerca' | 'abierto' | 'puntuados';

const filtros: { id: FiltroRapido; etiqueta: string; icono: React.ReactNode }[] = [
  { id: 'cerca', etiqueta: 'Cerca mío', icono: <MapPin size={14} color="#e5484d" strokeWidth={2.4} /> },
  { id: 'abierto', etiqueta: 'Abierto ahora', icono: <Clock size={14} color="#6b6480" strokeWidth={2.2} /> },
  { id: 'puntuados', etiqueta: 'Mejor puntuados', icono: <Star size={14} color="#f5b301" fill="#f5b301" strokeWidth={1.6} /> },
];

type FiltrosMapaProps = {
  activos: FiltroRapido[];
  onCambiarFiltro: (filtro: FiltroRapido) => void;
  rubros: Rubro[];
  onCambiarRubro: (rubro: Rubro) => void;
  onLimpiarRubros: () => void;
  panelAbierto: boolean;
  onAlternarPanel: () => void;
};

export const FiltrosMapa: React.FC<FiltrosMapaProps> = ({
  activos,
  onCambiarFiltro,
  rubros,
  onCambiarRubro,
  onLimpiarRubros,
  panelAbierto,
  onAlternarPanel,
}) => {
  return (
    <div className="buscador__filtros-zona">
      <div className="buscador__filtros">
        <button
          className={`chip${panelAbierto || rubros.length > 0 ? ' chip--activo' : ''}`}
          type="button"
          aria-expanded={panelAbierto}
          onClick={onAlternarPanel}
        >
          <span className="chip__icono">
            <SlidersHorizontal size={14} strokeWidth={2.2} />
          </span>
          Filtros
          {rubros.length > 0 && <span className="chip__cantidad">{rubros.length}</span>}
        </button>
        {filtros.map((filtro) => {
          const activo = activos.includes(filtro.id);
          return (
            <button
              key={filtro.id}
              className={`chip${activo ? ' chip--activo' : ''}`}
              type="button"
              aria-pressed={activo}
              onClick={() => onCambiarFiltro(filtro.id)}
            >
              <span className="chip__icono">{filtro.icono}</span>
              {filtro.etiqueta}
            </button>
          );
        })}
      </div>

      {panelAbierto && (
        <div className="buscador__panel">
          <div className="buscador__panel-cabecera">
            <span className="buscador__panel-titulo">Categorías</span>
            {rubros.length > 0 && (
              <button type="button" className="buscador__panel-limpiar" onClick={onLimpiarRubros}>
                Limpiar
              </button>
            )}
          </div>
          <div className="buscador__rubros">
            {RUBROS.map((rubro) => {
              const elegido = rubros.includes(rubro);
              return (
                <button
                  key={rubro}
                  type="button"
                  className={`buscador__rubro${elegido ? ' buscador__rubro--activo' : ''}`}
                  aria-pressed={elegido}
                  onClick={() => onCambiarRubro(rubro)}
                >
                  {rubro}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

type BuscadorMapaProps = {
  busqueda: string;
  onBuscar: (texto: string) => void;
};

export const BuscadorMapa: React.FC<BuscadorMapaProps> = ({ busqueda, onBuscar }) => {
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
          value={busqueda}
          onChange={(evento) => onBuscar(evento.target.value)}
        />
        {busqueda && (
          <button
            type="button"
            className="buscador__borrar"
            aria-label="Borrar búsqueda"
            onClick={() => onBuscar('')}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </header>
  );
};

export default BuscadorMapa;
