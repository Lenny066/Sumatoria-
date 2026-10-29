import { haySesionUsuario, hayApi, pedirApi } from './apiService';

export type TipoNotificacion = 'promo' | 'vencimiento';

export type Notificacion = {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  texto: string;
  fecha: string;
  negocioId: string;
  promoId?: string;
  leida: boolean;
};

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

function haceUnRato(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function notificacionesDePrueba(): Notificacion[] {
  return [
    {
      id: 'n1',
      tipo: 'promo',
      titulo: 'Nueva promo',
      texto: 'Panadería Norte activó 20% OFF con débito Visa.',
      fecha: haceUnRato(5 * MINUTO),
      negocioId: '1',
      leida: false,
    },
    {
      id: 'n2',
      tipo: 'promo',
      titulo: 'Nueva promo',
      texto: 'Súper Ahorro activó 30% OFF los miércoles con débito Mastercard.',
      fecha: haceUnRato(2 * HORA),
      negocioId: '4',
      leida: false,
    },
    {
      id: 'n3',
      tipo: 'vencimiento',
      titulo: 'Tu promo está por vencer',
      texto: 'El 25% OFF en Moda Urbana vence en 24 horas.',
      fecha: haceUnRato(DIA + HORA),
      negocioId: '3',
      leida: false,
    },
    {
      id: 'n4',
      tipo: 'promo',
      titulo: 'Nueva promo',
      texto: 'Farmacia Central activó 15% OFF con crédito Mastercard.',
      fecha: haceUnRato(3 * DIA),
      negocioId: '2',
      leida: false,
    },
    {
      id: 'n5',
      tipo: 'vencimiento',
      titulo: 'Tu promo está por vencer',
      texto: 'El 2x1 en facturas de Panadería Norte vence mañana.',
      fecha: haceUnRato(4 * DIA),
      negocioId: '1',
      leida: false,
    },
  ];
}

// El back ya devuelve solo las de los negocios que sigue el usuario, con "leida" marcado
export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  if (!hayApi()) return notificacionesDePrueba();
  if (!haySesionUsuario()) return [];
  return pedirApi<Notificacion[]>('/notificaciones');
}

// Sin ids marca todas como leídas
export async function marcarLeidas(ids?: string[]): Promise<void> {
  if (!hayApi() || !haySesionUsuario()) return;
  await pedirApi('/notificaciones/leidas', { method: 'PUT', body: ids ? { ids } : {} });
}

export async function hayNotificacionesSinLeer(): Promise<boolean> {
  if (!hayApi()) return true;
  if (!haySesionUsuario()) return false;
  const { hay } = await pedirApi<{ hay: boolean; cantidad: number }>('/notificaciones/sin-leer');
  return hay;
}
