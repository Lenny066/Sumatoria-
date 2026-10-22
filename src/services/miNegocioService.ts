import type { Dia, Horario, Negocio, Rubro } from './negociosService';
import { DIAS_CORTOS, DIAS_SEMANA, type MedioPago } from './promosService';

export type EstadoPromo = 'activa' | 'pausada';

export type PromoNegocio = {
  id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  dias: Dia[];
  mediosPago: MedioPago[];
  vence?: string;
  estado: EstadoPromo;
};

export type MiNegocio = {
  id: string;
  nombre: string;
  descripcion: string;
  rubro: Rubro;
  direccion: string;
  logo?: string;
  portada?: string;
  horarios: Horario[];
  mediosPago: string[];
};

const CLAVE = 'sumatoria:mi-negocio';
const CLAVE_PROMOS = 'sumatoria:mis-promos';

const CENTRO_CABA: [number, number] = [-34.6037, -58.3816];

export function obtenerMiNegocio(): MiNegocio | null {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? (JSON.parse(guardado) as MiNegocio) : null;
  } catch {
    return null;
  }
}

export function guardarMiNegocio(negocio: MiNegocio): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(negocio));
    return true;
  } catch {
    return false;
  }
}

function enDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

const PROMOS_EJEMPLO: PromoNegocio[] = [
  {
    id: 'promo-1',
    titulo: '20% OFF en toda la tienda',
    descripcion: 'Descuento en todos los productos del local, sin mínimo de compra.',
    dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    mediosPago: [
      { tipo: 'efectivo' },
      { tipo: 'debito', marca: null, banco: null },
      { tipo: 'credito', marca: 'visa', banco: 'Banco Galicia' },
    ],
    vence: enDias(14),
    estado: 'activa',
  },
  {
    id: 'promo-2',
    titulo: '2×1 en facturas los lunes',
    descripcion: 'Llevando una docena de facturas, la segunda te sale gratis. Solo en Av. Cabildo.',
    dias: ['Lunes'],
    mediosPago: [{ tipo: 'efectivo' }, { tipo: 'mercadopago' }],
    estado: 'pausada',
  },
  {
    id: 'promo-3',
    titulo: 'Envío gratis desde $10.000',
    descripcion: 'Envío sin cargo dentro de Belgrano para pedidos por WhatsApp desde $10.000.',
    dias: DIAS_SEMANA,
    mediosPago: [{ tipo: 'transferencia' }, { tipo: 'mercadopago' }],
    estado: 'pausada',
  },
];

type PromoGuardada = Omit<PromoNegocio, 'dias' | 'mediosPago' | 'descripcion'> & {
  detalle?: string;
  descripcion?: string;
  dias?: Dia[];
  mediosPago?: (MedioPago | string)[];
};

const MEDIOS_ANTERIORES: Record<string, MedioPago> = {
  Efectivo: { tipo: 'efectivo' },
  Transferencia: { tipo: 'transferencia' },
  'Mercado Pago': { tipo: 'mercadopago' },
  Débito: { tipo: 'debito', marca: null, banco: null },
  Crédito: { tipo: 'credito', marca: null, banco: null },
};

function normalizarPromo({ detalle, descripcion, dias, mediosPago, ...promo }: PromoGuardada): PromoNegocio {
  return {
    ...promo,
    descripcion: descripcion || detalle || '',
    dias: dias ?? DIAS_SEMANA,
    mediosPago: (mediosPago ?? [])
      .map((medio) => (typeof medio === 'string' ? MEDIOS_ANTERIORES[medio] : medio))
      .filter((medio): medio is MedioPago => medio !== undefined),
  };
}

export function obtenerMisPromos(): PromoNegocio[] {
  try {
    const guardadas = localStorage.getItem(CLAVE_PROMOS);
    if (!guardadas) return PROMOS_EJEMPLO;
    return (JSON.parse(guardadas) as PromoGuardada[]).map(normalizarPromo);
  } catch {
    return PROMOS_EJEMPLO;
  }
}

export function guardarMisPromos(promos: PromoNegocio[]): boolean {
  try {
    localStorage.setItem(CLAVE_PROMOS, JSON.stringify(promos));
    return true;
  } catch {
    return false;
  }
}

export function crearMiNegocio(
  datos: Pick<MiNegocio, 'nombre' | 'rubro' | 'direccion' | 'horarios' | 'logo'>,
): MiNegocio {
  const negocio: MiNegocio = {
    id: `mio-${Date.now()}`,
    descripcion: '',
    mediosPago: [],
    ...datos,
  };
  guardarMiNegocio(negocio);
  return negocio;
}

export function miNegocioComoCliente(negocio: MiNegocio): Negocio {
  return {
    id: negocio.id,
    nombre: negocio.nombre,
    rubro: negocio.rubro,
    logo: negocio.logo,
    portada: negocio.portada,
    descripcion: negocio.descripcion,
    direccion: negocio.direccion,
    lat: CENTRO_CABA[0],
    lng: CENTRO_CABA[1],
    horarios: negocio.horarios,
    promociones: obtenerMisPromos()
      .filter(({ estado }) => estado === 'activa')
      .map(({ id, titulo, descripcion, imagen, dias, mediosPago, vence }) => ({
        id,
        descuento: titulo,
        descripcion,
        imagen,
        dias,
        mediosPago,
        vence,
      })),
  };
}

function formatearHora(hora: string): string {
  const [horas, minutos] = hora.split(':');
  return minutos === '00' ? String(Number(horas)) : `${Number(horas)}:${minutos}`;
}

export function resumirHorarios(horarios: Horario[]): string {
  const tramos: { desde: Dia; hasta: Dia; horario: string }[] = [];
  for (const { dia, abierto, desde, hasta } of horarios) {
    if (!abierto) continue;
    const horario = desde === hasta ? '24 hs' : `${formatearHora(desde)}–${formatearHora(hasta)}`;
    const ultimo = tramos[tramos.length - 1];
    const anterior = horarios[horarios.findIndex((item) => item.dia === dia) - 1];
    if (ultimo && ultimo.horario === horario && anterior?.dia === ultimo.hasta && anterior.abierto) {
      ultimo.hasta = dia;
    } else {
      tramos.push({ desde: dia, hasta: dia, horario });
    }
  }
  if (tramos.length === 0) return 'Sin horarios cargados';
  return tramos
    .map(({ desde, hasta, horario }) => {
      const dias =
        desde === hasta
          ? DIAS_CORTOS[desde]
          : `${DIAS_CORTOS[desde]} a ${DIAS_CORTOS[hasta].toLowerCase()}`;
      return `${dias} ${horario}`;
    })
    .join(' · ');
}

export function leerImagen(archivo: File, ladoMaximo: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(lector.error);
    lector.onload = () => {
      const imagen = new Image();
      imagen.onerror = () => reject(new Error('No se pudo leer la imagen'));
      imagen.onload = () => {
        const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height));
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.round(imagen.width * escala);
        lienzo.height = Math.round(imagen.height * escala);
        lienzo.getContext('2d')?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
        resolve(lienzo.toDataURL('image/jpeg', 0.85));
      };
      imagen.src = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  });
}
