export type Marca = 'visa' | 'mastercard' | 'amex' | 'cabal';

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

const CLAVE = 'sumatoria:tarjetas';

export function obtenerTarjetas(): TarjetaVinculada[] {
  try {
    const guardadas = localStorage.getItem(CLAVE);
    return guardadas ? (JSON.parse(guardadas) as TarjetaVinculada[]) : [];
  } catch {
    return [];
  }
}

function guardarTarjetas(tarjetas: TarjetaVinculada[]): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(tarjetas));
  } catch {
    return;
  }
}

export function agregarTarjeta(nueva: Omit<TarjetaVinculada, 'id'>): TarjetaVinculada[] {
  const actuales = obtenerTarjetas();
  const repetida = actuales.some(
    ({ marca, banco, tipo }) =>
      marca === nueva.marca && banco === nueva.banco && tipo === nueva.tipo,
  );

  if (repetida) {
    return actuales;
  }

  const tarjetas = [...actuales, { ...nueva, id: `${Date.now()}` }];
  guardarTarjetas(tarjetas);
  return tarjetas;
}

export function quitarTarjeta(id: string): TarjetaVinculada[] {
  const tarjetas = obtenerTarjetas().filter((tarjeta) => tarjeta.id !== id);
  guardarTarjetas(tarjetas);
  return tarjetas;
}
