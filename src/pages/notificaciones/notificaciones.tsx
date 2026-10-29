import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Clock, Tag } from 'lucide-react';
import Barra from '../../components/barra';
import InvitarCuenta from '../../components/InvitarCuenta';
import { obtenerUsuario } from '../../services/usuarioService';
import {
  marcarLeidas,
  obtenerNotificaciones,
  type Notificacion,
  type TipoNotificacion,
} from '../../services/notificacionesService';
import './notificaciones.css';

type Filtro = 'todas' | 'nuevas' | 'por-vencer';

const FILTROS: { id: Filtro; etiqueta: string; tipos: TipoNotificacion[] }[] = [
  { id: 'todas', etiqueta: 'Todas', tipos: ['promo', 'vencimiento'] },
  { id: 'nuevas', etiqueta: 'Promos nuevas', tipos: ['promo'] },
  { id: 'por-vencer', etiqueta: 'Por vencer', tipos: ['vencimiento'] },
];

const ICONOS: Record<TipoNotificacion, typeof Bell> = {
  promo: Tag,
  vencimiento: Clock,
};

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function inicioDelDia(fecha: Date): number {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
}

function diasAtras(fecha: Date, ahora: Date): number {
  return Math.round((inicioDelDia(ahora) - inicioDelDia(fecha)) / (24 * 60 * 60 * 1000));
}

function textoTiempo(fecha: Date, ahora: Date): string {
  const minutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
  const dias = diasAtras(fecha, ahora);
  if (dias === 0) {
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos} min`;
    return `${Math.floor(minutos / 60)} h`;
  }
  if (dias === 1) return 'Ayer';
  if (dias < 7) return DIAS_CORTOS[fecha.getDay()];
  return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
}

function grupoDe(fecha: Date, ahora: Date): string {
  const dias = diasAtras(fecha, ahora);
  if (dias === 0) return 'Hoy';
  if (dias < 7) return 'Esta semana';
  return 'Anteriores';
}

export default function Notificaciones(): React.JSX.Element {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null);
  const [leidas, setLeidas] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');

  useEffect(() => {
    let cancelado = false;
    obtenerNotificaciones()
      .then((datos) => {
        if (cancelado) return;
        setNotificaciones(datos);
        setLeidas(datos.filter(({ leida }) => leida).map(({ id }) => id));
      })
      .catch(() => !cancelado && setNotificaciones([]));
    return () => {
      cancelado = true;
    };
  }, []);

  const ahora = new Date();
  const tipos = FILTROS.find(({ id }) => id === filtro)?.tipos ?? [];
  const visibles = (notificaciones ?? [])
    .filter(({ tipo }) => tipos.includes(tipo))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const grupos: { titulo: string; items: Notificacion[] }[] = [];
  for (const notificacion of visibles) {
    const titulo = grupoDe(new Date(notificacion.fecha), ahora);
    const grupo = grupos.find((item) => item.titulo === titulo);
    if (grupo) grupo.items.push(notificacion);
    else grupos.push({ titulo, items: [notificacion] });
  }

  const haySinLeer = (notificaciones ?? []).some(({ id }) => !leidas.includes(id));

  function leerTodas() {
    setLeidas((notificaciones ?? []).map(({ id }) => id));
    marcarLeidas().catch(() => {});
  }

  function abrir(notificacion: Notificacion) {
    setLeidas((actuales) => [...actuales, notificacion.id]);
    marcarLeidas([notificacion.id]).catch(() => {});
    navigate(`/negocio/${notificacion.negocioId}`);
  }

  if (!obtenerUsuario()) {
    return (
      <div className="notificaciones">
        <header className="notificaciones__cabecera">
          <div className="notificaciones__fila">
            <button type="button" className="notificaciones__volver" onClick={() => navigate(-1)}>
              <ChevronLeft size={18} strokeWidth={2.4} />
              Inicio
            </button>
          </div>

          <h1 className="notificaciones__titulo">Notificaciones</h1>
        </header>

        <div className="notificaciones__scroll">
          <InvitarCuenta
            icono={Bell}
            titulo="Creá tu cuenta para recibir avisos"
            texto="Te avisamos cuando los locales que seguís publiquen una promo nueva o cuando alguna esté por vencer."
          />
        </div>

        <Barra />
      </div>
    );
  }

  return (
    <div className="notificaciones">
      <header className="notificaciones__cabecera">
        <div className="notificaciones__fila">
          <button type="button" className="notificaciones__volver" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} strokeWidth={2.4} />
            Inicio
          </button>
          <button
            type="button"
            className="notificaciones__leer"
            disabled={!haySinLeer}
            onClick={leerTodas}
          >
            Leer todas
          </button>
        </div>

        <h1 className="notificaciones__titulo">Notificaciones</h1>

        <div className="notificaciones__filtros">
          {FILTROS.map(({ id, etiqueta }) => (
            <button
              key={id}
              type="button"
              className={`notificaciones__filtro${filtro === id ? ' notificaciones__filtro--activo' : ''}`}
              aria-pressed={filtro === id}
              onClick={() => setFiltro(id)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </header>

      <div className="notificaciones__scroll">
        {notificaciones === null ? (
          <p className="notificaciones__cargando">Cargando...</p>
        ) : grupos.length > 0 ? (
          grupos.map(({ titulo, items }) => (
            <section key={titulo} className="notificaciones__grupo">
              <h2 className="notificaciones__grupo-titulo">{titulo}</h2>
              <ul className="notificaciones__lista">
                {items.map((notificacion) => {
                  const Icono = ICONOS[notificacion.tipo];
                  const sinLeer = !leidas.includes(notificacion.id);
                  return (
                    <li key={notificacion.id}>
                      <button
                        type="button"
                        className="aviso"
                        onClick={() => abrir(notificacion)}
                      >
                        <span className={`aviso__icono aviso__icono--${notificacion.tipo}`}>
                          <Icono size={18} strokeWidth={2} />
                        </span>
                        <span className="aviso__textos">
                          <span className="aviso__titulo">{notificacion.titulo}</span>
                          <span className="aviso__texto">{notificacion.texto}</span>
                        </span>
                        <span className="aviso__lado">
                          <span className="aviso__tiempo">
                            {textoTiempo(new Date(notificacion.fecha), ahora)}
                          </span>
                          {sinLeer && <span className="aviso__punto" aria-label="Sin leer" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        ) : (
          <div className="notificaciones-vacio">
            <span className="notificaciones-vacio__icono">
              <Bell size={22} strokeWidth={1.9} />
            </span>
            <h2 className="notificaciones-vacio__titulo">No tenés notificaciones</h2>
            <p className="notificaciones-vacio__texto">
              Te avisamos cuando los locales que seguís publiquen una promo nueva o cuando
              alguna esté por vencer.
            </p>
            <button
              type="button"
              className="notificaciones-vacio__boton"
              onClick={() => navigate('/negocios-que-sigo')}
            >
              Ver negocios que sigo
            </button>
          </div>
        )}
      </div>

      <Barra />
    </div>
  );
}
