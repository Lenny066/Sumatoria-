import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, MapPin, Flame, Landmark, ArrowUp } from 'lucide-react';
import { mensajeDeError } from '../../services/apiService';
import { enviarMensaje, obtenerChat, type Mensaje } from '../../services/chatService';
import { obtenerUsuario } from '../../services/usuarioService';
import './IA.css';

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

const RESPUESTA_SIN_CUENTA =
  'Para usar el asistente tenés que iniciar sesión. Así puedo buscar las promos que sirven con tus tarjetas.';

export default function IA(): React.JSX.Element {
  const navigate = useNavigate();

  const [mensajes, setMensajes] = useState<Mensaje[]>(MENSAJES_INICIALES);
  const [consulta, setConsulta] = useState<string>('');
  const [esperando, setEsperando] = useState(false);

  const finRef = useRef<HTMLDivElement | null>(null);
  const contadorRef = useRef<number>(0);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' });
  }, [mensajes]);

  // Trae la charla guardada en el back
  useEffect(() => {
    if (!obtenerUsuario()) return;
    let cancelado = false;
    obtenerChat()
      .then((datos) => !cancelado && datos.length > 0 && setMensajes(datos))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  async function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio || esperando) return;

    contadorRef.current += 1;
    const marca = contadorRef.current;
    const pregunta: Mensaje = { id: `u${marca}`, autor: 'usuario', texto: limpio };
    setMensajes((actuales) => [...actuales, pregunta]);
    setConsulta('');

    if (!obtenerUsuario()) {
      setMensajes((actuales) => [
        ...actuales,
        { id: `a${marca}`, autor: 'asistente', texto: RESPUESTA_SIN_CUENTA },
      ]);
      return;
    }

    setEsperando(true);
    try {
      const { respuesta } = await enviarMensaje(limpio);
      setMensajes((actuales) => [...actuales, respuesta]);
    } catch (err) {
      setMensajes((actuales) => [
        ...actuales,
        {
          id: `a${marca}`,
          autor: 'asistente',
          texto: mensajeDeError(err, 'No pude responderte ahora. Probá de nuevo en un momento.'),
        },
      ]);
    } finally {
      setEsperando(false);
    }
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
          disabled={consulta.trim().length === 0 || esperando}
        >
          <ArrowUp size={20} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
