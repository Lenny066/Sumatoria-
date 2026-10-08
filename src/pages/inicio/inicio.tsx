import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
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
  Store,
  Tag,
} from 'lucide-react';
import Barra from '../../components/barra';
import {
  buscarNegocios,
  obtenerSeccionesInicio,
  type Negocio,
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
    titulo: 'Locales nuevos',
    bajada: 'Recién sumados a Sumatoria',
    icono: Store,
    vacioTitulo: 'Todavía no hay locales nuevos',
    vacioTexto: 'Cada vez que un local se sume a Sumatoria lo vas a encontrar en esta sección.',
  },
] as const;

function TarjetaLocal({ negocio, onAbrir }: { negocio: Negocio; onAbrir: () => void }) {
  const promo = negocio.promociones[0];

  return (
    <button type="button" className="local" onClick={onAbrir}>
      <span className="local__imagen">
        <span className="local__rubro">{negocio.rubro}</span>
        {negocio.logo ? (
          <img className="local__logo" src={negocio.logo} alt="" />
        ) : (
          <span className="local__marca">{negocio.nombre}</span>
        )}
      </span>
      <span className="local__promo">{promo ? promo.descuento : 'Sin promociones'}</span>
      <span className="local__nombre">{negocio.nombre}</span>
      <span className="local__direccion">{negocio.direccion}</span>
    </button>
  );
}

export default function Inicio(): React.JSX.Element {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState<string>('todos');
  const [secciones, setSecciones] = useState<SeccionesInicio | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<{ texto: string; negocios: Negocio[] } | null>(null);

  const [sinLeer, setSinLeer] = useState(false);

  const buscando = busqueda.trim() !== '';
  const categoriaActiva = CATEGORIAS.find(({ id }) => id === categoria) ?? CATEGORIAS[0];
  const hayLocales = secciones !== null && Object.values(secciones).some((lista) => lista.length > 0);

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
      .catch((err) => console.error('Error al traer las secciones de inicio:', err));
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
              {sinLeer && <span className="inicio__punto" />}
            </button>
            <div className="inicio__avatar">JP</div>
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
            onClick={() => navigate('/agregar-tarjeta')}
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
              ) : resultados.negocios.length > 0 ? (
                <div className="resultados">
                  {resultados.negocios.map((negocio) => (
                    <TarjetaLocal
                      key={negocio.id}
                      negocio={negocio}
                      onAbrir={() => abrirNegocio(negocio)}
                    />
                  ))}
                </div>
              ) : (
                <div className="vacio">
                  <span className="vacio__icono">
                    <Search size={21} strokeWidth={1.8} />
                  </span>
                  <p className="vacio__titulo">No encontramos locales</p>
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
                const locales = (secciones?.[id] ?? []).filter(
                  (negocio) => categoriaActiva.rubro === null || negocio.rubro === categoriaActiva.rubro,
                );
                const filtrando = categoriaActiva.rubro !== null && (secciones?.[id] ?? []).length > 0;
                return (
                  <section key={id} className="seccion">
                    <div className="seccion__encabezado">
                      <h2 className="seccion__titulo">
                        <span className="seccion__emoji" aria-hidden="true">{emoji}</span>
                        {titulo}
                      </h2>
                      {bajada && <span className="seccion__bajada">{bajada}</span>}
                    </div>

                    {locales.length > 0 ? (
                      <div className="carrusel">
                        {locales.map((negocio) => (
                          <TarjetaLocal
                            key={negocio.id}
                            negocio={negocio}
                            onAbrir={() => abrirNegocio(negocio)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="vacio">
                        <span className="vacio__icono">
                          <Icono size={21} strokeWidth={1.8} />
                        </span>
                        <p className="vacio__titulo">
                          {filtrando ? `No hay locales de ${categoriaActiva.etiqueta} acá` : vacioTitulo}
                        </p>
                        <p className="vacio__texto">
                          {filtrando ? 'Probá con otra categoría o tocá Todos.' : vacioTexto}
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}

              {!hayLocales && (
                <p className="inicio__pie">
                  <Tag size={13} strokeWidth={2.2} />
                  Muy pronto vas a ver acá las promos de los locales adheridos.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      <Barra />
    </div>
  );
}
