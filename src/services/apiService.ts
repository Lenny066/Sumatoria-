// Todo lo que el front le pide al back pasa por acá.
// Se encarga de armar la URL, mandar el token y avisar los errores con el mensaje del back.

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export type Rol = 'usuario' | 'empresa';

// Lo que se guarda en el navegador mientras hay una sesión abierta
export const CLAVES = {
  token: 'sumatoria:token',
  rol: 'sumatoria:rol',
  usuario: 'sumatoria:usuario',
  tarjetas: 'sumatoria:tarjetas',
  promosGuardadas: 'sumatoria:promos-guardadas',
  seguidos: 'sumatoria:negocios-seguidos',
} as const;

// Datos que quedaron de cuando todo se guardaba solo en el navegador
const CLAVES_VIEJAS = [
  'sumatoria:mi-negocio',
  'sumatoria:mis-promos',
  'sumatoria:notificaciones-leidas',
];

export class ErrorApi extends Error {
  status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

export function hayApi(): boolean {
  return Boolean(API_URL);
}

// ----- Lectura y escritura segura en localStorage -----

export function leerGuardado<T>(clave: string, porDefecto: T): T {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function escribirGuardado(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    return;
  }
}

// ----- Sesión -----

export function obtenerToken(): string | null {
  try {
    return localStorage.getItem(CLAVES.token);
  } catch {
    return null;
  }
}

export function obtenerRol(): Rol | null {
  try {
    const rol = localStorage.getItem(CLAVES.rol);
    return rol === 'usuario' || rol === 'empresa' ? rol : null;
  } catch {
    return null;
  }
}

export function haySesionUsuario(): boolean {
  return obtenerToken() !== null && obtenerRol() === 'usuario';
}

export function haySesionEmpresa(): boolean {
  return obtenerToken() !== null && obtenerRol() === 'empresa';
}

// Borra todo lo de la sesión anterior (token, usuario y las listas guardadas)
export function borrarSesion(): void {
  try {
    for (const clave of [...Object.values(CLAVES), ...CLAVES_VIEJAS]) {
      localStorage.removeItem(clave);
    }
  } catch {
    return;
  }
}

export function guardarSesion(token: string, rol: Rol): void {
  borrarSesion();
  try {
    localStorage.setItem(CLAVES.token, token);
    localStorage.setItem(CLAVES.rol, rol);
  } catch {
    return;
  }
}

// ----- Pedidos al back -----

type Opciones = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

export async function pedirApi<T>(ruta: string, { method = 'GET', body }: Opciones = {}): Promise<T> {
  if (!API_URL) {
    throw new ErrorApi(0, 'Falta VITE_API_URL en el archivo .env del front.');
  }

  const token = obtenerToken();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErrorApi(0, 'No pudimos conectarnos con el servidor. Revisá que el back esté prendido.');
  }

  const datos: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    // Si el token venció o no es válido, se cierra la sesión para no seguir mandándolo
    if (res.status === 401 && token) borrarSesion();
    const mensaje =
      datos && typeof datos === 'object' && 'mensaje' in datos && typeof datos.mensaje === 'string'
        ? datos.mensaje
        : `El servidor respondió con estado ${res.status}`;
    throw new ErrorApi(res.status, mensaje);
  }

  return datos as T;
}

export function mensajeDeError(error: unknown, porDefecto: string): string {
  return error instanceof ErrorApi ? error.message : porDefecto;
}
