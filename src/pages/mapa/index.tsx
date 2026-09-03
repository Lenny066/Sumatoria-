import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Bounding box aproximado de Argentina (suroeste y noreste)
const ARGENTINA_BOUNDS: L.LatLngBoundsExpression = [
  [-55.2, -73.6],
  [-21.7, -53.6],
];

// Un ícono de color distinto por tipo de local, para diferenciarlos de un vistazo
const COLORES_POR_TIPO: Record<Local['tipo'], string> = {
  gastronomia: '#e67e22', // naranja
  ropa: '#9b59b6',        // violeta
  otro: '#3498db',        // azul
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

export default function Mapa(): React.JSX.Element {
  const [posicion, setPosicion] = useState<[number, number] | null>(null);
  const [locales, setLocales] = useState<Local[]>([]);
  const [cargandoLocales, setCargandoLocales] = useState(true);
  const [errorLocales, setErrorLocales] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        setPosicion([pos.coords.latitude, pos.coords.longitude]);
      },
      (error: GeolocationPositionError) => {
        console.error("Error al obtener la ubicación:", error.message);
      }
    );
  }, []);

  useEffect(() => {
    fetchLocalesCABA()
      .then((datos) => setLocales(datos))
      .catch((err) => {
        console.error('Error al traer locales de CABA:', err);
        setErrorLocales('No se pudieron cargar los locales. Reintentá más tarde.');
      })
      .finally(() => setCargandoLocales(false));
  }, []);

  if (!posicion) {
    return (
      <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.2rem' }}>
        Obteniendo tu ubicación para cargar ofertas cercanas...
      </p>
    );
  }

  return (
    <div className="mapa-pantalla">
      <BuscadorMapa />

      <div className="mapa-lienzo">
        <FiltrosMapa />

        {errorLocales && (
          <p style={{ textAlign: 'center', color: '#c0392b', fontSize: '0.85rem' }}>
            {errorLocales}
          </p>
        )}

        <MapContainer
          center={posicion}
          zoom={15}
          minZoom={5}
          maxBounds={ARGENTINA_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          <Marker position={posicion} icon={customIcon}>
            <Popup>
              <div style={{ textAlign: 'center', fontSize: '0.95rem' }}>
                <b>📍 Estás aquí</b><br />
                Buscando promociones a tu alrededor.
              </div>
            </Popup>
          </Marker>

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
      </div>

      <Barra />
    </div>
  );
}
