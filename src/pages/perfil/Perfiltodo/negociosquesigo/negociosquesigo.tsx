import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Store } from 'lucide-react';
import Barra from '../../../../components/barra';
import {
  calcularDistancia,
  cambiarSeguimiento,
  obtenerNegociosSeguidos,
  obtenerSeguidos,
  type Negocio,
} from '../../../../services/negociosService';
import './nogociosquesigo.css';

type Filtro = 'todos' | 'con-promos';

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'con-promos', etiqueta: 'Con promos activas' },
];

function textoPromos(cantidad: number): string {
  if (cantidad === 0) return 'Sin promos activas';
  return `${cantidad} ${cantidad === 1 ? 'promo activa' : 'promos activas'}`;
}

export default function NegociosQueSigo(): React.JSX.Element {
  const navigate = useNavigate();

  const [negocios, setNegocios] = useState<Negocio[] | null>(null);
  const [seguidos, setSeguidos] = useState<string[]>(obtenerSeguidos);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [posicion, setPosicion] = useState<[number, number] | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerNegociosSeguidos()
      .then((datos) => !cancelado && setNegocios(datos))
      .catch(() => !cancelado && setNegocios([]));
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    if (!navigator.permissions?.query || !('geolocation' in navigator)) return;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((permiso) => {
        if (cancelado || permiso.state !== 'granted') return;
        navigator.geolocation.getCurrentPosition(
          (pos) => !cancelado && setPosicion([pos.coords.latitude, pos.coords.longitude]),
          () => {},
          { maximumAge: 60000 },
        );
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  function alternarSeguir(id: string) {
    setSeguidos(cambiarSeguimiento(id, !seguidos.includes(id)));
  }

  const visibles = (negocios ?? []).filter(
    (negocio) => filtro === 'todos' || negocio.promociones.length > 0,
  );

  return (
    <div className="siguiendo">
      <header className="siguiendo__cabecera">
        <button type="button" className="siguiendo__volver" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} strokeWidth={2.4} />
          Perfil
        </button>

        <h1 className="siguiendo__titulo">Siguiendo</h1>
        <p className="siguiendo__bajada">Te avisamos cuando publiquen promos</p>

        <div className="siguiendo__filtros">
          {FILTROS.map(({ id, etiqueta }) => (
            <button
              key={id}
              type="button"
              className={`siguiendo__filtro${filtro === id ? ' siguiendo__filtro--activo' : ''}`}
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </header>

      <div className="siguiendo__scroll">
        {negocios === null ? (
          <p className="siguiendo__cargando">Cargando...</p>
        ) : visibles.length > 0 ? (
          <ul className="siguiendo__lista">
            {visibles.map((negocio) => {
              const sigue = seguidos.includes(negocio.id);
              const detalle = [
                negocio.rubro,
                posicion ? calcularDistancia(posicion, [negocio.lat, negocio.lng]) : null,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <li key={negocio.id} className="seguido">
                  <button
                    type="button"
                    className="seguido__abrir"
                    onClick={() => navigate(`/negocio/${negocio.id}`)}
                  >
                    <span className="seguido__logo">
                      {negocio.logo ? (
                        <img src={negocio.logo} alt="" />
                      ) : (
                        <Store size={22} strokeWidth={1.8} />
                      )}
                    </span>

                    <span className="seguido__textos">
                      <span className="seguido__nombre">{negocio.nombre}</span>
                      <span className="seguido__detalle">{detalle}</span>
                      <span
                        className={`seguido__promos${
                          negocio.promociones.length === 0 ? ' seguido__promos--vacio' : ''
                        }`}
                      >
                        {textoPromos(negocio.promociones.length)}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`seguido__boton${sigue ? '' : ' seguido__boton--seguir'}`}
                    aria-pressed={sigue}
                    onClick={() => alternarSeguir(negocio.id)}
                  >
                    {sigue ? 'Siguiendo' : 'Seguir'}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="siguiendo-vacio">
            <span className="siguiendo-vacio__icono">
              <Store size={24} strokeWidth={1.9} />
            </span>
            <h2 className="siguiendo-vacio__titulo">
              {negocios.length === 0
                ? 'Todavía no seguís ningún negocio'
                : 'Ninguno tiene promos activas'}
            </h2>
            <p className="siguiendo-vacio__texto">
              {negocios.length === 0
                ? 'Entrá a un local y tocá Seguir para enterarte cuando publique promos.'
                : 'Te avisamos cuando alguno de los negocios que seguís publique una promo.'}
            </p>
          </div>
        )}
      </div>

      <Barra />
    </div>
  );
}
