import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Store,
  Tag,
  X,
} from 'lucide-react';
import {
  guardarMiNegocio,
  leerImagen,
  obtenerMiNegocio,
  obtenerMisPromos,
  resumirHorarios,
  type MiNegocio,
  type PromoNegocio,
} from '../../services/miNegocioService';
import type { Horario, Rubro } from '../../services/negociosService';
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

function resumirPromos(promos: PromoNegocio[]): string {
  if (promos.length === 0) return 'Sin promociones cargadas';
  const activas = promos.filter(({ estado }) => estado === 'activa').length;
  const pausadas = promos.length - activas;
  return `${activas} ${activas === 1 ? 'activa' : 'activas'} · ${pausadas} ${pausadas === 1 ? 'pausada' : 'pausadas'}`;
}

function textoHorario({ desde, hasta }: Horario): string | null {
  if (desde === '' || hasta === '') return null;
  if (desde === hasta) return 'Abierto las 24 horas';
  if (hasta < desde) return 'Cierra al día siguiente';
  return null;
}

type EditorHorariosProps = {
  horarios: Horario[];
  onCerrar: () => void;
  onListo: (horarios: Horario[]) => void;
};

function EditorHorarios({ horarios, onCerrar, onListo }: EditorHorariosProps): React.JSX.Element {
  const [borrador, setBorrador] = useState<Horario[]>(horarios);

  useEffect(() => {
    function alApretarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', alApretarTecla);
    return () => window.removeEventListener('keydown', alApretarTecla);
  }, [onCerrar]);

  function actualizar(indice: number, cambios: Partial<Horario>) {
    setBorrador((actuales) =>
      actuales.map((horario, i) => (i === indice ? { ...horario, ...cambios } : horario)),
    );
  }

  function copiarATodos(origen: Horario) {
    setBorrador((actuales) =>
      actuales.map((horario) =>
        horario.abierto ? { ...horario, desde: origen.desde, hasta: origen.hasta } : horario,
      ),
    );
  }

  const incompleto = borrador.some(
    ({ abierto, desde, hasta }) => abierto && (desde === '' || hasta === ''),
  );
  const primerAbierto = borrador.find(({ abierto }) => abierto);

  return (
    <div className="horarios" role="presentation" onClick={onCerrar}>
      <section
        className="horarios__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="horarios-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="horarios__cabecera">
          <div>
            <h2 id="horarios-titulo" className="horarios__titulo">
              Horarios
            </h2>
            <p className="horarios__bajada">Elegí qué días abrís y en qué horario</p>
          </div>
          <button type="button" className="horarios__cerrar" aria-label="Cerrar" onClick={onCerrar}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <ul className="horarios__lista">
          {borrador.map((horario, indice) => (
            <li key={horario.dia} className="horarios__fila">
              <div className="horarios__dia">
                <span className="horarios__nombre">{horario.dia}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={horario.abierto}
                  aria-label={`${horario.dia} abierto`}
                  className={`horarios__interruptor${horario.abierto ? ' horarios__interruptor--activo' : ''}`}
                  onClick={() => actualizar(indice, { abierto: !horario.abierto })}
                >
                  <span className="horarios__perilla" />
                </button>
              </div>

              {horario.abierto ? (
                <div className="horarios__horario">
                  <div className="horarios__horas">
                    <input
                      type="time"
                      className="horarios__hora"
                      aria-label={`${horario.dia}: abre a las`}
                      value={horario.desde}
                      onChange={(evento) => actualizar(indice, { desde: evento.target.value })}
                    />
                    <span className="horarios__a">a</span>
                    <input
                      type="time"
                      className="horarios__hora"
                      aria-label={`${horario.dia}: cierra a las`}
                      value={horario.hasta}
                      onChange={(evento) => actualizar(indice, { hasta: evento.target.value })}
                    />
                  </div>
                  {textoHorario(horario) && (
                    <span className="horarios__nota">{textoHorario(horario)}</span>
                  )}
                </div>
              ) : (
                <span className="horarios__cerrado">Cerrado</span>
              )}
            </li>
          ))}
        </ul>

        {primerAbierto && (
          <button
            type="button"
            className="horarios__copiar"
            onClick={() => copiarATodos(primerAbierto)}
          >
            Usar el horario del {primerAbierto.dia.toLowerCase()} en todos los días abiertos
          </button>
        )}

        {incompleto && (
          <p className="horarios__error">
            Completá la hora de apertura y de cierre de los días abiertos.
          </p>
        )}

        <button
          type="button"
          className="horarios__listo"
          disabled={incompleto}
          onClick={() => onListo(borrador)}
        >
          Listo
        </button>
      </section>
    </div>
  );
}

export default function PerfilEditarNegocio(): React.JSX.Element {
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState<MiNegocio>(() => obtenerMiNegocio() ?? NEGOCIO_EJEMPLO);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [editandoHorarios, setEditandoHorarios] = useState(false);
  const [promos] = useState(obtenerMisPromos);

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
              <button
                type="button"
                className="tu-negocio__dato"
                onClick={() => setEditandoHorarios(true)}
              >
                <span className="tu-negocio__dato-icono">
                  <Clock size={17} strokeWidth={2} />
                </span>
                <span className="tu-negocio__dato-textos">
                  <span className="tu-negocio__dato-titulo">Horarios</span>
                  <span className="tu-negocio__dato-resumen">{resumirHorarios(negocio.horarios)}</span>
                </span>
                <ChevronRight size={17} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                className="tu-negocio__dato"
                onClick={() => navigate('/promociones-negocio')}
              >
                <span className="tu-negocio__dato-icono">
                  <Tag size={17} strokeWidth={2} />
                </span>
                <span className="tu-negocio__dato-textos">
                  <span className="tu-negocio__dato-titulo">Editar promociones</span>
                  <span className="tu-negocio__dato-resumen">{resumirPromos(promos)}</span>
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

      {editandoHorarios && (
        <EditorHorarios
          horarios={negocio.horarios}
          onCerrar={() => setEditandoHorarios(false)}
          onListo={(horarios) => {
            cambiar({ horarios });
            setEditandoHorarios(false);
          }}
        />
      )}
    </div>
  );
}
