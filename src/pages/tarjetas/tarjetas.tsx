import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Lock } from 'lucide-react';
import Barra from '../../components/barra';
import { agregarTarjeta, type Marca, type TipoTarjeta } from '../../services/tarjetasService';
import { obtenerUsuario } from '../../services/usuarioService';
import './tarjetas.css';

const MARCAS = [
  { id: 'visa', etiqueta: 'Visa' },
  { id: 'mastercard', etiqueta: 'Mastercard' },
  { id: 'amex', etiqueta: 'American Express' },
  { id: 'cabal', etiqueta: 'Cabal' },
] as const;

const BANCOS = [
  'Banco Andes',
  'Banco Nación',
  'Banco Provincia',
  'Banco Galicia',
  'Banco Santander',
  'BBVA',
  'Banco Macro',
  'Banco Ciudad',
  'ICBC',
  'Brubank',
  'Mercado Pago',
  'Ualá',
];

const TIPOS = [
  { id: 'debito', etiqueta: 'Débito' },
  { id: 'credito', etiqueta: 'Crédito' },
] as const;

export default function Tarjetas(): React.JSX.Element {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [marca, setMarca] = useState<Marca>('visa');
  const [banco, setBanco] = useState<string>(BANCOS[0]);
  const [tipo, setTipo] = useState<TipoTarjeta>('debito');

  const marcaElegida = MARCAS.find(({ id }) => id === marca);
  const tipoElegido = TIPOS.find(({ id }) => id === tipo);

  if (!obtenerUsuario()) return <Navigate to="/perfil" replace />;

  function agregar() {
    agregarTarjeta({ marca, banco, tipo });
    navigate(state?.volverA ?? '/inicio');
  }

  return (
    <div className="tarjeta-nueva">
      <header className="tarjeta-nueva__cabecera">
        <button
          type="button"
          className="tarjeta-nueva__volver"
          aria-label="Volver"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>

        <div className="tarjeta-nueva__identidad">
          <h1 className="tarjeta-nueva__titulo">Agregar tarjeta</h1>
          <p className="tarjeta-nueva__bajada">Vinculá tu tarjeta bancaria</p>
        </div>
      </header>

      <div className="tarjeta-nueva__scroll">
        <section className="vista-tarjeta" aria-live="polite">
          <span className="vista-tarjeta__chip" />
          <p className="vista-tarjeta__banco">{banco}</p>
          <p className="vista-tarjeta__detalle">
            {marcaElegida?.etiqueta.toUpperCase()} · {tipoElegido?.etiqueta}
          </p>
        </section>

        <fieldset className="campo">
          <legend className="campo__rotulo">Marca de tarjeta</legend>
          <div className="opciones">
            {MARCAS.map(({ id, etiqueta }) => (
              <button
                key={id}
                type="button"
                className={`opcion${id === marca ? ' opcion--activa' : ''}`}
                aria-pressed={id === marca}
                onClick={() => setMarca(id)}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="campo">
          <label className="campo__rotulo" htmlFor="banco">
            Banco
          </label>
          <div className="selector">
            <select
              id="banco"
              className="selector__campo"
              value={banco}
              onChange={(evento) => setBanco(evento.target.value)}
            >
              {BANCOS.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="selector__flecha" size={18} strokeWidth={2} />
          </div>
        </div>

        <fieldset className="campo">
          <legend className="campo__rotulo">Tipo de tarjeta</legend>
          <div className="opciones">
            {TIPOS.map(({ id, etiqueta }) => (
              <button
                key={id}
                type="button"
                className={`opcion${id === tipo ? ' opcion--activa' : ''}`}
                aria-pressed={id === tipo}
                onClick={() => setTipo(id)}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="tarjeta-nueva__aviso">
          <Lock size={14} strokeWidth={2.2} />
          Tus datos están protegidos con encriptación de nivel bancario.
        </p>

        <button type="button" className="tarjeta-nueva__guardar" onClick={agregar}>
          Agregar tarjeta
        </button>
      </div>

      <Barra />
    </div>
  );
}
