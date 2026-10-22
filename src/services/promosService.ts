import type { Dia, Promocion } from './negociosService';
import {
  NOMBRES_MARCA,
  obtenerTarjetas,
  type Marca,
  type TarjetaVinculada,
  type TipoTarjeta,
} from './tarjetasService';
import { obtenerUsuario } from './usuarioService';

export type MedioPago =
  | { tipo: 'efectivo' | 'transferencia' | 'mercadopago' }
  | { tipo: TipoTarjeta; marca: Marca | null; banco: string | null };

export type TipoMedioSimple = 'efectivo' | 'transferencia' | 'mercadopago';

export const MEDIOS_SIMPLES: { tipo: TipoMedioSimple; etiqueta: string }[] = [
  { tipo: 'efectivo', etiqueta: 'Efectivo' },
  { tipo: 'transferencia', etiqueta: 'Transferencia' },
  { tipo: 'mercadopago', etiqueta: 'Mercado Pago' },
];

export const DIAS_SEMANA: Dia[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const DIAS_CORTOS: Record<Dia, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

const NOMBRES_TIPO: Record<TipoTarjeta, string> = {
  debito: 'Débito',
  credito: 'Crédito',
};

export function esTarjeta(
  medio: MedioPago,
): medio is { tipo: TipoTarjeta; marca: Marca | null; banco: string | null } {
  return medio.tipo === 'debito' || medio.tipo === 'credito';
}

export function mismoMedio(a: MedioPago, b: MedioPago): boolean {
  if (esTarjeta(a) && esTarjeta(b)) {
    return a.tipo === b.tipo && a.marca === b.marca && a.banco === b.banco;
  }
  return a.tipo === b.tipo;
}

export function textoMedioPago(medio: MedioPago): string {
  if (!esTarjeta(medio)) {
    return MEDIOS_SIMPLES.find(({ tipo }) => tipo === medio.tipo)?.etiqueta ?? '';
  }
  const tipo = NOMBRES_TIPO[medio.tipo];
  if (!medio.marca && !medio.banco) return `Cualquier tarjeta de ${tipo.toLowerCase()}`;
  const tarjeta = medio.marca ? `${tipo} ${NOMBRES_MARCA[medio.marca]}` : tipo;
  return medio.banco ? `${tarjeta} · ${medio.banco}` : tarjeta;
}

export function textoDias(dias: Dia[]): string {
  const elegidos = DIAS_SEMANA.filter((dia) => dias.includes(dia));
  if (elegidos.length === 0) return '';
  if (elegidos.length === 7) return 'Todos los días';

  const tramos: Dia[][] = [];
  for (const dia of elegidos) {
    const ultimo = tramos[tramos.length - 1];
    const anterior = ultimo?.[ultimo.length - 1];
    if (anterior && DIAS_SEMANA.indexOf(dia) === DIAS_SEMANA.indexOf(anterior) + 1) {
      ultimo.push(dia);
    } else {
      tramos.push([dia]);
    }
  }

  return tramos
    .map((tramo) =>
      tramo.length >= 3
        ? `${DIAS_CORTOS[tramo[0]]} a ${DIAS_CORTOS[tramo[tramo.length - 1]].toLowerCase()}`
        : tramo.map((dia) => DIAS_CORTOS[dia]).join(', '),
    )
    .join(', ');
}

export function obtenerMisTarjetas(): TarjetaVinculada[] {
  return obtenerUsuario() ? obtenerTarjetas() : [];
}

export function sirveConTarjetas(promo: Promocion, tarjetas: TarjetaVinculada[]): boolean {
  if (tarjetas.length === 0 || !promo.mediosPago) return true;
  return promo.mediosPago.some((medio) =>
    !esTarjeta(medio)
      ? medio.tipo === 'efectivo' || medio.tipo === 'transferencia'
      : tarjetas.some(
          (tarjeta) =>
            tarjeta.tipo === medio.tipo &&
            (!medio.marca || medio.marca === tarjeta.marca) &&
            (!medio.banco || medio.banco === tarjeta.banco),
        ),
  );
}
