import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, ChevronLeft, Clock, MapPin, Share, Store, Tag } from 'lucide-react';
import Barra from '../../components/barra';
import DetallePromo from '../../components/DetallePromo';
import {
  calcularEstadoHorario,
  cambiarPromoGuardada,
  cambiarSeguimiento,
  estaGuardada,
  estaSiguiendo,
  obtenerNegocio,
  obtenerPromosGuardadas,
  type Negocio as DatosNegocio,
} from '../../services/negociosService';
import { obtenerMisTarjetas, sirveConTarjetas } from '../../services/promosService';
import './negocio.css';

export default function Negocio(): React.JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const distancia = (state as { distancia?: string } | null)?.distancia;

  const [cargado, setCargado] = useState<{ id: string; datos: DatosNegocio | null } | null>(null);
  const [seguidos, setSeguidos] = useState<Record<string, boolean>>({});
  const [guardadas, setGuardadas] = useState(obtenerPromosGuardadas);
  const [promoAbierta, setPromoAbierta] = useState<string | null>(null);

  const negocio = cargado && cargado.id === id ? cargado.datos : undefined;
  const siguiendo = id ? (seguidos[id] ?? estaSiguiendo(id)) : false;

  function alternarSeguir() {
    if (!id) return;
    cambiarSeguimiento(id, !siguiendo);
    setSeguidos({ ...seguidos, [id]: !siguiendo });
  }

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    obtenerNegocio(id)
      .then((datos) => !cancelado && setCargado({ id, datos }))
      .catch(() => !cancelado && setCargado({ id, datos: null }));
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function compartir() {
    if (!negocio) return;
    const datos = { title: negocio.nombre, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(datos);
      } catch {
        return;
      }
    } else {
      await navigator.clipboard?.writeText(datos.url);
    }
  }

  const botonVolver = (
    <button
      type="button"
      className="negocio__circulo negocio__volver"
      aria-label="Volver"
      onClick={() => navigate(-1)}
    >
      <ChevronLeft size={19} strokeWidth={2.2} />
    </button>
  );

  if (!negocio) {
    return (
      <div className="negocio">
        <div className="negocio__scroll">
          <header className="negocio__portada">{botonVolver}</header>
          <main className="negocio__cuerpo">
            <section className="negocio__vacio">
              <span className="negocio__vacio-icono">
                <Store size={18} strokeWidth={1.8} />
              </span>
              <p className="negocio__vacio-titulo">
                {negocio === undefined ? 'Cargando local...' : 'No encontramos este local'}
              </p>
            </section>
          </main>
        </div>
        <Barra />
      </div>
    );
  }

  const estado = calcularEstadoHorario(negocio.horarios);
  const tarjetas = obtenerMisTarjetas();
  const promos = negocio.promociones.filter((promo) => sirveConTarjetas(promo, tarjetas));
  const ocultasPorTarjetas = promos.length === 0 && negocio.promociones.length > 0;
  const promoSeleccionada = promos.find(({ id: idPromo }) => idPromo === promoAbierta);
  const ubicacion = [negocio.direccion, distancia].filter(Boolean).join(' · ');

  const marca = negocio.logo ? (
    <img className="negocio__logo" src={negocio.logo} alt={negocio.nombre} />
  ) : (
    <span className="negocio__marca">{negocio.nombre}</span>
  );

  return (
    <div className="negocio">
      <div className="negocio__scroll">
        <header
          className="negocio__portada"
          style={negocio.portada ? { backgroundImage: `url(${negocio.portada})` } : undefined}
        >
          {botonVolver}

          <div className="negocio__acciones">
            <button
              type="button"
              className="negocio__circulo"
              aria-label="Compartir"
              onClick={compartir}
            >
              <Share size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="negocio__identidad">{marca}</div>
        </header>

        <main className="negocio__cuerpo">
          <div className="negocio__encabezado">
            <h1 className="negocio__nombre">{negocio.nombre}</h1>
            <button
              type="button"
              className={`negocio__seguir${siguiendo ? ' negocio__seguir--activo' : ''}`}
              aria-pressed={siguiendo}
              onClick={alternarSeguir}
            >
              {siguiendo ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>

          {negocio.descripcion && <p className="negocio__descripcion">{negocio.descripcion}</p>}

          <ul className="negocio__datos">
            {ubicacion && (
              <li className="negocio__dato">
                <MapPin size={13} strokeWidth={2.2} />
                {ubicacion}
              </li>
            )}
            {estado && (
              <li
                className={`negocio__dato negocio__dato--${estado.abierto ? 'abierto' : 'cerrado'}`}
              >
                <Clock size={13} strokeWidth={2.2} />
                {estado.texto}
              </li>
            )}
          </ul>

          <div className="pestanias">
            <span className="pestania pestania--activa">Promociones</span>
          </div>

          {promos.length > 0 ? (
            <section className="negocio__seccion">
              <h2 className="negocio__subtitulo">
                <span aria-hidden="true">🔥</span>
                Ofertas Hot
              </h2>

              <div className="promos">
                {promos.map(({ id: idPromo, descuento, imagen }) => {
                  const guardada = estaGuardada(guardadas, negocio.id, idPromo);
                  return (
                    <article key={idPromo} className="promo">
                      <button
                        type="button"
                        className="promo__abrir"
                        onClick={() => setPromoAbierta(idPromo)}
                      >
                        <span className="promo__imagen">
                          {imagen ? (
                            <img className="promo__foto" src={imagen} alt="" />
                          ) : negocio.logo ? (
                            <img className="promo__logo" src={negocio.logo} alt="" />
                          ) : (
                            <span className="promo__marca">{negocio.nombre}</span>
                          )}
                          <span className="promo__categoria">{negocio.rubro}</span>
                        </span>
                        <span className="promo__descuento">{descuento}</span>
                        <span className="promo__direccion">{ubicacion}</span>
                      </button>
                      <button
                        type="button"
                        className={`promo__guardar${guardada ? ' promo__guardar--activo' : ''}`}
                        aria-label={guardada ? `Quitar ${descuento} de favoritos` : `Guardar ${descuento} en favoritos`}
                        aria-pressed={guardada}
                        onClick={() => setGuardadas(cambiarPromoGuardada(negocio.id, idPromo, !guardada))}
                      >
                        <Bookmark size={14} strokeWidth={2.2} fill={guardada ? 'currentColor' : 'none'} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="negocio__vacio">
              <span className="negocio__vacio-icono">
                <Tag size={18} strokeWidth={1.8} />
              </span>
              <p className="negocio__vacio-titulo">
                {ocultasPorTarjetas
                  ? 'No hay promos con tus tarjetas'
                  : 'Este local todavía no tiene promociones'}
              </p>
              <p className="negocio__vacio-texto">
                {ocultasPorTarjetas
                  ? 'Este local tiene promos con otras tarjetas. Seguilo para enterarte cuando publique una nueva.'
                  : 'Seguilo para enterarte cuando publique sus descuentos.'}
              </p>
            </section>
          )}
        </main>
      </div>

      {promoSeleccionada && (
        <DetallePromo
          promo={promoSeleccionada}
          negocio={negocio}
          guardada={estaGuardada(guardadas, negocio.id, promoSeleccionada.id)}
          onGuardar={() =>
            setGuardadas(
              cambiarPromoGuardada(
                negocio.id,
                promoSeleccionada.id,
                !estaGuardada(guardadas, negocio.id, promoSeleccionada.id),
              ),
            )
          }
          onCerrar={() => setPromoAbierta(null)}
        />
      )}

      <Barra />
    </div>
  );
}
