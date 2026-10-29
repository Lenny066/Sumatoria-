import { CLAVES, escribirGuardado, haySesionUsuario, leerGuardado, pedirApi } from './apiService';

export type Marca ='visa' | 'mastercard' | 'amex' | 'cabal';

export type TipoTarjeta = 'debito' | 'credito';

export interface TarjetaVinculada {
  id: string;
  marca: Marca;
  banco: string;
  tipo: TipoTarjeta;
}

export const BANCOS = [
  'Banco Andes',
  'Banco Nación',
  'Banco Provincia',
  'Banco Galicia',
  'Banco Santander',
  'BBVA',
  'Banco Macro',
  'Banco Ciudad',
  'ICBC',
  'Brubank',
  'Mercado Pago',
  'Ualá',
];

export const NOMBRES_MARCA: Record<Marca, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  cabal: 'Cabal',
};

// Las tarjetas se guardan en el back. Acá se guarda una copia para mostrarlas al instante;
// cada pantalla la actualiza con sincronizarTarjetas().
export function obtenerTarjetas(): TarjetaVinculada[] {
  if (!haySesionUsuario()) return [];
  return leerGuardado<TarjetaVinculada[]>(CLAVES.tarjetas, []);
}

function guardarCopia(tarjetas: TarjetaVinculada[]): TarjetaVinculada[] {
  escribirGuardado(CLAVES.tarjetas, tarjetas);
  return tarjetas;
}

export async function sincronizarTarjetas(): Promise<TarjetaVinculada[]> {
  if (!haySesionUsuario()) return [];
  return guardarCopia(await pedirApi<TarjetaVinculada[]>('/usuario/tarjetas'));
}

export async function agregarTarjeta(nueva: Omit<TarjetaVinculada, 'id'>): Promise<TarjetaVinculada[]> {
  return guardarCopia(
    await pedirApi<TarjetaVinculada[]>('/usuario/tarjetas', { method: 'POST', body: nueva }),
  );
}

export async function quitarTarjeta(id: string): Promise<TarjetaVinculada[]> {
  return guardarCopia(
    await pedirApi<TarjetaVinculada[]>(`/usuario/tarjetas/${id}`, { method: 'DELETE' }),
  );
}
