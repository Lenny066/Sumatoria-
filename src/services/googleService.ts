import { guardarUsuario, obtenerUsuario, type Usuario } from './usuarioService';

interface RespuestaToken {
  access_token?: string;
  error?: string;
}

interface ClienteToken {
  requestAccessToken: () => void;
}

interface GoogleAccounts {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (respuesta: RespuestaToken) => void;
        error_callback?: (error: { type: string }) => void;
      }) => ClienteToken;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

// Client ID de Google (proyecto "Sumatoria" en Google Cloud, cliente "Sumatoria Web").
// No es secreto: viaja al navegador igual. Si existe VITE_GOOGLE_CLIENT_ID en el .env, se usa ese.
const CLIENT_ID_GOOGLE =
  '303954799399-4tmjho0bfha66ovcf2j713sh6j2q00j3.apps.googleusercontent.com';

const URL_SCRIPT = 'https://accounts.google.com/gsi/client';

let cargaScript: Promise<GoogleAccounts> | null = null;

function cargarGoogle(): Promise<GoogleAccounts> {
  if (window.google?.accounts) return Promise.resolve(window.google);
  if (cargaScript) return cargaScript;

  cargaScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts ? resolve(window.google) : reject(new Error('sin-google'));
    script.onerror = () => {
      cargaScript = null;
      script.remove();
      reject(new Error('sin-google'));
    };
    document.head.appendChild(script);
  });

  return cargaScript;
}

export function precargarGoogle(): void {
  cargarGoogle().catch(() => {});
}

function pedirToken(google: GoogleAccounts, clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cliente = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (respuesta) =>
        respuesta.access_token
          ? resolve(respuesta.access_token)
          : reject(new Error(respuesta.error ?? 'sin-token')),
      error_callback: (error) => reject(new Error(error.type)),
    });
    cliente.requestAccessToken();
  });
}

export async function iniciarSesionConGoogle(): Promise<Usuario> {
  const clientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || CLIENT_ID_GOOGLE;

  const google = await cargarGoogle();
  const token = await pedirToken(google, clientId);

  const respuesta = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) throw new Error('sin-datos');

  const datos = (await respuesta.json()) as { name?: string; email?: string; picture?: string };
  const email = datos.email ?? '';
  const anterior = obtenerUsuario();
  const usuario: Usuario =
    anterior && anterior.emailGoogle === email
      ? anterior
      : {
          nombre: datos.name ?? '',
          email,
          emailGoogle: email,
          foto: datos.picture ?? null,
          barrio: '',
        };

  guardarUsuario(usuario);
  return usuario;
}

export function mensajeErrorGoogle(error: unknown): string | null {
  const codigo = error instanceof Error ? error.message : '';
  if (codigo === 'popup_closed' || codigo === 'access_denied') return null;
  if (codigo === 'popup_failed_to_open') {
    return 'Tu navegador bloqueó la ventana de Google. Habilitá las ventanas emergentes y probá de nuevo.';
  }
  return 'No pudimos conectarte con Google. Probá de nuevo en un momento.';
}