import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  Search,
  CreditCard,
  Lock,
  Star,
  UtensilsCrossed,
  Shirt,
  BookOpen,
  WashingMachine,
  ShoppingCart,
  Flame,
  Smile,
  Sparkles,
  Tag,
} from 'lucide-react';
import Barra from '../../components/barra';
import DetallePromo from '../../components/DetallePromo';
import { obtenerIniciales, obtenerUsuario } from '../../services/usuarioService';
import {
  buscarNegocios,
  cambiarPromoGuardada,
  estaGuardada,
  normalizar,
  obtenerPromosGuardadas,
  obtenerSeccionesInicio,
  sincronizarPromosGuardadas,
  type Negocio,
  type Promocion,
  type Rubro,
  type SeccionesInicio,
} from '../../services/negociosService';
import { hayNotificacionesSinLeer } from '../../services/notificacionesService';
import './inicio.css';

type Categoria = {
  id: string;
  etiqueta: string;
  icono: typeof Star;
  rubro: Rubro | null;
};

const CATEGORIAS: Categoria[] = [
  { id: 'todos', etiqueta: 'Todos', icono: Star, rubro: null },
  { id: 'gastronomia', etiqueta: 'Gastronomía', icono: UtensilsCrossed, rubro: 'Gastronomía' },
  { id: 'indumentaria', etiqueta: 'Indumentaria', icono: Shirt, rubro: 'Indumentaria' },
  { id: 'electrodomesticos', etiqueta: 'Electrodomésticos', icono: WashingMachine, rubro: 'Electrodomésticos' },
  { id: 'supermercados', etiqueta: 'Supermercados', icono: ShoppingCart, rubro: 'Supermercado' },
  { id: 'libreria', etiqueta: 'Librería', icono: BookOpen, rubro: 'Librería' },
];

const SECCIONES = [
  {
    id: 'hot',
    emoji: '🔥',
    titulo: 'Ofertas hot',
    bajada: null,
    icono: Flame,
    vacioTitulo: 'Todavía no hay ofertas cerca tuyo',
    vacioTexto: 'Cuando los locales de tu zona publiquen sus promos, las vas a ver acá.',
  },
  {
    id: 'sugeridas',
    emoji: '😊',
    titulo: 'Creemos que te va a gustar',
    bajada: 'Según tus compras',
    icono: Smile,
    vacioTitulo: 'Todavía no tenemos sugerencias',
    vacioTexto: 'A medida que uses Sumatoria vamos a recomendarte promos parecidas a lo que canjeás.',
  },
  {
    id: 'elegidos',
    emoji: '⭐',
    titulo: 'Los más elegidos',
    bajada: 'Lo más canjeado cerca tuyo',
    icono: Sparkles,
    vacioTitulo: 'Todavía no hay promos canjeadas',
    vacioTexto: 'Cuando la gente empiece a canjear, acá van a aparecer las promos más elegidas de tu zona.',
  },
  {
    id: 'nuevos',
    emoji: '🆕',
    titulo: 'Promos nuevas',
    bajada: 'Recién publicadas',
    icono: Tag,
    vacioTitulo: 'Todavía no hay promos nuevas',
    vacioTexto: 'Cada vez que un local publique una promo nueva la vas a encontrar en esta sección.',
  },
] as const;

type PromoDeLocal = { negocio: Negocio; promo: Promocion };

function promosDe(negocios: Negocio[]): PromoDeLocal[] {
  return negocios.flatMap((negocio) => negocio.promociones.map((promo) => ({ negocio, promo })));
}

type TarjetaPromoProps = {
  item: PromoDeLocal;
  guardada: boolean;
  onAbrir: () => void;
  onGuardar: () => void;
};

function TarjetaPromo({ item: { negocio, promo }, guardada, onAbrir, onGuardar }: TarjetaPromoProps) {
  return (
    <article className="local local--promo">
      <button type="button" className="local__abrir" onClick={onAbrir}>
        <span className="local__imagen">
          {promo.imagen ? (
            <img className="local__foto" src={promo.imagen} alt="" />
          ) : negocio.logo ? (
            <img className="local__logo" src={negocio.logo} alt="" />
          ) : (
            <span className="local__marca">{negocio.nombre}</span>
          )}
          <span className="local__rubro">{negocio.rubro}</span>
        </span>
        <span className="local__promo">{promo.descuento}</span>
        <span className="local__nombre">{negocio.nombre}</span>
        <span className="local__direccion">{negocio.direccion}</span>
      </button>
      <button
        type="button"
        className={`local__guardar${guardada ? ' local__guardar--activo' : ''}`}
        aria-label={guardada ? `Quitar ${promo.descuento} de favoritos` : `Guardar ${promo.descuento} en favoritos`}
        aria-pressed={guardada}
        onClick={onGuardar}
      >
        <Bookmark size={14} strokeWidth={2.2} fill={guardada ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}

function TarjetaCargando() {
  return (
    <div className="local local--cargando" aria-hidden="true">
      <span className="local__imagen cargando" />
      <span className="cargando cargando__linea cargando__linea--corta" />
      <span className="cargando cargando__linea" />
      <span className="cargando cargando__linea cargando__linea--media" />
    </div>
  );
}

function TarjetaLocal({ negocio, onAbrir }: { negocio: Negocio; onAbrir: () => void }) {
  const cantidad = negocio.promociones.length;

  return (
    <button type="button" className="local local__abrir" onClick={onAbrir}>
      <span className="local__imagen">
        <span className="local__rubro">{negocio.rubro}</span>
        {negocio.logo ? (
          <img className="local__logo" src={negocio.logo} alt="" />
        ) : (
          <span className="local__marca">{negocio.nombre}</span>
        )}
      </span>
      <span className="local__promo">{negocio.nombre}</span>
      <span className="local__nombre">
        {cantidad === 0 ? 'Sin promociones' : `${cantidad} ${cantidad === 1 ? 'promo' : 'promos'}`}
      </span>
      <span className="local__direccion">{negocio.direccion}</span>
    </button>
  );
}

export default function Inicio(): React.JSX.Element {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState<string>('todos');
  const [secciones, setSecciones] = useState<SeccionesInicio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<{ texto: string; negocios: Negocio[] } | null>(null);

  const [sinLeer, setSinLeer] = useState(false);
  const [guardadas, setGuardadas] = useState(obtenerPromosGuardadas);
  const [abierta, setAbierta] = useState<PromoDeLocal | null>(null);

  const buscando = busqueda.trim() !== '';
  const categoriaActiva = CATEGORIAS.find(({ id }) => id === categoria) ?? CATEGORIAS[0];
  const hayPromos =
    secciones !== null && Object.values(secciones).some((lista) => promosDe(lista).length > 0);

  useEffect(() => {
    let cancelado = false;
    sincronizarPromosGuardadas()
      .then((datos) => !cancelado && setGuardadas(datos))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    hayNotificacionesSinLeer()
      .then((hay) => !cancelado && setSinLeer(hay))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    obtenerSeccionesInicio()
      .then((datos) => !cancelado && setSecciones(datos))
      .catch((err) => console.error('Error al traer las secciones de inicio:', err))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!buscando) return;
    let cancelado = false;
    const espera = setTimeout(() => {
      buscarNegocios(busqueda)
        .then((negocios) => !cancelado && setResultados({ texto: busqueda, negocios }))
        .catch(() => !cancelado && setResultados({ texto: busqueda, negocios: [] }));
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [busqueda, buscando]);

  const abrirNegocio = (negocio: Negocio) => navigate(`/negocio/${negocio.id}`);

  function alternarGuardada({ negocio, promo }: PromoDeLocal) {
    if (!obtenerUsuario()) {
      navigate('/login');
      return;
    }
    cambiarPromoGuardada(negocio.id, promo.id, !estaGuardada(guardadas, negocio.id, promo.id))
      .then(setGuardadas)
      .catch(() => {});
  }

  function tarjetaPromo(item: PromoDeLocal) {
    return (
      <TarjetaPromo
        key={`${item.negocio.id}-${item.promo.id}`}
        item={item}
        guardada={estaGuardada(guardadas, item.negocio.id, item.promo.id)}
        onAbrir={() => setAbierta(item)}
        onGuardar={() => alternarGuardada(item)}
      />
    );
  }

  const textoBuscado = normalizar(resultados?.texto ?? '');
  const coincide = (campo?: string) => !!campo && normalizar(campo).includes(textoBuscado);
  const localesEncontrados = (resultados?.negocios ?? []).filter(
    (negocio) => coincide(negocio.nombre) || coincide(negocio.rubro),
  );
  const promosEncontradas = promosDe(resultados?.negocios ?? []).filter(
    ({ negocio, promo }) =>
      coincide(promo.descuento) ||
      coincide(promo.descripcion) ||
      coincide(negocio.nombre) ||
      coincide(negocio.rubro),
  );
  const usuario = obtenerUsuario();

  return (
    <div className="inicio">
      <header className="inicio__cabecera">
        <div className="inicio__fila-superior">
          <div className="inicio__acciones">
            <button
              type="button"
              className="inicio__campana"
              aria-label="Notificaciones"
              onClick={() => navigate('/notificaciones')}
            >
              <Bell size={19} strokeWidth={2} />
              {usuario && sinLeer && <span className="inicio__punto" />}
            </button>
            {usuario && (
              <button
                type="button"
                className="inicio__avatar"
                aria-label="Perfil"
                onClick={() => navigate('/perfil')}
              >
                {usuario.foto ? (
                  <img src={usuario.foto} alt="" referrerPolicy="no-referrer" />
                ) : (
                  obtenerIniciales(usuario.nombre)
                )}
              </button>
            )}
          </div>
        </div>

        <div className="inicio__buscador">
          <Search className="inicio__lupa" size={16} strokeWidth={2.2} />
          <input
            className="inicio__input"
            type="search"
            placeholder="Busca locales y promociones"
            aria-label="Busca locales y promociones"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </header>

      <div className="inicio__scroll">
        <div className="inicio__tarjetas">
          <section className="tarjeta-ahorro">
            <p className="tarjeta-ahorro__rotulo">Ahorraste este mes</p>
            <p className="tarjeta-ahorro__monto">$0</p>
            <p className="tarjeta-ahorro__ayuda">
              Empezá a canjear promos para ver tu ahorro acá
            </p>
          </section>

          <button
            type="button"
            className="tarjeta-banco"
            onClick={() => navigate(usuario ? '/agregar-tarjeta' : '/registrarse')}
          >
            <div className="tarjeta-banco__texto">
              <span className="tarjeta-banco__titulo">
                <Lock size={14} strokeWidth={2.4} />
                Nuevo en Sumatoria
              </span>
              <span className="tarjeta-banco__bajada">
                Sumá tu tarjeta y descubrí promos bancarias exclusivas
              </span>
            </div>
            <span className="tarjeta-banco__icono">
              <CreditCard size={19} strokeWidth={2} />
            </span>
          </button>
        </div>

        <main className="inicio__cuerpo">
          {buscando ? (
            <section className="seccion">
              <div className="seccion__encabezado">
                <h2 className="seccion__titulo">Resultados</h2>
              </div>

              {resultados?.texto !== busqueda ? (
                <p className="seccion__bajada">Buscando...</p>
              ) : promosEncontradas.length > 0 || localesEncontrados.length > 0 ? (
                <>
                  {promosEncontradas.length > 0 && (
                    <>
                      <h3 className="resultados__titulo">Promociones</h3>
                      <div className="resultados">{promosEncontradas.map(tarjetaPromo)}</div>
                    </>
                  )}
                  {localesEncontrados.length > 0 && (
                    <>
                      <h3 className="resultados__titulo">Locales</h3>
                      <div className="resultados">
                        {localesEncontrados.map((negocio) => (
                          <TarjetaLocal
                            key={negocio.id}
                            negocio={negocio}
                            onAbrir={() => abrirNegocio(negocio)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="vacio">
                  <span className="vacio__icono">
                    <Search size={21} strokeWidth={1.8} />
                  </span>
                  <p className="vacio__titulo">No encontramos resultados</p>
                  <p className="vacio__texto">Probá con otro nombre, rubro o promoción.</p>
                </div>
              )}
            </section>
          ) : (
            <>
            <nav className="categorias" aria-label="Categorías">
              {CATEGORIAS.map(({ id, etiqueta, icono: Icono }) => {
                const activa = id === categoria;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`categoria${activa ? ' categoria--activa' : ''}`}
                    aria-pressed={activa}
                    onClick={() => setCategoria(id)}
                  >
                    <span className="categoria__circulo">
                      <Icono size={19} strokeWidth={2} />
                    </span>
                    <span className="categoria__etiqueta">{etiqueta}</span>
                  </button>
                );
              })}
            </nav>

              {SECCIONES.map(({ id, emoji, titulo, bajada, icono: Icono, vacioTitulo, vacioTexto }) => {
                const todas = promosDe(secciones?.[id] ?? []);
                const promos = todas.filter(
                  ({ negocio }) =>
                    categoriaActiva.rubro === null || negocio.rubro === categoriaActiva.rubro,
                );
                const filtrando = categoriaActiva.rubro !== null && todas.length > 0;
                return (
                  <section key={id} className="seccion">
                    <div className="seccion__encabezado">
                      <h2 className="seccion__titulo">
                        <span className="seccion__emoji" aria-hidden="true">{emoji}</span>
                        {titulo}
                      </h2>
                      {bajada && <span className="seccion__bajada">{bajada}</span>}
                    </div>

                    {cargando ? (
                      <div className="carrusel" role="status" aria-label="Cargando ofertas">
                        {[0, 1, 2].map((n) => (
                          <TarjetaCargando key={n} />
                        ))}
                      </div>
                    ) : promos.length > 0 ? (
                      <div className="carrusel">{promos.map(tarjetaPromo)}</div>
                    ) : (
                      <div className="vacio">
                        <span className="vacio__icono">
                          <Icono size={21} strokeWidth={1.8} />
                        </span>
                        <p className="vacio__titulo">
                          {filtrando ? `No hay promos de ${categoriaActiva.etiqueta} acá` : vacioTitulo}
                        </p>
                        <p className="vacio__texto">
                          {filtrando ? 'Probá con otra categoría o tocá Todos.' : vacioTexto}
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}

              {!cargando && !hayPromos && (
                <p className="inicio__pie">
                  <Tag size={13} strokeWidth={2.2} />
                  Muy pronto vas a ver acá las promos de los locales adheridos.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {abierta && (
        <DetallePromo
          promo={abierta.promo}
          negocio={abierta.negocio}
          guardada={estaGuardada(guardadas, abierta.negocio.id, abierta.promo.id)}
          onGuardar={() => alternarGuardada(abierta)}
          onCerrar={() => setAbierta(null)}
          onVerLocal={() => abrirNegocio(abierta.negocio)}
        />
      )}

      <Barra />
    </div>
  );
}
