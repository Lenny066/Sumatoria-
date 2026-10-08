import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Store,
} from 'lucide-react';
import {
  guardarMiNegocio,
  leerImagen,
  obtenerMiNegocio,
  resumirHorarios,
  type MiNegocio,
} from '../../services/miNegocioService';
import type { Rubro } from '../../services/negociosService';
import './perfileditarnegocio.css';

const RUBROS: { rubro: Rubro; etiqueta: string }[] = [
  { rubro: 'Gastronomía', etiqueta: 'Gastronomía' },
  { rubro: 'Indumentaria', etiqueta: 'Ropa' },
  { rubro: 'Electrodomésticos', etiqueta: 'Electro' },
  { rubro: 'Supermercado', etiqueta: 'Súper' },
  { rubro: 'Farmacia', etiqueta: 'Farmacia' },
  { rubro: 'Librería', etiqueta: 'Librería' },
  { rubro: 'Otro', etiqueta: 'Otro' },
];

const MAXIMO_DESCRIPCION = 150;

const NEGOCIO_EJEMPLO: MiNegocio = {
  id: 'mio-ejemplo',
  nombre: 'Panadería Norte',
  descripcion: 'Panificados y facturas artesanales, recién horneados todos los días.',
  rubro: 'Gastronomía',
  direccion: 'Av. Cabildo 2140, Belgrano',
  logo: '/logos/panaderia-norte.svg',
  horarios: [
    { dia: 'Lunes', abierto: true, desde: '09:00', hasta: '18:00' },
    { dia: 'Martes', abierto: true, desde: '09:00', hasta: '18:00' },
    { dia: 'Miércoles', abierto: true, desde: '09:00', hasta: '18:00' },
    { dia: 'Jueves', abierto: true, desde: '09:00', hasta: '18:00' },
    { dia: 'Viernes', abierto: true, desde: '09:00', hasta: '18:00' },
    { dia: 'Sábado', abierto: true, desde: '09:00', hasta: '13:00' },
    { dia: 'Domingo', abierto: false, desde: '09:00', hasta: '18:00' },
  ],
  mediosPago: ['Efectivo', 'débito', 'crédito'],
};

type Aviso = { tipo: 'ok' | 'error'; texto: string } | null;

export default function PerfilEditarNegocio(): React.JSX.Element {
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState<MiNegocio>(() => obtenerMiNegocio() ?? NEGOCIO_EJEMPLO);
  const [aviso, setAviso] = useState<Aviso>(null);

  useEffect(() => {
    if (!aviso) return;
    const espera = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(espera);
  }, [aviso]);

  function cambiar(cambios: Partial<MiNegocio>) {
    setNegocio((actual) => ({ ...actual, ...cambios }));
  }

  async function cambiarImagen(
    evento: React.ChangeEvent<HTMLInputElement>,
    campo: 'logo' | 'portada',
  ) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    try {
      cambiar({ [campo]: await leerImagen(archivo, campo === 'logo' ? 400 : 1200) });
    } catch {
      setAviso({ tipo: 'error', texto: 'No pudimos cargar la imagen. Probá con otra.' });
    }
  }

  function guardar() {
    const guardado = guardarMiNegocio({
      ...negocio,
      nombre: negocio.nombre.trim(),
      descripcion: negocio.descripcion.trim(),
      direccion: negocio.direccion.trim(),
    });
    setAviso(
      guardado
        ? { tipo: 'ok', texto: 'Cambios guardados' }
        : { tipo: 'error', texto: 'No se pudieron guardar los cambios. Probá con imágenes más livianas.' },
    );
  }

  return (
    <div className="tu-negocio">
      <header className="tu-negocio__cabecera">
        <button type="button" className="tu-negocio__volver" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} strokeWidth={2.4} />
          Perfil
        </button>
        <h1 className="tu-negocio__titulo">Tu negocio</h1>
        <p className="tu-negocio__bajada">Así te ven los clientes en la app</p>
      </header>

      <form
        className="tu-negocio__formulario"
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
      >
        <div className="tu-negocio__scroll">
          <div
            className="tu-negocio__portada"
            style={negocio.portada ? { backgroundImage: `url(${negocio.portada})` } : undefined}
          >
            <label className="tu-negocio__cambiar-portada">
              <Camera size={14} strokeWidth={2.2} />
              Cambiar portada
              <input
                type="file"
                accept="image/*"
                className="tu-negocio__archivo"
                onChange={(e) => cambiarImagen(e, 'portada')}
              />
            </label>
          </div>

          <div className="tu-negocio__identidad">
            <label className="tu-negocio__logo" aria-label="Cambiar logo">
              {negocio.logo ? (
                <img src={negocio.logo} alt="" />
              ) : (
                <Store size={30} strokeWidth={1.6} />
              )}
              <span className="tu-negocio__logo-camara">
                <Camera size={13} strokeWidth={2.2} />
              </span>
              <input
                type="file"
                accept="image/*"
                className="tu-negocio__archivo"
                onChange={(e) => cambiarImagen(e, 'logo')}
              />
            </label>

            <button
              type="button"
              className="tu-negocio__ver"
              onClick={() => navigate(`/negocio/${negocio.id}`)}
            >
              <Eye size={15} strokeWidth={2.2} />
              Ver como cliente
            </button>
          </div>

          <div className="tu-negocio__campos">
            <label className="tu-negocio__etiqueta" htmlFor="tn-nombre">
              Nombre del comercio
            </label>
            <input
              id="tn-nombre"
              className="tu-negocio__campo"
              type="text"
              required
              value={negocio.nombre}
              onChange={(e) => cambiar({ nombre: e.target.value })}
            />

            <div className="tu-negocio__etiqueta-fila">
              <label className="tu-negocio__etiqueta" htmlFor="tn-descripcion">
                Descripción
              </label>
              <span className="tu-negocio__contador">
                {negocio.descripcion.length}/{MAXIMO_DESCRIPCION}
              </span>
            </div>
            <textarea
              id="tn-descripcion"
              className="tu-negocio__campo tu-negocio__campo--texto"
              rows={3}
              maxLength={MAXIMO_DESCRIPCION}
              placeholder="Contales a tus clientes qué ofrecés"
              value={negocio.descripcion}
              onChange={(e) => cambiar({ descripcion: e.target.value })}
            />

            <span className="tu-negocio__etiqueta">Rubro</span>
            <div className="tu-negocio__rubros" role="radiogroup" aria-label="Rubro">
              {RUBROS.map(({ rubro, etiqueta }) => {
                const activo = negocio.rubro === rubro;
                return (
                  <button
                    key={rubro}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    className={`tu-negocio__rubro${activo ? ' tu-negocio__rubro--activo' : ''}`}
                    onClick={() => cambiar({ rubro })}
                  >
                    {activo && <Check size={14} strokeWidth={2.6} />}
                    {etiqueta}
                  </button>
                );
              })}
            </div>

            <label className="tu-negocio__etiqueta" htmlFor="tn-direccion">
              Dirección
            </label>
            <div className="tu-negocio__campo tu-negocio__campo--icono">
              <MapPin size={17} strokeWidth={2} />
              <input
                id="tn-direccion"
                type="text"
                required
                autoComplete="street-address"
                value={negocio.direccion}
                onChange={(e) => cambiar({ direccion: e.target.value })}
              />
            </div>

            <span className="tu-negocio__etiqueta">Más datos</span>
            <div className="tu-negocio__mas-datos">
              <button type="button" className="tu-negocio__dato">
                <span className="tu-negocio__dato-icono">
                  <Clock size={17} strokeWidth={2} />
                </span>
                <span className="tu-negocio__dato-textos">
                  <span className="tu-negocio__dato-titulo">Horarios</span>
                  <span className="tu-negocio__dato-resumen">{resumirHorarios(negocio.horarios)}</span>
                </span>
                <ChevronRight size={17} strokeWidth={2.2} />
              </button>
              <button type="button" className="tu-negocio__dato">
                <span className="tu-negocio__dato-icono">
                  <CreditCard size={17} strokeWidth={2} />
                </span>
                <span className="tu-negocio__dato-textos">
                  <span className="tu-negocio__dato-titulo">Medios de pago</span>
                  <span className="tu-negocio__dato-resumen">
                    {negocio.mediosPago.length > 0 ? negocio.mediosPago.join(', ') : 'Sin cargar'}
                  </span>
                </span>
                <ChevronRight size={17} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>

        <div className="tu-negocio__pie">
          {aviso && (
            <p className={`tu-negocio__aviso tu-negocio__aviso--${aviso.tipo}`} role="status">
              {aviso.texto}
            </p>
          )}
          <button type="submit" className="tu-negocio__guardar">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
