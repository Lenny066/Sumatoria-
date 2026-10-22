import React, { useEffect } from 'react';
import {
  ArrowLeftRight,
  Banknote,
  Bookmark,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import type { Negocio, Promocion, Rubro } from '../services/negociosService';
import { esTarjeta, textoDias, textoMedioPago, type MedioPago } from '../services/promosService';
import './detallepromo.css';

const ICONOS_MEDIO = {
  efectivo: Banknote,
  transferencia: ArrowLeftRight,
  mercadopago: Wallet,
};

function IconoMedio({ medio }: { medio: MedioPago }): React.JSX.Element {
  const Icono = esTarjeta(medio) ? CreditCard : ICONOS_MEDIO[medio.tipo];
  return <Icono size={15} strokeWidth={2} />;
}

function textoVence(vence: string): string {
  const [, mes, dia] = vence.split('-').map(Number);
  return `Vence el ${dia}/${String(mes).padStart(2, '0')}`;
}

type DetallePromoProps = {
  promo: Promocion;
  negocio: Negocio;
  guardada: boolean;
  onGuardar: () => void;
  onCerrar: () => void;
  onVerLocal?: () => void;
};

const VER_LOCAL: Record<Rubro, string> = {
  Gastronomía: 'Ver restaurante',
  Indumentaria: 'Ver tienda',
  Electrodomésticos: 'Ver tienda',
  Supermercado: 'Ver supermercado',
  Farmacia: 'Ver farmacia',
  Librería: 'Ver librería',
  Otro: 'Ver local',
};

export default function DetallePromo({
  promo,
  negocio,
  guardada,
  onGuardar,
  onCerrar,
  onVerLocal,
}: DetallePromoProps): React.JSX.Element {
  useEffect(() => {
    function alApretarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', alApretarTecla);
    return () => window.removeEventListener('keydown', alApretarTecla);
  }, [onCerrar]);

  const dias = promo.dias && promo.dias.length > 0 ? textoDias(promo.dias) : null;
  const medios = promo.mediosPago ?? [];

  return (
    <div className="detalle-promo" role="presentation" onClick={onCerrar}>
      <section
        className="detalle-promo__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-promo-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="detalle-promo__imagen">
          {promo.imagen ? (
            <img className="detalle-promo__foto" src={promo.imagen} alt="" />
          ) : negocio.logo ? (
            <img className="detalle-promo__logo" src={negocio.logo} alt="" />
          ) : (
            <Tag size={28} strokeWidth={1.8} />
          )}
          <button
            type="button"
            className="detalle-promo__cerrar"
            aria-label="Cerrar"
            onClick={onCerrar}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="detalle-promo__cuerpo">
          <p className="detalle-promo__negocio">{negocio.nombre}</p>
          <h2 id="detalle-promo-titulo" className="detalle-promo__titulo">
            {promo.descuento}
          </h2>
          {promo.vence && <p className="detalle-promo__vence">{textoVence(promo.vence)}</p>}

          {promo.descripcion && <p className="detalle-promo__descripcion">{promo.descripcion}</p>}

          {dias && (
            <div className="detalle-promo__seccion">
              <h3 className="detalle-promo__subtitulo">Días</h3>
              <p className="detalle-promo__fila">
                <CalendarDays size={15} strokeWidth={2} />
                {dias}
              </p>
            </div>
          )}

          {medios.length > 0 && (
            <div className="detalle-promo__seccion">
              <h3 className="detalle-promo__subtitulo">Medios de pago</h3>
              <ul className="detalle-promo__medios">
                {medios.map((medio) => (
                  <li key={textoMedioPago(medio)} className="detalle-promo__fila">
                    <IconoMedio medio={medio} />
                    {textoMedioPago(medio)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!dias && medios.length === 0 && promo.detalle && (
            <div className="detalle-promo__seccion">
              <h3 className="detalle-promo__subtitulo">Condiciones</h3>
              <p className="detalle-promo__fila">{promo.detalle}</p>
            </div>
          )}

          {onVerLocal && (
            <button type="button" className="detalle-promo__local" onClick={onVerLocal}>
              <span className="detalle-promo__local-logo">
                {negocio.logo ? <img src={negocio.logo} alt="" /> : <Tag size={16} strokeWidth={2} />}
              </span>
              <span className="detalle-promo__local-textos">
                <span className="detalle-promo__local-titulo">{VER_LOCAL[negocio.rubro]}</span>
                <span className="detalle-promo__local-nombre">{negocio.nombre}</span>
              </span>
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          )}

          <button
            type="button"
            className={`detalle-promo__guardar${guardada ? ' detalle-promo__guardar--activo' : ''}`}
            aria-pressed={guardada}
            onClick={onGuardar}
          >
            <Bookmark size={16} strokeWidth={2.2} fill={guardada ? 'currentColor' : 'none'} />
            {guardada ? 'Guardada en favoritos' : 'Guardar en favoritos'}
          </button>
        </div>
      </section>
    </div>
  );
}

