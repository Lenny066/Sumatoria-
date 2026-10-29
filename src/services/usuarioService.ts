import {
  CLAVES,
  ErrorApi,
  borrarSesion,
  escribirGuardado,
  guardarSesion,
  haySesionUsuario,
  leerGuardado,
  pedirApi,
  type Rol,
} from './apiService';

export interface Usuario {
  id_usuario?: number;
  nombre: string;
  email: string;
  emailGoogle: string;
  foto: string | null;
  barrio: string;
}

type RespuestaSesion = { token: string; usuario: Usuario };

// El usuario logueado (o null si no hay sesión de usuario)
export function obtenerUsuario(): Usuario | null {
  if (!haySesionUsuario()) return null;
  return leerGuardado<Usuario | null>(CLAVES.usuario, null);
}

export function guardarUsuario(usuario: Usuario): void {
  escribirGuardado(CLAVES.usuario, usuario);
}

export function abrirSesionDeUsuario({ token, usuario }: RespuestaSesion): Usuario {
  guardarSesion(token, 'usuario');
  guardarUsuario(usuario);
  return usuario;
}

export async function registrarUsuario(nombre: string, email: string, password: string): Promise<Usuario> {
  const respuesta = await pedirApi<RespuestaSesion>('/registro/usuario', {
    method: 'POST',
    body: { nombre: nombre.trim(), email: email.trim(), password },
  });
  return abrirSesionDeUsuario(respuesta);
}

// Prueba primero como persona y, si no existe, como negocio.
// Devuelve qué tipo de cuenta entró, para saber a qué pantalla ir.
export async function iniciarSesion(email: string, password: string): Promise<Rol> {
  const datos = { email: email.trim(), password };
  try {
    abrirSesionDeUsuario(await pedirApi<RespuestaSesion>('/login/usuario', { method: 'POST', body: datos }));
    return 'usuario';
  } catch (errorUsuario) {
    if (!(errorUsuario instanceof ErrorApi) || errorUsuario.status !== 401) throw errorUsuario;
    try {
      const { token } = await pedirApi<{ token: string }>('/login/empresa', { method: 'POST', body: datos });
      guardarSesion(token, 'empresa');
      return 'empresa';
    } catch {
      throw errorUsuario;
    }
  }
}

export async function actualizarPerfil(cambios: {
  nombre?: string;
  barrio?: string;
  foto?: string | null;
}): Promise<Usuario> {
  const usuario = await pedirApi<Usuario>('/usuario/perfil', { method: 'PUT', body: cambios });
  guardarUsuario(usuario);
  return usuario;
}

export function cerrarSesion(): void {
  borrarSesion();
}

export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}
