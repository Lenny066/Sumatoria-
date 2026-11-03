import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft, PiggyBank } from 'lucide-react';
import Barra from '../../../../components/barra';
import CargandoMonto from '../../../../components/CargandoMonto';
import {
  formatearPlata,
  obtenerAhorro,
  obtenerAhorroPorMes,
  type Ahorro,
  type AhorroMes,
} from '../../../../services/ahorroService';
import { obtenerUsuario } from '../../../../services/usuarioService';
import './miahorro.css';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const FILAS_CARGANDO = Array.from({ length: 6 }, (_, indice) => indice);

function nombreMes(mes: string): string {
  const [anio, numero] = mes.split('-').map(Number);
  return `${MESES[numero - 1]} ${anio}`;
}

function textoUsos(usos: number): string {
  if (usos === 0) return 'Sin promos usadas';
  return `${usos} ${usos === 1 ? 'promo usada' : 'promos usadas'}`;
}

export default function MiAhorro(): React.JSX.Element {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();
  const hayUsuario = usuario !== null;

  const [resumen, setResumen] = useState<Ahorro | null>(null);
  const [meses, setMeses] = useState<AhorroMes[] | null>(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!hayUsuario) return;
    let cancelado = false;
    Promise.all([obtenerAhorro(), obtenerAhorroPorMes()])
      .then(([datosResumen, datosMeses]) => {
        if (cancelado) return;
        setResumen(datosResumen);
        setMeses(datosMeses);
      })
      .catch(() => !cancelado && setError(true));
    return () => {
      cancelado = true;
    };
  }, [hayUsuario, intento]);

  function reintentar() {
    setError(false);
    setResumen(null);
    setMeses(null);
    setIntento((n) => n + 1);
  }

  if (!usuario) return <Navigate to="/perfil" replace />;

  const maximo = Math.max(0, ...(meses ?? []).map(({ ahorro }) => ahorro));
  const cargando = !error && (resumen === null || meses === null);

  return (
    <div className="mi-ahorro">
      <header className="mi-ahorro__cabecera">
        <button type="button" className="mi-ahorro__volver" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} strokeWidth={2.4} />
          Perfil
        </button>

        <h1 className="mi-ahorro__titulo">Mi ahorro</h1>
        <p className="mi-ahorro__bajada">Lo que ahorraste usando promos</p>
      </header>

      <div className="mi-ahorro__scroll">
        <section className="mi-ahorro__resumen">
          <span className="mi-ahorro__icono">
            <PiggyBank size={22} strokeWidth={2.1} />
          </span>
          <div className="mi-ahorro__resumen-textos">
            <span className="mi-ahorro__etiqueta">Ahorro total</span>
            <span className="mi-ahorro__total">
              {cargando || !resumen ? <CargandoMonto ancho="7rem" alto="0.9em" /> : formatearPlata(resumen.total)}
            </span>
            <span className="mi-ahorro__este-mes">
              {cargando || !resumen ? (
                <CargandoMonto ancho="6rem" alto="0.8em" />
              ) : (
                `${formatearPlata(resumen.mes)} este mes`
              )}
            </span>
          </div>
        </section>

        <h2 className="mi-ahorro__subtitulo">Últimos 12 meses</h2>

        {error ? (
          <div className="mi-ahorro__error">
            <p>No pudimos cargar tu ahorro.</p>
            <button type="button" className="mi-ahorro__reintentar" onClick={reintentar}>
              Probar de nuevo
            </button>
          </div>
        ) : (
          <ul className="mi-ahorro__meses">
            {cargando || !meses
              ? FILAS_CARGANDO.map((indice) => (
                  <li key={indice} className="mes-ahorro">
                    <div className="mes-ahorro__fila">
                      <CargandoMonto ancho="8rem" alto="0.85rem" />
                      <CargandoMonto ancho="4.5rem" alto="0.85rem" />
                    </div>
                    <CargandoMonto ancho="100%" alto="6px" />
                  </li>
                ))
              : meses.map(({ mes, ahorro, usos }, indice) => (
                  <li key={mes} className={`mes-ahorro${indice === 0 ? ' mes-ahorro--actual' : ''}`}>
                    <div className="mes-ahorro__fila">
                      <span className="mes-ahorro__nombre">
                        {nombreMes(mes)}
                        {indice === 0 && <span className="mes-ahorro__chip">Este mes</span>}
                      </span>
                      <span className={`mes-ahorro__monto${ahorro === 0 ? ' mes-ahorro__monto--cero' : ''}`}>
                        {formatearPlata(ahorro)}
                      </span>
                    </div>
                    <div className="mes-ahorro__barra" aria-hidden="true">
                      <span
                        className="mes-ahorro__relleno"
                        style={{ width: maximo > 0 ? `${(ahorro / maximo) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="mes-ahorro__usos">{textoUsos(usos)}</span>
                  </li>
                ))}
          </ul>
        )}
      </div>

      <Barra />
    </div>
  );
}
