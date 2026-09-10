import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, MapPin, Flame, Landmark, ArrowUp } from 'lucide-react';
import './IA.css';

type Mensaje = {
  id: string;
  autor: 'asistente' | 'usuario';
  texto: string;
};

const MENSAJES_INICIALES: Mensaje[] = [
  {
    id: 'm1',
    autor: 'asistente',
    texto: '¡Hola! 👋 Soy tu asistente de Sumatoria. Preguntame por promociones, locales cerca tuyo o beneficios bancarios.',
  },
];

const SUGERENCIAS = [
  { id: 'cerca', etiqueta: 'Cerca mío', icono: MapPin },
  { id: 'hot', etiqueta: 'Ofertas hot', icono: Flame },
  { id: 'bancos', etiqueta: 'Bancos', icono: Landmark },
];

const RESPUESTA_PENDIENTE =
  'Todavía no estoy conectado al buscador de promos. Muy pronto voy a poder responderte con las ofertas reales de tu zona.';

export default function IA(): React.JSX.Element {
  const navigate = useNavigate();

  const [mensajes, setMensajes] = useState<Mensaje[]>(MENSAJES_INICIALES);
  const [consulta, setConsulta] = useState<string>('');

  const finRef = useRef<HTMLDivElement | null>(null);
  const contadorRef = useRef<number>(0);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' });
  }, [mensajes]);

  function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio) return;

    contadorRef.current += 1;
    const marca = contadorRef.current;

    setMensajes((actuales) => [
      ...actuales,
      { id: `u${marca}`, autor: 'usuario', texto: limpio },
      { id: `a${marca}`, autor: 'asistente', texto: RESPUESTA_PENDIENTE },
    ]);
    setConsulta('');
  }

  return (
    <div className="ia">
      <header className="ia__cabecera">
        <button
          type="button"
          className="ia__volver"
          aria-label="Volver"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>

        <span className="ia__avatar">
          <Sparkles size={18} strokeWidth={2.2} />
        </span>

        <div className="ia__identidad">
          <h1 className="ia__titulo">Asistente Sumatoria</h1>
          <p className="ia__bajada">Preguntame por promos y descuentos</p>
        </div>
      </header>

      <main className="ia__conversacion">
        {mensajes.map(({ id, autor, texto }) => (
          <div key={id} className={`mensaje mensaje--${autor}`}>
            {autor === 'asistente' && (
              <span className="mensaje__avatar">
                <Sparkles size={15} strokeWidth={2.2} />
              </span>
            )}
            <p className="mensaje__burbuja">{texto}</p>
          </div>
        ))}

        <div className="ia__sugerencias">
          {SUGERENCIAS.map(({ id, etiqueta, icono: Icono }) => (
            <button
              key={id}
              type="button"
              className="sugerencia"
              onClick={() => enviar(etiqueta)}
            >
              <Icono size={15} strokeWidth={2} />
              {etiqueta}
            </button>
          ))}
        </div>

        <div ref={finRef} />
      </main>

      <form
        className="ia__composer"
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar(consulta);
        }}
      >
        <input
          className="ia__entrada"
          type="text"
          value={consulta}
          placeholder="Escribí tu consulta..."
          aria-label="Escribí tu consulta"
          onChange={(evento) => setConsulta(evento.target.value)}
        />
        <button
          type="submit"
          className="ia__enviar"
          aria-label="Enviar consulta"
          disabled={consulta.trim().length === 0}
        >
          <ArrowUp size={20} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
