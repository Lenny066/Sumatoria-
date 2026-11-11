import { pedirApi } from './apiService';

export type Mensaje = {
  id: string;
  autor: 'asistente' | 'usuario';
  texto: string;
  imagen?: string;
  fecha?: string;
};

// Historial del chat. Si está vacío, el back devuelve el saludo inicial.
export function obtenerChat(): Promise<Mensaje[]> {
  return pedirApi<Mensaje[]>('/chat');
}

export function enviarMensaje(
  texto: string,
  imagen?: string,
): Promise<{ pregunta: Mensaje; respuesta: Mensaje }> {
  return pedirApi('/chat', { method: 'POST', body: imagen ? { texto, imagen } : { texto } });
}
