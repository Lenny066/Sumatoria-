import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, MapPin, Flame, ChevronRight, Store } from 'lucide-react';
import Barra from '../../components/barra';
import {
  calcularDistancia,
  cambiarPromoGuardada,
  obtenerFavoritos,
  type Favorito,
} from '../../services/negociosService';
import './favoritos.css';

const ATAJOS = [
  { id: 'cerca', etiqueta: 'Locales cerca mío', icono: MapPin, ruta: '/mapa' },
  { id: 'hot', etiqueta: 'Ver ofertas hot', icono: Flame, ruta: '/inicio' },
];

const GRUPOS = ['Vencen esta semana', 'Más adelante', 'Sin vencimiento', 'Vencidas'] as const;

type Grupo = (typeof GRUPOS)[number];

function diasParaVencer(vence: string): number {
  const [anio, mes, dia] = vence.split('-').map(Number);
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  return Math.round((new Date(anio, mes - 1, dia).getTime() - inicioHoy) / (24 * 60 * 60 * 1000));
}

function grupoDe({ promocion }: Favorito): Grupo {
  if (!promocion.vence) return 'Sin vencimiento';
  const dias = diasParaVencer(promocion.vence);
  if (dias < 0) return 'Vencidas';
  if (dias <= 7) return 'Vencen esta semana';
  return 'Más adelante';
}

function textoVence(vence: string): string {
  const [, mes, dia] = vence.split('-').map(Number);
  const fecha = `${dia}/${String(mes).padStart(2, '0')}`;
  return diasParaVencer(vence) < 0 ? `Venció el ${fecha}` : `Vence el ${fecha}`;
}

export default function Favoritos(): React.JSX.Element {
  const navigate = useNavigate();

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [posicion, setPosicion] = useState<[number, number] | null>(null);
  const [quitado, setQuitado] = useState<{ favorito: Favorito; indice: number } | null>(null);

  const hayFavoritos = favoritos.length > 0;

  useEffect(() => {
    let cancelado = false;
    obtenerFavoritos()
      .then((datos) => !cancelado && setFavoritos(datos))
      .catch(() => {});
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

  useEffect(() => {
    if (!quitado) return;
    const espera = setTimeout(() => setQuitado(null), 4000);
    return () => clearTimeout(espera);
  }, [quitado]);

  function esElMismo(a: Favorito, b: Favorito): boolean {
    return a.negocio.id === b.negocio.id && a.promocion.id === b.promocion.id;
  }

  function quitar(favorito: Favorito) {
    cambiarPromoGuardada(favorito.negocio.id, favorito.promocion.id, false);
    setQuitado({ favorito, indice: favoritos.findIndex((item) => esElMismo(item, favorito)) });
    setFavoritos(favoritos.filter((item) => !esElMismo(item, favorito)));
  }

  function deshacer() {
    if (!quitado) return;
    const { favorito, indice } = quitado;
    cambiarPromoGuardada(favorito.negocio.id, favorito.promocion.id, true);
    setFavoritos([...favoritos.slice(0, indice), favorito, ...favoritos.slice(indice)]);
    setQuitado(null);
  }

  const rubros = Array.from(new Set(favoritos.map(({ negocio }) => negocio.rubro)));
  const filtros = [
    { id: 'todas', etiqueta: 'Todas' },
    { id: 'por-vencer', etiqueta: 'Por vencer' },
    ...rubros.map((rubro) => ({ id: rubro, etiqueta: rubro })),
  ];

  const visibles = favoritos.filter((favorito) => {
    if (filtro === 'todas') return true;
    if (filtro === 'por-vencer') return grupoDe(favorito) === 'Vencen esta semana';
    return favorito.negocio.rubro === filtro;
  });

  const grupos = GRUPOS.map((titulo) => ({
    titulo,
    items: visibles
      .filter((favorito) => grupoDe(favorito) === titulo)
      .sort((a, b) => (a.promocion.vence ?? '').localeCompare(b.promocion.vence ?? '')),
  })).filter(({ items }) => items.length > 0);

  return (
    <div className="favoritos">
      <header className="favoritos__cabecera">
        <h1 className="favoritos__titulo">Favoritos</h1>
        <p className="favoritos__subtitulo">
          {hayFavoritos
            ? `${favoritos.length} ${favoritos.length === 1 ? 'promoción guardada' : 'promociones guardadas'}`
            : 'Sin promociones guardadas'}
        </p>

        {hayFavoritos && (
          <div className="favoritos__filtros">
            {filtros.map(({ id, etiqueta }) => (
              <button
                key={id}
                type="button"
                className={`favoritos__filtro${filtro === id ? ' favoritos__filtro--activo' : ''}`}
                aria-pressed={filtro === id}
                onClick={() => setFiltro(id)}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="favoritos__scroll">
        <main className="favoritos__cuerpo">
          {hayFavoritos ? (
            grupos.length > 0 ? (
              grupos.map(({ titulo, items }) => (
                <section key={titulo} className="favoritos__grupo">
                  <h2 className="favoritos__grupo-titulo">{titulo}</h2>
                  <ul className="lista-favoritos">
                    {items.map((favorito) => {
                      const { negocio, promocion } = favorito;
                      const detalle = [
                        promocion.vence ? textoVence(promocion.vence) : null,
                        posicion ? calcularDistancia(posicion, [negocio.lat, negocio.lng]) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ');

                      return (
                        <li key={`${negocio.id}-${promocion.id}`} className="favorito">
                          <button
                            type="button"
                            className="favorito__abrir"
                            onClick={() => navigate(`/negocio/${negocio.id}`)}
                          >
                            <span className="favorito__logo">
                              {negocio.logo ? (
                                <img src={negocio.logo} alt="" />
                              ) : (
                                <Store size={22} strokeWidth={1.8} />
                              )}
                            </span>

                            <span className="favorito__textos">
                              <span className="favorito__local">{negocio.nombre}</span>
                              {detalle && <span className="favorito__detalle">{detalle}</span>}
                              <span className="favorito__promo">{promocion.descuento}</span>
                            </span>

                          </button>

                          <button
                            type="button"
                            className="favorito__quitar"
                            aria-label={`Quitar ${promocion.descuento} de ${negocio.nombre} de favoritos`}
                            onClick={() => quitar(favorito)}
                          >
                            <Bookmark size={19} strokeWidth={2} fill="currentColor" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            ) : (
              <p className="favoritos__sin-resultados">No hay promociones guardadas con este filtro.</p>
            )
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

      {quitado && (
        <div className="favoritos__aviso" role="status">
          <span>Quitaste {quitado.favorito.promocion.descuento} de favoritos</span>
          <button type="button" className="favoritos__deshacer" onClick={deshacer}>
            Deshacer
          </button>
        </div>
      )}

      <Barra />
    </div>
  );
}
