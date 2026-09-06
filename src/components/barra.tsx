import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MapPin, Bookmark, User } from 'lucide-react';
import './barra.css';

/* Barra de navegación inferior.
   Los ítems con `ruta` navegan; los que todavía no tienen pantalla quedan
   deshabilitados hasta que exista. El ítem activo se deduce de la URL. */
type ItemBarra = {
  id: string;
  etiqueta: string;
  icono: typeof Home;
  ruta: string | null;
  central?: boolean;
};

const ITEMS: ItemBarra[] = [
  { id: 'inicio', etiqueta: 'Inicio', icono: Home, ruta: '/inicio' },
  { id: 'buscar', etiqueta: 'Buscar', icono: Search, ruta: null },
  { id: 'cerca', etiqueta: 'Mapa', icono: MapPin, ruta: '/mapa', central: true },
  { id: 'favoritos', etiqueta: 'Favoritos', icono: Bookmark, ruta: null },
  { id: 'perfil', etiqueta: 'Perfil', icono: User, ruta: null },
];

export const Barra: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="barra">
      {ITEMS.map(({ id, etiqueta, icono: Icono, ruta, central }) => {
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
            {central ? (
              <span className="barra__circulo">
                <Icono size={26} color="#ffffff" strokeWidth={2.2} />
              </span>
            ) : (
              <span className="barra__icono">
                <Icono size={23} strokeWidth={1.9} />
              </span>
            )}
            <span className="barra__etiqueta">{etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Barra;
