import { obtenerSeguidos } from './negociosService';

export type TipoNotificacion = 'promo' | 'vencimiento';

export type Notificacion = {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  texto: string;
  fecha: string;
  negocioId: string;
};

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

const CLAVE_LEIDAS = 'sumatoria:notificaciones-leidas';

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
    },
    {
      id: 'n2',
      tipo: 'promo',
      titulo: 'Nueva promo',
      texto: 'Súper Ahorro activó 30% OFF los miércoles con débito Mastercard.',
      fecha: haceUnRato(2 * HORA),
      negocioId: '4',
    },
    {
      id: 'n3',
      tipo: 'vencimiento',
      titulo: 'Tu promo está por vencer',
      texto: 'El 25% OFF en Moda Urbana vence en 24 horas.',
      fecha: haceUnRato(DIA + HORA),
      negocioId: '3',
    },
    {
      id: 'n4',
      tipo: 'promo',
      titulo: 'Nueva promo',
      texto: 'Farmacia Central activó 15% OFF con crédito Mastercard.',
      fecha: haceUnRato(3 * DIA),
      negocioId: '2',
    },
    {
      id: 'n5',
      tipo: 'vencimiento',
      titulo: 'Tu promo está por vencer',
      texto: 'El 2x1 en facturas de Panadería Norte vence mañana.',
      fecha: haceUnRato(4 * DIA),
      negocioId: '1',
    },
  ];
}

async function pedirNotificaciones(): Promise<Notificacion[]> {
  if (!API_URL) return notificacionesDePrueba();
  const res = await fetch(`${API_URL}/notificaciones`);
  if (!res.ok) {
    throw new Error(`El backend respondió con estado ${res.status}`);
  }
  return res.json() as Promise<Notificacion[]>;
}

export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  const seguidos = obtenerSeguidos();
  const notificaciones = await pedirNotificaciones();
  return notificaciones.filter(({ negocioId }) => seguidos.includes(negocioId));
}

export function obtenerLeidas(): string[] {
  try {
    const guardadas = localStorage.getItem(CLAVE_LEIDAS);
    return guardadas ? (JSON.parse(guardadas) as string[]) : [];
  } catch {
    return [];
  }
}

export function marcarLeidas(ids: string[]): string[] {
  const leidas = Array.from(new Set([...obtenerLeidas(), ...ids]));
  try {
    localStorage.setItem(CLAVE_LEIDAS, JSON.stringify(leidas));
  } catch {
    return leidas;
  }
  return leidas;
}

export async function hayNotificacionesSinLeer(): Promise<boolean> {
  const notificaciones = await obtenerNotificaciones();
  const leidas = obtenerLeidas();
  return notificaciones.some(({ id }) => !leidas.includes(id));
}
