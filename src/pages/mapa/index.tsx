import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Star, Tag } from 'lucide-react';
import Barra from '../../components/barra';
import BuscadorMapa, { FiltrosMapa, type FiltroRapido } from '../../components/BuscadorMapa';
import DetallePromo from '../../components/DetallePromo';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  calcularDistancia,
  calcularEstadoHorario,
  cambiarPromoGuardada,
  coincideBusqueda,
  distanciaKm,
  estaGuardada,
  obtenerNegocios,
  obtenerPromosGuardadas,
  sincronizarPromosGuardadas,
  type Negocio,
  type Promocion,
  type Rubro,
} from '../../services/negociosService';
import { obtenerUsuario } from '../../services/usuarioService';
import './mapa.css';

const customIcon: L.Icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const ARGENTINA_BOUNDS: L.LatLngBoundsExpression = [
  [-55.2, -73.6],
  [-21.7, -53.6],
];

const CENTRO_POR_DEFECTO: [number, number] = [-34.6037, -58.3816];
const ZOOM_POR_DEFECTO = 12;
const ZOOM_UBICADO = 15;
const RADIO_CERCA_KM = 3;
const PUNTUACION_MINIMA = 4.5;

const COLORES_POR_RUBRO: Record<Rubro, string> = {
  'Gastronomía': '#e67e22',
  'Indumentaria': '#9b59b6',
  'Supermercado': '#e5484d',
  'Electrodomésticos': '#5b6cff',
  'Farmacia': '#1f7a3a',
  'Librería': '#f2a516',
  'Otro': '#3498db',
};

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function crearIconoLocal(local: Negocio): L.DivIcon {
  const color = COLORES_POR_RUBRO[local.rubro] ?? COLORES_POR_RUBRO.Otro;
  const [principal, ...resto] = local.promociones;
  const etiqueta = principal
    ? `<span class="icono-local__promo">${escaparHtml(principal.descuento)}${
        resto.length > 0 ? `<span class="icono-local__mas">+${resto.length}</span>` : ''
      }</span>`
    : '';
  return L.divIcon({
    className: 'icono-local',
    html: `${etiqueta}<div style="
      background:${color};
      width:16px;
      height:16px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function CentrarEnPosicion({ posicion }: { posicion: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (posicion) {
      map.flyTo(posicion, ZOOM_UBICADO);
    }
  }, [map, posicion]);

  return null;
}

type EstadoUbicacion = 'inactiva' | 'cargando' | 'activa' | 'error';

function mensajeDeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Bloqueaste el permiso de ubicación. Habilitalo desde la configuración del navegador para ver los locales cerca tuyo.';
    case error.POSITION_UNAVAILABLE:
      return 'No pudimos obtener tu ubicación. Fijate que tengas el GPS prendido.';
    case error.TIMEOUT:
      return 'La ubicación tardó demasiado. Probá de nuevo.';
    default:
      return 'No pudimos obtener tu ubicación. Probá de nuevo en un momento.';
  }
}

export default function Mapa(): React.JSX.Element {
  const navigate = useNavigate();
  const [posicion, setPosicion] = useState<[number, number] | null>(null);
  const [estado, setEstado] = useState<EstadoUbicacion>('inactiva');
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [locales, setLocales] = useState<Negocio[]>([]);
  const [cargandoLocales, setCargandoLocales] = useState(true);
  const [errorLocales, setErrorLocales] = useState<string | null>(null);
  const [guardadas, setGuardadas] = useState(obtenerPromosGuardadas);
  const [abierta, setAbierta] = useState<{ negocio: Negocio; promo: Promocion } | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltroRapido[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const verLocal = useCallback(
    (local: Negocio) =>
      navigate(`/negocio/${local.id}`, {
        state: {
          distancia: posicion ? calcularDistancia(posicion, [local.lat, local.lng]) : undefined,
        },
      }),
    [navigate, posicion],
  );

  function alternarGuardada(negocio: Negocio, promo: Promocion) {
    if (!obtenerUsuario()) {
      navigate('/login');
      return;
    }
    cambiarPromoGuardada(negocio.id, promo.id, !estaGuardada(guardadas, negocio.id, promo.id))
      .then(setGuardadas)
      .catch(() => {});
  }

  useEffect(() => {
    let cancelado = false;
    sincronizarPromosGuardadas()
      .then((datos) => !cancelado && setGuardadas(datos))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const activarUbicacion = useCallback(() => {
    setErrorUbicacion(null);

    if (!('geolocation' in navigator)) {
      setEstado('error');
      setErrorUbicacion(
        'Tu navegador no puede compartir la ubicación. Probá abrir la app con https.'
      );
      return;
    }

    setEstado('cargando');
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        setPosicion([pos.coords.latitude, pos.coords.longitude]);
        setEstado('activa');
      },
      (error: GeolocationPositionError) => {
        console.error('Error al obtener la ubicación:', error.message);
        setEstado('error');
        setErrorUbicacion(mensajeDeError(error));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    let cancelado = false;

    if (!navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((permiso) => {
        if (!cancelado && permiso.state === 'granted') {
          activarUbicacion();
        }
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [activarUbicacion]);

  useEffect(() => {
    obtenerNegocios()
      .then((datos) => setLocales(datos))
      .catch((err) => {
        console.error('Error al traer los locales:', err);
        setErrorLocales('No se pudieron cargar los locales. Reintentá más tarde.');
      })
      .finally(() => setCargandoLocales(false));
  }, []);

  function cambiarFiltro(filtro: FiltroRapido) {
    const activo = filtros.includes(filtro);
    if (filtro === 'cerca' && !activo && !posicion) activarUbicacion();
    setFiltros(activo ? filtros.filter((f) => f !== filtro) : [...filtros, filtro]);
  }

  function cambiarRubro(rubro: Rubro) {
    setRubros(rubros.includes(rubro) ? rubros.filter((r) => r !== rubro) : [...rubros, rubro]);
  }

  const localesFiltrados = useMemo(() => {
    const ahora = new Date();
    return locales.filter(
      (local) =>
        coincideBusqueda(local, busqueda) &&
        (rubros.length === 0 || rubros.includes(local.rubro)) &&
        (!filtros.includes('cerca') ||
          !posicion ||
          distanciaKm(posicion, [local.lat, local.lng]) <= RADIO_CERCA_KM) &&
        (!filtros.includes('abierto') ||
          calcularEstadoHorario(local.horarios, ahora)?.abierto === true) &&
        (!filtros.includes('puntuados') || (local.puntuacion ?? 0) >= PUNTUACION_MINIMA),
    );
  }, [locales, busqueda, rubros, filtros, posicion]);

  const promosVisibles = useMemo(() => {
    const lista = localesFiltrados.flatMap((negocio) =>
      negocio.promociones.map((promo) => ({
        negocio,
        promo,
        km: posicion ? distanciaKm(posicion, [negocio.lat, negocio.lng]) : null,
      })),
    );
    if (filtros.includes('puntuados')) {
      return lista.sort((a, b) => (b.negocio.puntuacion ?? 0) - (a.negocio.puntuacion ?? 0));
    }
    return posicion ? lista.sort((a, b) => (a.km ?? 0) - (b.km ?? 0)) : lista;
  }, [localesFiltrados, filtros, posicion]);

  const hayFiltros = busqueda.trim() !== '' || rubros.length > 0 || filtros.length > 0;
  const mostrarInvitacion = estado !== 'activa';

  return (
    <div className="mapa-pantalla">
      <BuscadorMapa busqueda={busqueda} onBuscar={setBusqueda} />

      <div className={`mapa-lienzo${!cargandoLocales && !errorLocales ? ' mapa-lienzo--con-promos' : ''}`}>
        <FiltrosMapa
          activos={filtros}
          onCambiarFiltro={cambiarFiltro}
          rubros={rubros}
          onCambiarRubro={cambiarRubro}
          onLimpiarRubros={() => setRubros([])}
          panelAbierto={panelAbierto}
          onAlternarPanel={() => setPanelAbierto(!panelAbierto)}
        />

        {errorLocales && (
          <p className="mapa-error-locales">{errorLocales}</p>
        )}

        <MapContainer
          center={CENTRO_POR_DEFECTO}
          zoom={ZOOM_POR_DEFECTO}
          minZoom={5}
          maxBounds={ARGENTINA_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          <CentrarEnPosicion posicion={posicion} />

          {posicion && (
            <Marker position={posicion} icon={customIcon}>
              <Popup>
                <div style={{ textAlign: 'center', fontSize: '0.95rem' }}>
                  <b>📍 Estás aquí</b><br />
                  Buscando promociones a tu alrededor.
                </div>
              </Popup>
            </Marker>
          )}

          {!cargandoLocales && (
            <MarkerClusterGroup chunkedLoading>
              {localesFiltrados.map((local) => (
                <Marker
                  key={local.id}
                  position={[local.lat, local.lng]}
                  icon={crearIconoLocal(local)}
                >
                  <Popup>
                    <div style={{ fontSize: '0.9rem' }}>
                      <b>{local.nombre}</b><br />
                      {local.rubro}
                      {local.puntuacion !== undefined && (
                        <span className="mapa-puntuacion">
                          <Star size={12} color="#f5b301" fill="#f5b301" strokeWidth={1.6} />
                          {local.puntuacion.toFixed(1)}
                        </span>
                      )}
                      <br />
                      {local.direccion}
                      {local.promociones.length > 0 ? (
                        <ul className="mapa-promos">
                          {local.promociones.map((promo) => (
                            <li key={promo.id}>
                              <button
                                type="button"
                                className="mapa-promo"
                                onClick={() => setAbierta({ negocio: local, promo })}
                              >
                                <span className="mapa-promo__textos">
                                  <span className="mapa-promo__descuento">{promo.descuento}</span>
                                  {promo.descripcion && (
                                    <span className="mapa-promo__descripcion">{promo.descripcion}</span>
                                  )}
                                </span>
                                <ChevronRight size={16} strokeWidth={2.2} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mapa-sin-promos">Este local no tiene promos por ahora.</p>
                      )}
                      <button
                        type="button"
                        className="mapa-ver-local"
                        onClick={() => verLocal(local)}
                      >
                        Ver local
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>

        {!cargandoLocales && !errorLocales && (
          <section className="mapa-promos-cerca" aria-label="Promos en el mapa">
            <p className="mapa-promos-cerca__titulo">
              {posicion ? 'Promos cerca tuyo' : 'Promos en el mapa'}
              <span className="mapa-promos-cerca__cantidad">{promosVisibles.length}</span>
            </p>
            {promosVisibles.length > 0 ? (
              <ul className="mapa-promos-cerca__lista">
                {promosVisibles.map(({ negocio, promo, km }) => (
                  <li key={`${negocio.id}-${promo.id}`}>
                    <button
                      type="button"
                      className="mapa-tarjeta"
                      onClick={() => setAbierta({ negocio, promo })}
                    >
                      <span className="mapa-tarjeta__logo">
                        {negocio.logo ? (
                          <img src={negocio.logo} alt="" />
                        ) : (
                          <Tag size={16} strokeWidth={2} />
                        )}
                      </span>
                      <span className="mapa-tarjeta__textos">
                        <span className="mapa-tarjeta__descuento">{promo.descuento}</span>
                        <span className="mapa-tarjeta__local">{negocio.nombre}</span>
                        {km !== null && (
                          <span className="mapa-tarjeta__distancia">{km.toFixed(1)} km</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mapa-promos-cerca__vacio">
                {hayFiltros
                  ? 'No hay promos con esos filtros. Probá sacando alguno.'
                  : 'Todavía no hay promos en el mapa.'}
              </p>
            )}
          </section>
        )}

        {mostrarInvitacion && (
          <div className="geo">
            <div className="geo__contenido">
              <p className="geo__texto">
                Activá tu ubicación para ver los
                <br />
                locales cerca tuyo en el mapa
              </p>

              {errorUbicacion && <p className="geo__error">{errorUbicacion}</p>}

              <button
                type="button"
                className="geo__boton"
                onClick={activarUbicacion}
                disabled={estado === 'cargando'}
              >
                <MapPin size={18} strokeWidth={2.3} />
                {estado === 'cargando'
                  ? 'Buscándote...'
                  : estado === 'error'
                    ? 'Reintentar'
                    : 'Activar ubicación'}
              </button>
            </div>
          </div>
        )}
      </div>

      {abierta && (
        <DetallePromo
          promo={abierta.promo}
          negocio={abierta.negocio}
          guardada={estaGuardada(guardadas, abierta.negocio.id, abierta.promo.id)}
          onGuardar={() => alternarGuardada(abierta.negocio, abierta.promo)}
          onCerrar={() => setAbierta(null)}
          onVerLocal={() => verLocal(abierta.negocio)}
        />
      )}

      <Barra />
    </div>
  );
}

