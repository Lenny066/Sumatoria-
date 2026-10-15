export interface Usuario {
  nombre: string;
  email: string;
  emailGoogle: string;
  foto: string | null;
  barrio: string;
}

const CLAVE = 'sumatoria:usuario';

export function obtenerUsuario(): Usuario | null {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  } catch {
    return null;
  }
}

export function guardarUsuario(usuario: Usuario): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
  } catch {
    return;
  }
}

export function cerrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    return;
  }
}

export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}
