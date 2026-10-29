import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Lock, CreditCard } from 'lucide-react';
import Barra from '../../../../components/barra';
import {
  obtenerTarjetas,
  quitarTarjeta,
  sincronizarTarjetas,
  type Marca,
  type TarjetaVinculada,
  type TipoTarjeta,
} from '../../../../services/tarjetasService';
import { obtenerUsuario } from '../../../../services/usuarioService';
import './tarjetasvinculadas.css';

const NOMBRES_MARCA: Record<Marca, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMERICAN EXPRESS',
  cabal: 'CABAL',
};

const NOMBRES_TIPO: Record<TipoTarjeta, string> = {
  debito: 'Débito',
  credito: 'Crédito',
};

export default function TarjetasVinculadas(): React.JSX.Element {
  const navigate = useNavigate();

  const [tarjetas, setTarjetas] = useState<TarjetaVinculada[]>(obtenerTarjetas);

  const cantidad = tarjetas.length;

  useEffect(() => {
    let cancelado = false;
    sincronizarTarjetas()
      .then((datos) => !cancelado && setTarjetas(datos))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  if (!obtenerUsuario()) return <Navigate to="/perfil" replace />;

  function quitar(id: string) {
    quitarTarjeta(id)
      .then(setTarjetas)
      .catch(() => {});
  }

  return (
    <div className="vinculadas">
      <header className="vinculadas__cabecera">
        <button
          type="button"
          className="vinculadas__volver"
          aria-label="Volver"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>

        <div className="vinculadas__identidad">
          <h1 className="vinculadas__titulo">Tarjetas vinculadas</h1>
          <p className="vinculadas__bajada">
            {cantidad === 0
              ? 'Sin tarjetas vinculadas'
              : `${cantidad} ${cantidad === 1 ? 'tarjeta vinculada' : 'tarjetas vinculadas'}`}
          </p>
        </div>
      </header>

      <div className="vinculadas__scroll">
        {cantidad > 0 ? (
          <ul className="vinculadas__lista">
            {tarjetas.map((tarjeta) => (
              <li key={tarjeta.id}>
                <article className={`plastico plastico--${tarjeta.marca}`}>
                  <span className="plastico__chip" />
                  <span className="plastico__marca">{NOMBRES_MARCA[tarjeta.marca]}</span>
                  <p className="plastico__banco">{tarjeta.banco}</p>
                  <p className="plastico__detalle">
                    {NOMBRES_MARCA[tarjeta.marca]} · {NOMBRES_TIPO[tarjeta.tipo]}
                  </p>
                </article>

                <button
                  type="button"
                  className="vinculadas__quitar"
                  onClick={() => quitar(tarjeta.id)}
                >
                  Quitar tarjeta
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="vinculadas-vacio">
            <span className="vinculadas-vacio__icono">
              <CreditCard size={28} strokeWidth={1.9} />
            </span>
            <h2 className="vinculadas-vacio__titulo">No tenés tarjetas vinculadas</h2>
            <p className="vinculadas-vacio__texto">
              Agregá tus tarjetas para ver los descuentos que te corresponden.
            </p>
          </div>
        )}

        <button
          type="button"
          className="vinculadas__agregar"
          onClick={() => navigate('/agregar-tarjeta', { state: { volverA: '/tarjetas-vinculadas' } })}
        >
          <Plus size={16} strokeWidth={2.4} />
          Agregar tarjeta
        </button>

        <p className="vinculadas__aviso">
          <Lock size={13} strokeWidth={2.2} />
          Tus datos están protegidos con encriptación de nivel bancario.
        </p>
      </div>

      <Barra />
    </div>
  );
}
