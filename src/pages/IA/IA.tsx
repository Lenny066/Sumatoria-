import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, MapPin, Flame, Landmark, ArrowUp, Camera, X } from 'lucide-react';
import { mensajeDeError } from '../../services/apiService';
import { enviarMensaje, obtenerChat, type Mensaje } from '../../services/chatService';
import { obtenerUsuario } from '../../services/usuarioService';
import { leerImagen } from '../../services/miNegocioService';
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
  const [foto, setFoto] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  const finRef = useRef<HTMLDivElement | null>(null);
  const contadorRef = useRef<number>(0);
  const camaraRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' });
  }, [mensajes, esperando]);

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

  async function elegirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    setErrorFoto(null);
    try {
      setFoto(await leerImagen(archivo, 1024));
    } catch {
      setErrorFoto('No pudimos leer la foto. Probá con otra.');
    }
  }

  async function enviar(texto: string, imagen: string | null = null) {
    const limpio = texto.trim();
    if ((!limpio && !imagen) || esperando) return;

    contadorRef.current += 1;
    const marca = contadorRef.current;
    const pregunta: Mensaje = {
      id: `u${marca}`,
      autor: 'usuario',
      texto: limpio,
      ...(imagen ? { imagen } : {}),
    };
    setMensajes((actuales) => [...actuales, pregunta]);
    setConsulta('');
    setFoto(null);
    setErrorFoto(null);

    if (!obtenerUsuario()) {
      setMensajes((actuales) => [
        ...actuales,
        { id: `a${marca}`, autor: 'asistente', texto: RESPUESTA_SIN_CUENTA },
      ]);
      return;
    }

    setEsperando(true);
    try {
      const { respuesta } = await enviarMensaje(limpio, imagen ?? undefined);
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
        {mensajes.map(({ id, autor, texto, imagen }) => (
          <div key={id} className={`mensaje mensaje--${autor}`}>
            {autor === 'asistente' && (
              <span className="mensaje__avatar">
                <Sparkles size={15} strokeWidth={2.2} />
              </span>
            )}
            {imagen ? (
              <div className="mensaje__burbuja mensaje__burbuja--foto">
                <img className="mensaje__foto" src={imagen} alt="Foto que mandaste" />
                {texto && <p className="mensaje__pie">{texto}</p>}
              </div>
            ) : (
              <p className="mensaje__burbuja">{texto}</p>
            )}
          </div>
        ))}

        {esperando && (
          <div className="mensaje mensaje--asistente" role="status" aria-label="El asistente está escribiendo">
            <span className="mensaje__avatar">
              <Sparkles size={15} strokeWidth={2.2} />
            </span>
            <p className="mensaje__burbuja mensaje__burbuja--escribiendo">
              <span className="escribiendo__punto" />
              <span className="escribiendo__punto" />
              <span className="escribiendo__punto" />
            </p>
          </div>
        )}

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

      {(foto || errorFoto) && (
        <div className="ia__adjunto">
          {foto && (
            <div className="ia__adjunto-foto">
              <img src={foto} alt="Foto para mandar" />
              <button
                type="button"
                className="ia__adjunto-quitar"
                aria-label="Quitar foto"
                onClick={() => setFoto(null)}
              >
                <X size={14} strokeWidth={2.6} />
              </button>
            </div>
          )}
          {errorFoto && <p className="ia__adjunto-error">{errorFoto}</p>}
        </div>
      )}

      <form
        className="ia__composer"
        onSubmit={(evento) => {
          evento.preventDefault();
          enviar(consulta, foto);
        }}
      >
        <input
          ref={camaraRef}
          className="ia__camara-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={elegirFoto}
        />
        <button
          type="button"
          className="ia__camara"
          aria-label="Sacar una foto"
          disabled={esperando}
          onClick={() => camaraRef.current?.click()}
        >
          <Camera size={20} strokeWidth={2.2} />
        </button>
        <input
          className="ia__entrada"
          type="text"
          value={consulta}
                    placeholder={foto ? 'Contale algo de la foto (opcional)' : 'Escribí tu consulta...'}
          aria-label="Escribí tu consulta"
          onChange={(evento) => setConsulta(evento.target.value)}
        />
        <button
          type="submit"
          className="ia__enviar"
          aria-label="Enviar consulta"
          disabled={(consulta.trim().length === 0 && !foto) || esperando}
        >
          <ArrowUp size={20} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
