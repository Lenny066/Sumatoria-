import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Barra from '../components/barra';
import BuscadorMapa, { FiltrosMapa } from '../components/BuscadorMapa';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './mapa.css';

const customIcon: L.Icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function Mapa(): React.JSX.Element {
  const [posicion, setPosicion] = useState<[number, number] | null>(null);

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

        <MapContainer center={posicion} zoom={15}>
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
        </MapContainer>
      </div>

      <Barra />
    </div>
  );
}
