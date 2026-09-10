import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  Bell,
  Search,
  CreditCard,
  Lock,
  Star,
  UtensilsCrossed,
  Shirt,
  WashingMachine,
  ShoppingCart,
  Flame,
  Smile,
  Sparkles,
  Store,
  Tag,
} from 'lucide-react';
import Barra from '../../components/barra';
import './inicio.css';

const CATEGORIAS = [
  { id: 'todos', etiqueta: 'Todos', icono: Star },
  { id: 'gastronomia', etiqueta: 'Gastronomía', icono: UtensilsCrossed },
  { id: 'indumentaria', etiqueta: 'Indumentaria', icono: Shirt },
  { id: 'electrodomesticos', etiqueta: 'Electrodomésticos', icono: WashingMachine },
  { id: 'supermercados', etiqueta: 'Supermercados', icono: ShoppingCart },
] as const;

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

export default function Inicio(): React.JSX.Element {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState<string>('todos');

  return (
    <div className="inicio">
      <header className="inicio__cabecera">
        <div className="inicio__fila-superior">
          <button type="button" className="inicio__ubicacion">
            <MapPin size={15} strokeWidth={2.2} />
            Activar ubicación
            <ChevronDown size={15} strokeWidth={2.2} />
          </button>

          <div className="inicio__acciones">
            <button type="button" className="inicio__campana" aria-label="Notificaciones">
              <Bell size={19} strokeWidth={2} />
              <span className="inicio__punto" />
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

          {SECCIONES.map(({ id, emoji, titulo, bajada, icono: Icono, vacioTitulo, vacioTexto }) => (
            <section key={id} className="seccion">
              <div className="seccion__encabezado">
                <h2 className="seccion__titulo">
                  <span className="seccion__emoji" aria-hidden="true">{emoji}</span>
                  {titulo}
                </h2>
                {bajada && <span className="seccion__bajada">{bajada}</span>}
              </div>

              <div className="vacio">
                <span className="vacio__icono">
                  <Icono size={21} strokeWidth={1.8} />
                </span>
                <p className="vacio__titulo">{vacioTitulo}</p>
                <p className="vacio__texto">{vacioTexto}</p>
              </div>
            </section>
          ))}

          <p className="inicio__pie">
            <Tag size={13} strokeWidth={2.2} />
            Muy pronto vas a ver acá las promos de los locales adheridos.
          </p>
        </main>
      </div>

      <Barra />
    </div>
  );
}
