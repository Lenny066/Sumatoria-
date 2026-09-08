import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, MapPin, Flame, ChevronRight, Clock, Tag } from 'lucide-react';
import Barra from '../../components/barra';
import './favoritos.css';

export type Favorito = {
  id: string;
  local: string;
  promo: string;
  categoria: string;
  distancia: string;
  vence: string;
};

const ATAJOS = [
  { id: 'cerca', etiqueta: 'Locales cerca mío', icono: MapPin, ruta: '/mapa' },
  { id: 'hot', etiqueta: 'Ver ofertas hot', icono: Flame, ruta: '/inicio' },
];

export default function Favoritos(): React.JSX.Element {
  const navigate = useNavigate();

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);

  const hayFavoritos = favoritos.length > 0;

  function quitarFavorito(id: string) {
    setFavoritos((actuales) => actuales.filter((favorito) => favorito.id !== id));
  }

  return (
    <div className="favoritos">
      <div className="favoritos__scroll">
        <header className="favoritos__cabecera">
          <h1 className="favoritos__titulo">Favoritos</h1>
          <p className="favoritos__subtitulo">
            {hayFavoritos
              ? `${favoritos.length} ${favoritos.length === 1 ? 'promoción guardada' : 'promociones guardadas'}`
              : 'Sin promociones guardadas'}
          </p>
        </header>

        <main className="favoritos__cuerpo">
          {hayFavoritos ? (
            <ul className="lista-favoritos">
              {favoritos.map((favorito) => (
                <li key={favorito.id} className="favorito">
                  <div className="favorito__cabecera">
                    <span className="favorito__promo">{favorito.promo}</span>
                    <button
                      type="button"
                      className="favorito__quitar"
                      aria-label={`Quitar ${favorito.local} de favoritos`}
                      onClick={() => quitarFavorito(favorito.id)}
                    >
                      <Bookmark size={18} strokeWidth={2} fill="currentColor" />
                    </button>
                  </div>

                  <h2 className="favorito__local">{favorito.local}</h2>

                  <p className="favorito__meta">
                    <span className="favorito__dato">
                      <Tag size={13} strokeWidth={2.2} />
                      {favorito.categoria}
                    </span>
                    <span className="favorito__dato">
                      <MapPin size={13} strokeWidth={2.2} />
                      {favorito.distancia}
                    </span>
                    <span className="favorito__dato">
                      <Clock size={13} strokeWidth={2.2} />
                      {favorito.vence}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="favoritos-vacio">
              <span className="favoritos-vacio__icono">
                <Bookmark size={30} strokeWidth={1.9} />
              </span>

              <h2 className="favoritos-vacio__titulo">Todavía no tenés favoritos</h2>
              <p className="favoritos-vacio__texto">
                Guardá promociones para encontrarlas fácil cuando las necesites.
              </p>

              <div className="atajos">
                {ATAJOS.map(({ id, etiqueta, icono: Icono, ruta }) => (
                  <button
                    key={id}
                    type="button"
                    className="atajo"
                    onClick={() => navigate(ruta)}
                  >
                    <span className="atajo__icono">
                      <Icono size={18} strokeWidth={2.1} />
                    </span>
                    <span className="atajo__etiqueta">{etiqueta}</span>
                    <ChevronRight className="atajo__flecha" size={18} strokeWidth={2.2} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Barra />
    </div>
  );
}
