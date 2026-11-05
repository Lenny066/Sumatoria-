import { hayApi, haySesionUsuario, pedirApi } from './apiService';

export type Ahorro = {
  mes: number;
  total: number;
  usosMes: number;
};

export type AhorroMes = {
  mes: string;
  ahorro: number;
  usos: number;
};

export const AHORRO_VACIO: Ahorro = { mes: 0, total: 0, usosMes: 0 };

const EVENTO_AHORRO = 'sumatoria:ahorro';

const FORMATO_PLATA = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatearPlata(monto: number): string {
  return FORMATO_PLATA.format(monto);
}

export function puedeUsarPromos(): boolean {
  return hayApi() && haySesionUsuario();
}

export async function obtenerAhorro(): Promise<Ahorro> {
  if (!puedeUsarPromos()) return AHORRO_VACIO;
  return pedirApi<Ahorro>('/usuario/ahorro');
}

export type DatosUso = { ahorro?: number; sinDescuento?: number };

export async function obtenerAhorroPorMes(): Promise<AhorroMes[]> {
  if (!puedeUsarPromos()) return [];
  return pedirApi<AhorroMes[]>('/usuario/ahorro/meses');
}

export async function usarPromo(promoId: string, datos: DatosUso = {}): Promise<Ahorro & { ahorro: number }> {
  const respuesta = await pedirApi<Ahorro & { ahorro: number }>(`/promos/${promoId}/usar`, {
    method: 'POST',
    body: datos,
  });
  window.dispatchEvent(new CustomEvent<Ahorro>(EVENTO_AHORRO, { detail: respuesta }));
  return respuesta;
}

export function escucharAhorro(alCambiar: (ahorro: Ahorro) => void): () => void {
  function manejar(evento: Event) {
    alCambiar((evento as CustomEvent<Ahorro>).detail);
  }
  window.addEventListener(EVENTO_AHORRO, manejar);
  return () => window.removeEventListener(EVENTO_AHORRO, manejar);
}

export function ahorroDePromo(promo: { precioReal?: number; precioPromo?: number }): number | null {
  if (promo.precioReal === undefined || promo.precioPromo === undefined) return null;
  const ahorro = promo.precioReal - promo.precioPromo;
  return ahorro > 0 ? ahorro : null;
}

export function ahorroPorPorcentaje(sinDescuento: number, porcentaje: number): number {
  return Math.round(((sinDescuento * porcentaje) / 100) * 100) / 100;
}
