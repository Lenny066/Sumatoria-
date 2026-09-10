import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import Barra from '../../components/barra';
import BuscadorMapa, { FiltrosMapa } from '../../components/BuscadorMapa';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { fetchLocalesCABA } from '../../services/overpassService';
import type { Local } from '../../services/overpassService';
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

const COLORES_POR_TIPO: Record<Local['tipo'], string> = {
  gastronomia: '#e67e22',
  ropa: '#9b59b6',
  otro: '#3498db',
};

function crearIconoLocal(tipo: Local['tipo']): L.DivIcon {
  const color = COLORES_POR_TIPO[tipo];
  return L.divIcon({
    className: 'icono-local',
    html: `<div style="
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
  const [posicion, setPosicion] = useState<[number, number] | null>(null);
  const [estado, setEstado] = useState<EstadoUbicacion>('inactiva');
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [locales, setLocales] = useState<Local[]>([]);
  const [cargandoLocales, setCargandoLocales] = useState(true);
  const [errorLocales, setErrorLocales] = useState<string | null>(null);

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
    fetchLocalesCABA()
      .then((datos) => setLocales(datos))
      .catch((err) => {
        console.error('Error al traer locales de CABA:', err);
        setErrorLocales('No se pudieron cargar los locales. Reintentá más tarde.');
      })
      .finally(() => setCargandoLocales(false));
  }, []);

  const mostrarInvitacion = estado !== 'activa';

  return (
    <div className="mapa-pantalla">
      <BuscadorMapa />

      <div className="mapa-lienzo">
        <FiltrosMapa />

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
              {locales.map((local) => (
                <Marker
                  key={local.id}
                  position={[local.lat, local.lng]}
                  icon={crearIconoLocal(local.tipo)}
                >
                  <Popup>
                    <div style={{ fontSize: '0.9rem' }}>
                      <b>{local.nombre}</b><br />
                      {local.categoria}
                      {local.direccion && (
                        <>
                          <br />
                          {local.direccion}
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>

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

      <Barra />
    </div>
  );
}


  //Escuchame, vas a hacer una nueva pantalla que va a ser la del perfil. Osea cuando vos en la barra de abajo le das a perfil, se va a abrir esta pantalla.Hay alguunas cosas en la imagen que vos no vas a poner.  La parte de los puntos no la pones. 