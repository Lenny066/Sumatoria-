import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, MapPin, Bookmark, User } from 'lucide-react';
import './barra.css';

type ItemBarra = {
  id: string;
  etiqueta: string;
  icono: typeof Home;
  ruta: string | null;
};

const ITEMS: ItemBarra[] = [
  { id: 'inicio', etiqueta: 'Inicio', icono: Home, ruta: '/inicio' },
  { id: 'ia', etiqueta: 'IA', icono: Sparkles, ruta: '/ia' },
  { id: 'cerca', etiqueta: 'Cerca', icono: MapPin, ruta: '/mapa' },
  { id: 'favoritos', etiqueta: 'Favoritos', icono: Bookmark, ruta: '/favoritos' },
  { id: 'perfil', etiqueta: 'Perfil', icono: User, ruta: '/perfil' },
];

export const Barra: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="barra">
      {ITEMS.map(({ id, etiqueta, icono: Icono, ruta }) => {
        const activo = ruta !== null && pathname === ruta;

        return (
          <button
            key={id}
            className={`barra__item${activo ? ' barra__item--activo' : ''}`}
            type="button"
            disabled={ruta === null}
            aria-current={activo ? 'page' : undefined}
            onClick={() => ruta && navigate(ruta)}
          >
            <span className="barra__icono">
              <Icono size={20} strokeWidth={1.9} />
            </span>
            <span className="barra__etiqueta">{etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Barra;
