import React from 'react';
import { Home, Search, MapPin, Bookmark, User } from 'lucide-react';

export const Barra: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#20134e',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: '8px',
    paddingTop: '6px',
    zIndex: 1000,
    fontFamily: 'sans-serif',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e2e8f0',
  };

  const labelStyle: React.CSSProperties = {
    marginTop: '4px',
    fontSize: '12px',
    fontWeight: 500,
  };

  const centerContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: '8px',
  };

  const centerCircleStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    backgroundColor: '#23c45e',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '5px solid #20134e',
    boxSizing: 'border-box',
    position: 'relative',
    top: '-18px',
  };

  return (
    <nav style={containerStyle}>
      {/* Inicio */}
      <div style={itemStyle}>
        <Home size={24} strokeWidth={1.8} />
        <span style={labelStyle}>Inicio</span>
      </div>

      {/* Buscar */}
      <div style={itemStyle}>
        <Search size={24} strokeWidth={1.8} />
        <span style={labelStyle}>Buscar</span>
      </div>

      {/* Mapa */}
      <div style={centerContainerStyle}>
        <div style={centerCircleStyle}>
          <MapPin size={28} color="#20134e" strokeWidth={2.2} />
        </div>
        <span style={{ ...labelStyle, color: '#23c45e', fontWeight: 'bold', marginTop: '2px' }}>
          Mapa
        </span>
      </div>

      {/* Favoritos */}
      <div style={itemStyle}>
        <Bookmark size={24} strokeWidth={1.8} />
        <span style={labelStyle}>Favoritos</span>
      </div>

      {/* Perfil */}
      <div style={itemStyle}>
        <User size={24} strokeWidth={1.8} />
        <span style={labelStyle}>Perfil</span>
      </div>
    </nav>
  );
};

export default Barra;