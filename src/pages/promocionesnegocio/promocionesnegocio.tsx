import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, Check, ChevronLeft, Pause, Pencil, Play, Plus, Tag, X } from 'lucide-react';
import type { Dia } from '../../services/negociosService';
import {
  DIAS_CORTOS,
  DIAS_SEMANA,
  MEDIOS_SIMPLES,
  esTarjeta,
  mismoMedio,
  textoDias,
  textoMedioPago,
  type MedioPago,
  type TipoMedioSimple,
} from '../../services/promosService';
import { BANCOS, NOMBRES_MARCA, type Marca, type TipoTarjeta } from '../../services/tarjetasService';
import { haySesionEmpresa, mensajeDeError } from '../../services/apiService';
import {
  crearPromo,
  editarPromo,
  leerImagen,
  obtenerMisPromos,
  type EstadoPromo,
  type PromoNegocio,
} from '../../services/miNegocioService';
import './promocionesnegocio.css';

type Filtro = 'todas' | EstadoPromo;

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'activa', etiqueta: 'Activas' },
  { id: 'pausada', etiqueta: 'Pausadas' },
];

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function textoVence(vence: string): string {
  const [, mes, dia] = vence.split('-').map(Number);
  return `vence el ${dia} ${MESES[mes - 1]}`;
}

function textoCantidad(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

const MARCAS = Object.keys(NOMBRES_MARCA) as Marca[];

const TIPOS_TARJETA: { tipo: TipoTarjeta; etiqueta: string }[] = [
  { tipo: 'debito', etiqueta: 'Débito' },
  { tipo: 'credito', etiqueta: 'Crédito' },
];

type TarjetaNueva = { tipo: TipoTarjeta; marca: Marca | ''; banco: string };

const TARJETA_VACIA: TarjetaNueva = { tipo: 'debito', marca: '', banco: '' };

const MAXIMO_DESCRIPCION = 200;

type EditorPromoProps = {
  promo: PromoNegocio;
  nueva: boolean;
  onCerrar: () => void;
  onGuardar: (promo: PromoNegocio) => void;
};

function EditorPromo({ promo, nueva, onCerrar, onGuardar }: EditorPromoProps): React.JSX.Element {
  const [titulo, setTitulo] = useState(promo.titulo);
  const [dias, setDias] = useState<Dia[]>(promo.dias);
  const [vence, setVence] = useState(promo.vence ?? '');
  const [descripcion, setDescripcion] = useState(promo.descripcion);
  const [imagen, setImagen] = useState(promo.imagen);
  const [mediosPago, setMediosPago] = useState<MedioPago[]>(promo.mediosPago);
  const [tarjetaNueva, setTarjetaNueva] = useState<TarjetaNueva | null>(null);
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    function alApretarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', alApretarTecla);
    return () => window.removeEventListener('keydown', alApretarTecla);
  }, [onCerrar]);

  async function elegirImagen(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    try {
      setImagen(await leerImagen(archivo, 600));
      setErrorImagen(false);
    } catch {
      setErrorImagen(true);
    }
  }

  function alternarDia(dia: Dia) {
    setDias((actuales) =>
      actuales.includes(dia)
        ? actuales.filter((item) => item !== dia)
        : DIAS_SEMANA.filter((item) => item === dia || actuales.includes(item)),
    );
  }

  function alternarMedioSimple(tipo: TipoMedioSimple) {
    setMediosPago((actuales) =>
      actuales.some((medio) => medio.tipo === tipo)
        ? actuales.filter((medio) => medio.tipo !== tipo)
        : [...actuales, { tipo }],
    );
  }

  function agregarTarjeta() {
    if (!tarjetaNueva) return;
    const medio: MedioPago = {
      tipo: tarjetaNueva.tipo,
      marca: tarjetaNueva.marca || null,
      banco: tarjetaNueva.banco || null,
    };
    setMediosPago((actuales) =>
      actuales.some((item) => mismoMedio(item, medio)) ? actuales : [...actuales, medio],
    );
    setTarjetaNueva(null);
  }

  function quitarMedio(medio: MedioPago) {
    setMediosPago((actuales) => actuales.filter((item) => !mismoMedio(item, medio)));
  }

  const tarjetas = mediosPago.filter(esTarjeta);

  function guardar(evento: React.SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    onGuardar({
      ...promo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      imagen,
      dias,
      mediosPago: [
        ...MEDIOS_SIMPLES.filter(({ tipo }) => mediosPago.some((medio) => medio.tipo === tipo)).map(
          ({ tipo }) => ({ tipo }),
        ),
        ...tarjetas,
      ],
      vence: vence || undefined,
    });
  }

  return (
    <div className="editor-promo" role="presentation" onClick={onCerrar}>
      <form
        className="editor-promo__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-promo-titulo"
        onClick={(evento) => evento.stopPropagation()}
        onSubmit={guardar}
      >
        <header className="editor-promo__cabecera">
          <h2 id="editor-promo-titulo" className="editor-promo__titulo">
            {nueva ? 'Nueva promoción' : 'Editar promoción'}
          </h2>
          <button
            type="button"
            className="editor-promo__cerrar"
            aria-label="Cerrar"
            onClick={onCerrar}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className="editor-promo__imagen-fila">
          <label className="editor-promo__imagen" aria-label="Elegir imagen">
            {imagen ? <img src={imagen} alt="" /> : <Camera size={20} strokeWidth={2} />}
            <input
              type="file"
              accept="image/*"
              className="editor-promo__archivo"
              onChange={elegirImagen}
            />
          </label>
          <div className="editor-promo__imagen-textos">
            <span className="editor-promo__etiqueta">
              Imagen <span className="editor-promo__opcional">(opcional)</span>
            </span>
            {imagen ? (
              <button
                type="button"
                className="editor-promo__quitar"
                onClick={() => setImagen(undefined)}
              >
                Quitar imagen
              </button>
            ) : (
              <span className="editor-promo__ayuda">Tocá el cuadro para elegir una foto</span>
            )}
            {errorImagen && (
              <span className="editor-promo__error">No pudimos cargar la imagen. Probá con otra.</span>
            )}
          </div>
        </div>

        <label className="editor-promo__campo">
          <span className="editor-promo__etiqueta">Promoción</span>
          <input
            className="editor-promo__input"
            type="text"
            placeholder="Ej: 20% OFF en toda la tienda"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
          />
        </label>


        <label className="editor-promo__campo">
          <span className="editor-promo__etiqueta-fila">
            <span className="editor-promo__etiqueta">Descripción</span>
            <span className="editor-promo__contador">
              {descripcion.length}/{MAXIMO_DESCRIPCION}
            </span>
          </span>
          <textarea
            className="editor-promo__input editor-promo__input--texto"
            rows={3}
            maxLength={MAXIMO_DESCRIPCION}
            placeholder="Contá de qué se trata la promo y sus condiciones"
            value={descripcion}
            onChange={(evento) => setDescripcion(evento.target.value)}
          />
        </label>

        <div className="editor-promo__campo">
          <span className="editor-promo__etiqueta-fila">
            <span className="editor-promo__etiqueta">Días</span>
            {dias.length > 0 && <span className="editor-promo__contador">{textoDias(dias)}</span>}
          </span>
          <div className="editor-promo__dias" role="group" aria-label="Días">
            {DIAS_SEMANA.map((dia) => {
              const elegido = dias.includes(dia);
              return (
                <button
                  key={dia}
                  type="button"
                  aria-pressed={elegido}
                  aria-label={dia}
                  className={`editor-promo__dia${elegido ? ' editor-promo__dia--activo' : ''}`}
                  onClick={() => alternarDia(dia)}
                >
                  {DIAS_CORTOS[dia]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="editor-promo__campo">
          <span className="editor-promo__etiqueta">Medios de pago</span>
          <div className="editor-promo__medios" role="group" aria-label="Medios de pago">
            {MEDIOS_SIMPLES.map(({ tipo, etiqueta }) => {
              const elegido = mediosPago.some((medio) => medio.tipo === tipo);
              return (
                <button
                  key={tipo}
                  type="button"
                  aria-pressed={elegido}
                  className={`editor-promo__medio${elegido ? ' editor-promo__medio--activo' : ''}`}
                  onClick={() => alternarMedioSimple(tipo)}
                >
                  {elegido && <Check size={13} strokeWidth={2.6} />}
                  {etiqueta}
                </button>
              );
            })}
          </div>

          <span className="editor-promo__subetiqueta">Tarjetas</span>
          {tarjetas.length > 0 && (
            <ul className="editor-promo__tarjetas">
              {tarjetas.map((medio) => (
                <li key={textoMedioPago(medio)} className="editor-promo__tarjeta">
                  <span>{textoMedioPago(medio)}</span>
                  <button
                    type="button"
                    className="editor-promo__tarjeta-quitar"
                    aria-label={`Quitar ${textoMedioPago(medio)}`}
                    onClick={() => quitarMedio(medio)}
                  >
                    <X size={14} strokeWidth={2.4} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tarjetaNueva ? (
            <div className="editor-promo__nueva-tarjeta">
              <div className="editor-promo__tipos" role="radiogroup" aria-label="Tipo de tarjeta">
                {TIPOS_TARJETA.map(({ tipo, etiqueta }) => (
                  <button
                    key={tipo}
                    type="button"
                    role="radio"
                    aria-checked={tarjetaNueva.tipo === tipo}
                    className={`editor-promo__tipo${tarjetaNueva.tipo === tipo ? ' editor-promo__tipo--activo' : ''}`}
                    onClick={() => setTarjetaNueva({ ...tarjetaNueva, tipo })}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              <select
                className="editor-promo__input editor-promo__select"
                aria-label="Marca"
                value={tarjetaNueva.marca}
                onChange={(evento) =>
                  setTarjetaNueva({ ...tarjetaNueva, marca: evento.target.value as Marca | '' })
                }
              >
                <option value="">Todas las marcas</option>
                {MARCAS.map((marca) => (
                  <option key={marca} value={marca}>
                    {NOMBRES_MARCA[marca]}
                  </option>
                ))}
              </select>

              <select
                className="editor-promo__input editor-promo__select"
                aria-label="Banco"
                value={tarjetaNueva.banco}
                onChange={(evento) => setTarjetaNueva({ ...tarjetaNueva, banco: evento.target.value })}
              >
                <option value="">Todos los bancos</option>
                {BANCOS.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>

              <div className="editor-promo__nueva-acciones">
                <button
                  type="button"
                  className="editor-promo__cancelar"
                  onClick={() => setTarjetaNueva(null)}
                >
                  Cancelar
                </button>
                <button type="button" className="editor-promo__agregar" onClick={agregarTarjeta}>
                  Agregar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="editor-promo__agregar-tarjeta"
              onClick={() => setTarjetaNueva(TARJETA_VACIA)}
            >
              <Plus size={14} strokeWidth={2.4} />
              Agregar tarjeta
            </button>
          )}
        </div>

        <label className="editor-promo__campo">
          <span className="editor-promo__etiqueta">
            Vence <span className="editor-promo__opcional">(opcional)</span>
          </span>
          <input
            className="editor-promo__input"
            type="date"
            value={vence}
            onChange={(evento) => setVence(evento.target.value)}
          />
        </label>

        <button type="submit" className="editor-promo__guardar" disabled={titulo.trim() === '' || dias.length === 0 || mediosPago.length === 0}>
          {nueva ? 'Publicar' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}

export default function PromocionesNegocio(): React.JSX.Element {
  const navigate = useNavigate();

  const [promos, setPromos] = useState<PromoNegocio[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [editando, setEditando] = useState<{ promo: PromoNegocio; nueva: boolean } | null>(null);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const sesionEmpresa = haySesionEmpresa();

  useEffect(() => {
    if (!sesionEmpresa) return;
    let cancelado = false;
    obtenerMisPromos()
      .then((datos) => !cancelado && setPromos(datos))
      .catch((err) => !cancelado && setErrorGuardado(mensajeDeError(err, 'No pudimos cargar tus promociones.')));
    return () => {
      cancelado = true;
    };
  }, [sesionEmpresa]);

  function mostrarError(err: unknown) {
    setErrorGuardado(
      mensajeDeError(err, 'No se pudieron guardar los cambios. Probá con una imagen más liviana.'),
    );
  }

  async function actualizar(promoActualizada: PromoNegocio): Promise<boolean> {
    try {
      const guardada = await editarPromo(promoActualizada);
      setPromos((actuales) => actuales.map((promo) => (promo.id === guardada.id ? guardada : promo)));
      setErrorGuardado(null);
      return true;
    } catch (err) {
      mostrarError(err);
      return false;
    }
  }

  async function agregar(promo: PromoNegocio): Promise<boolean> {
    try {
      const nueva = await crearPromo(promo);
      setPromos((actuales) => [nueva, ...actuales]);
      setErrorGuardado(null);
      setFiltro('todas');
      return true;
    } catch (err) {
      mostrarError(err);
      return false;
    }
  }

  function crear() {
    setEditando({
      promo: {
        id: '',
        titulo: '',
        descripcion: '',
        dias: DIAS_SEMANA,
        mediosPago: [],
        estado: 'activa',
      },
      nueva: true,
    });
  }

  function alternarEstado(promo: PromoNegocio) {
    actualizar({ ...promo, estado: promo.estado === 'activa' ? 'pausada' : 'activa' });
  }

  if (!sesionEmpresa) return <Navigate to="/login" replace />;

  const activas = promos.filter(({ estado }) => estado === 'activa').length;
  const pausadas = promos.length - activas;
  const visibles = promos.filter(({ estado }) => filtro === 'todas' || estado === filtro);

  return (
    <div className="promos-negocio">
      <header className="promos-negocio__cabecera">
        <button type="button" className="promos-negocio__volver" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} strokeWidth={2.4} />
          Tu negocio
        </button>

        <h1 className="promos-negocio__titulo">Promociones</h1>
        <p className="promos-negocio__bajada">
          {textoCantidad(activas, 'activa', 'activas')} ·{' '}
          {textoCantidad(pausadas, 'pausada', 'pausadas')}
        </p>

        <div className="promos-negocio__filtros">
          {FILTROS.map(({ id, etiqueta }) => (
            <button
              key={id}
              type="button"
              className={`promos-negocio__filtro${filtro === id ? ' promos-negocio__filtro--activo' : ''}`}
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </header>

      <div className="promos-negocio__scroll">
        {visibles.length > 0 ? (
          <ul className="promos-negocio__lista">
            {visibles.map((promo) => {
              const activa = promo.estado === 'activa';
              const detalle = [textoDias(promo.dias), promo.vence ? textoVence(promo.vence) : null]
                .filter(Boolean)
                .join(' · ');

              return (
                <li key={promo.id} className="promo-negocio">
                  <div className="promo-negocio__encabezado">
                    <span className="promo-negocio__imagen">
                      {promo.imagen ? (
                        <img src={promo.imagen} alt="" />
                      ) : (
                        <Tag size={20} strokeWidth={1.8} />
                      )}
                    </span>

                    <div className="promo-negocio__textos">
                      <span
                        className={`promo-negocio__estado${activa ? ' promo-negocio__estado--activa' : ''}`}
                      >
                        {activa ? 'Activa' : 'Pausada'}
                      </span>
                      <h2 className="promo-negocio__titulo">{promo.titulo}</h2>
                      {detalle && <p className="promo-negocio__detalle">{detalle}</p>}
                      {promo.mediosPago.length > 0 && (
                        <p className="promo-negocio__medios">
                          {promo.mediosPago.map(textoMedioPago).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="promo-negocio__acciones">
                    <button
                      type="button"
                      className="promo-negocio__boton"
                      onClick={() => setEditando({ promo, nueva: false })}
                    >
                      <Pencil size={13} strokeWidth={2.2} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`promo-negocio__boton${activa ? '' : ' promo-negocio__boton--activar'}`}
                      onClick={() => alternarEstado(promo)}
                    >
                      {activa ? (
                        <Pause size={13} strokeWidth={2.2} />
                      ) : (
                        <Play size={13} strokeWidth={2.2} />
                      )}
                      {activa ? 'Pausar' : 'Activar'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="promos-negocio__vacio">
            <span className="promos-negocio__vacio-icono">
              <Tag size={22} strokeWidth={1.9} />
            </span>
            <p className="promos-negocio__vacio-texto">
              {filtro === 'activa'
                ? 'No tenés promociones activas.'
                : filtro === 'pausada'
                  ? 'No tenés promociones pausadas.'
                  : 'Todavía no tenés promociones.'}
            </p>
          </div>
        )}
      </div>

      <footer className="promos-negocio__pie">
        {errorGuardado && (
          <p className="promos-negocio__error" role="status">
            {errorGuardado}
          </p>
        )}
        <button type="button" className="promos-negocio__nueva" onClick={crear}>
          <Plus size={17} strokeWidth={2.4} />
          Nueva promoción
        </button>
      </footer>

      {editando && (
        <EditorPromo
          promo={editando.promo}
          nueva={editando.nueva}
          onCerrar={() => setEditando(null)}
          onGuardar={(promo) => {
            (editando.nueva ? agregar(promo) : actualizar(promo)).then((ok) => {
              if (ok) setEditando(null);
            });
          }}
        />
      )}
    </div>
  );
}
