import {
  CLAVES,
  escribirGuardado,
  haySesionUsuario,
  leerGuardado,
  pedirApi,
} from './apiService';
import { obtenerMisTarjetas, sirveConTarjetas, type MedioPago } from './promosService';

export type Rubro =
  | 'Gastronomía'
  | 'Indumentaria'
  | 'Supermercado'
  | 'Electrodomésticos'
  | 'Farmacia'
  | 'Librería'
  | 'Otro';

export type Dia = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export type Horario = {
  dia: Dia;
  abierto: boolean;
  desde: string;
  hasta: string;
};

export type Promocion = {
  id: string;
  descuento: string;
  detalle?: string;
  descripcion?: string;
  imagen?: string;
  dias?: Dia[];
  mediosPago?: MedioPago[];
  vence?: string;
};

export type Negocio = {
  id: string;
  nombre: string;
  rubro: Rubro;
  logo?: string;
  portada?: string;
  descripcion?: string;
  direccion: string;
  lat: number;
  lng: number;
  horarios: Horario[];
  promociones: Promocion[];
  puntuacion?: number;
};

export const RUBROS: Rubro[] = [
  'Gastronomía',
  'Indumentaria',
  'Supermercado',
  'Electrodomésticos',
  'Farmacia',
  'Librería',
  'Otro',
];

export type EstadoHorario = {
  abierto: boolean;
  texto: string;
};

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

const DIAS: Dia[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const SEMANA_COMERCIAL: Horario[] = [
  { dia: 'Lunes', abierto: true, desde: '09:00', hasta: '20:00' },
  { dia: 'Martes', abierto: true, desde: '09:00', hasta: '20:00' },
  { dia: 'Miércoles', abierto: true, desde: '09:00', hasta: '20:00' },
  { dia: 'Jueves', abierto: true, desde: '09:00', hasta: '20:00' },
  { dia: 'Viernes', abierto: true, desde: '09:00', hasta: '20:00' },
  { dia: 'Sábado', abierto: true, desde: '10:00', hasta: '14:00' },
  { dia: 'Domingo', abierto: false, desde: '09:00', hasta: '18:00' },
];

function enDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

const TODOS_LOS_DIAS: Dia[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const NEGOCIOS_PRUEBA: Negocio[] = [
  {
    id: '1',
    nombre: 'Panadería Norte',
    puntuacion: 4.7,
    rubro: 'Gastronomía',
    logo: '/logos/panaderia-norte.svg',
    direccion: 'Av. Cabildo 2140',
    lat: -34.5612,
    lng: -58.4563,
    horarios: SEMANA_COMERCIAL,
    promociones: [
      {
        id: '1-1',
        descuento: '20% OFF',
        descripcion: 'Descuento en toda la panadería pagando con débito Visa.',
        dias: ['Lunes', 'Martes'],
        mediosPago: [{ tipo: 'debito', marca: 'visa', banco: null }],
        vence: enDias(3),
      },
      {
        id: '1-2',
        descuento: '2x1 en facturas',
        descripcion: 'Válido después de las 18 hs, hasta agotar stock.',
        dias: TODOS_LOS_DIAS,
        mediosPago: [{ tipo: 'efectivo' }, { tipo: 'mercadopago' }],
        vence: enDias(20),
      },
    ],
  },
  {
    id: '2',
    nombre: 'Farmacia Central',
    puntuacion: 4.2,
    rubro: 'Farmacia',
    logo: '/logos/farmacia-central.svg',
    direccion: 'Av. Santa Fe 3250',
    lat: -34.5878,
    lng: -58.4108,
    horarios: SEMANA_COMERCIAL.map((horario) => ({ ...horario, abierto: true, desde: '08:00', hasta: '22:00' })),
    promociones: [
      {
        id: '2-1',
        descuento: '15% OFF',
        descripcion: 'En perfumería y cuidado personal. No incluye medicamentos.',
        dias: TODOS_LOS_DIAS,
        mediosPago: [{ tipo: 'credito', marca: 'mastercard', banco: null }],
        vence: enDias(5),
      },
    ],
  },
  {
    id: '3',
    nombre: 'Moda Urbana',
    puntuacion: 4.5,
    rubro: 'Indumentaria',
    logo: '/logos/moda-urbana.svg',
    direccion: 'Av. Corrientes 4520',
    lat: -34.6008,
    lng: -58.4332,
    horarios: SEMANA_COMERCIAL,
    promociones: [
      {
        id: '3-1',
        descuento: '3 cuotas sin interés',
        descripcion: 'En compras desde $30.000 en toda la tienda.',
        dias: TODOS_LOS_DIAS,
        mediosPago: [{ tipo: 'credito', marca: 'visa', banco: 'Banco Galicia' }],
        vence: enDias(40),
      },
      {
        id: '3-2',
        descuento: '25% OFF',
        descripcion: 'En la nueva colección de temporada.',
        dias: ['Jueves'],
        mediosPago: [{ tipo: 'debito', marca: 'cabal', banco: null }],
        vence: enDias(1),
      },
    ],
  },
  {
    id: '4',
    nombre: 'Súper Ahorro',
    puntuacion: 3.9,
    rubro: 'Supermercado',
    logo: '/logos/super-ahorro.svg',
    direccion: 'Av. Rivadavia 6100',
    lat: -34.6268,
    lng: -58.4495,
    horarios: SEMANA_COMERCIAL.map((horario) => ({ ...horario, abierto: true, desde: '08:00', hasta: '21:00' })),
    promociones: [
      {
        id: '4-1',
        descuento: '30% OFF',
        descripcion: 'En almacén y limpieza, con tope de reintegro de $8.000 por semana.',
        dias: ['Miércoles'],
        mediosPago: [{ tipo: 'debito', marca: 'mastercard', banco: 'Banco Nación' }],
        vence: enDias(12),
      },
    ],
  },
  {
    id: '5',
    nombre: 'Café del Parque',
    puntuacion: 4.8,
    rubro: 'Gastronomía',
    logo: '/logos/cafe-del-parque.svg',
    direccion: 'Av. Sarmiento 2601',
    lat: -34.5745,
    lng: -58.4165,
    horarios: SEMANA_COMERCIAL.map((horario) => ({ ...horario, abierto: true, desde: '08:00', hasta: '19:00' })),
    promociones: [],
  },
];

export type SeccionInicio = 'hot' | 'sugeridas' | 'elegidos' | 'nuevos';

export type SeccionesInicio = Record<SeccionInicio, Negocio[]>;

const SECCIONES_PRUEBA: Record<SeccionInicio, string[]> = {
  hot: ['1', '3', '4'],
  sugeridas: ['2', '1'],
  elegidos: ['4', '3', '2'],
  nuevos: ['5'],
};

function negociosDePrueba(ids: string[]): Negocio[] {
  return ids
    .map((id) => NEGOCIOS_PRUEBA.find((negocio) => negocio.id === id))
    .filter((negocio): negocio is Negocio => negocio !== undefined);
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Manda el token si hay sesión: así el back ya filtra las promos por las tarjetas del usuario
function pedir<T>(ruta: string): Promise<T> {
  return pedirApi<T>(ruta);
}

export function filtrarPorMisTarjetas(negocio: Negocio): Negocio {
  const tarjetas = obtenerMisTarjetas();
  if (tarjetas.length === 0) return negocio;
  return {
    ...negocio,
    promociones: negocio.promociones.filter((promo) => sirveConTarjetas(promo, tarjetas)),
  };
}

async function obtenerTodosLosNegocios(): Promise<Negocio[]> {
  if (!API_URL) return NEGOCIOS_PRUEBA;
  return pedir<Negocio[]>('/negocios');
}

export async function obtenerNegocios(): Promise<Negocio[]> {
  return (await obtenerTodosLosNegocios()).map(filtrarPorMisTarjetas);
}

export async function obtenerNegocio(id: string): Promise<Negocio | null> {
  if (!API_URL) return NEGOCIOS_PRUEBA.find((negocio) => negocio.id === id) ?? null;
  try {
    return await pedir<Negocio>(`/negocios/${id}`);
  } catch {
    return null;
  }
}

export async function obtenerSeccionesInicio(): Promise<SeccionesInicio> {
  const secciones: SeccionesInicio = API_URL
    ? await pedir<SeccionesInicio>('/inicio')
    : {
        hot: negociosDePrueba(SECCIONES_PRUEBA.hot),
        sugeridas: negociosDePrueba(SECCIONES_PRUEBA.sugeridas),
        elegidos: negociosDePrueba(SECCIONES_PRUEBA.elegidos),
        nuevos: negociosDePrueba(SECCIONES_PRUEBA.nuevos),
      };
  return {
    hot: secciones.hot.map(filtrarPorMisTarjetas),
    sugeridas: secciones.sugeridas.map(filtrarPorMisTarjetas),
    elegidos: secciones.elegidos.map(filtrarPorMisTarjetas),
    nuevos: secciones.nuevos.map(filtrarPorMisTarjetas),
  };
}

export function coincideBusqueda(negocio: Negocio, texto: string): boolean {
  const busqueda = normalizar(texto);
  if (!busqueda) return true;
  return [
    negocio.nombre,
    negocio.rubro,
    ...negocio.promociones.flatMap((promo) => [promo.descuento, promo.descripcion ?? '']),
  ].some((campo) => normalizar(campo).includes(busqueda));
}

export async function buscarNegocios(texto: string): Promise<Negocio[]> {
  if (!normalizar(texto)) return [];
  const encontrados = API_URL
    ? await pedir<Negocio[]>(`/negocios?buscar=${encodeURIComponent(texto.trim())}`)
    : NEGOCIOS_PRUEBA.filter((negocio) => coincideBusqueda(negocio, texto));
  return encontrados.map(filtrarPorMisTarjetas);
}

function aMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

export function calcularEstadoHorario(horarios: Horario[], ahora = new Date()): EstadoHorario | null {
  if (horarios.length === 0) return null;

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = horarios.find((horario) => horario.dia === DIAS[ahora.getDay()]);
  const ayer = horarios.find((horario) => horario.dia === DIAS[(ahora.getDay() + 6) % 7]);

  if (ayer?.abierto) {
    const desde = aMinutos(ayer.desde);
    const hasta = aMinutos(ayer.hasta);
    if (hasta < desde && minutosAhora < hasta) {
      return { abierto: true, texto: `Abierto · Cierra a las ${ayer.hasta}` };
    }
  }

  if (hoy?.abierto) {
    const desde = aMinutos(hoy.desde);
    const hasta = aMinutos(hoy.hasta);
    if (desde === hasta) {
      return { abierto: true, texto: 'Abierto las 24 horas' };
    }
    if (minutosAhora >= desde && (hasta < desde || minutosAhora < hasta)) {
      return { abierto: true, texto: `Abierto · Cierra a las ${hoy.hasta}` };
    }
    if (minutosAhora < desde) {
      return { abierto: false, texto: `Cerrado · Abre a las ${hoy.desde}` };
    }
  }

  for (let salto = 1; salto <= 7; salto++) {
    const dia = DIAS[(ahora.getDay() + salto) % 7];
    const proximo = horarios.find((horario) => horario.dia === dia && horario.abierto);
    if (proximo) {
      const cuando = salto === 1 ? 'mañana' : `el ${dia.toLowerCase()}`;
      return { abierto: false, texto: `Cerrado · Abre ${cuando} a las ${proximo.desde}` };
    }
  }

  return { abierto: false, texto: 'Cerrado' };
}

export function distanciaKm(desde: [number, number], hasta: [number, number]): number {
  const radioTierraKm = 6371;
  const aRadianes = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRadianes(hasta[0] - desde[0]);
  const dLng = aRadianes(hasta[1] - desde[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(desde[0])) * Math.cos(aRadianes(hasta[0])) * Math.sin(dLng / 2) ** 2;
  return radioTierraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcularDistancia(desde: [number, number], hasta: [number, number]): string {
  return `${distanciaKm(desde, hasta).toFixed(1)} km`;
}

// ----- Negocios que sigo -----
// Se guardan en el back. Acá queda una copia de los ids para pintar los botones "Seguir" al instante.

export function obtenerSeguidos(): string[] {
  if (!haySesionUsuario()) return [];
  return leerGuardado<string[]>(CLAVES.seguidos, []);
}

function guardarSeguidos(ids: string[]): string[] {
  escribirGuardado(CLAVES.seguidos, ids);
  return ids;
}

export function estaSiguiendo(id: string): boolean {
  return obtenerSeguidos().includes(id);
}

export async function sincronizarSeguidos(): Promise<string[]> {
  if (!haySesionUsuario()) return [];
  return guardarSeguidos(await pedirApi<string[]>('/usuario/seguidos/ids'));
}

export async function cambiarSeguimiento(id: string, seguir: boolean): Promise<string[]> {
  return guardarSeguidos(
    await pedirApi<string[]>(`/negocios/${id}/seguir`, { method: seguir ? 'POST' : 'DELETE' }),
  );
}

export async function obtenerNegociosSeguidos(): Promise<Negocio[]> {
  if (!haySesionUsuario()) return [];
  const negocios = await pedirApi<Negocio[]>('/usuario/seguidos');
  guardarSeguidos(negocios.map(({ id }) => id));
  return negocios;
}

// ----- Promos guardadas (favoritos) -----

export type PromoGuardada = {
  negocioId: string;
  promoId: string;
};

export type Favorito = {
  negocio: Negocio;
  promocion: Promocion;
};

export function obtenerPromosGuardadas(): PromoGuardada[] {
  if (!haySesionUsuario()) return [];
  return leerGuardado<PromoGuardada[]>(CLAVES.promosGuardadas, []);
}

function guardarPromosGuardadas(guardadas: PromoGuardada[]): PromoGuardada[] {
  escribirGuardado(CLAVES.promosGuardadas, guardadas);
  return guardadas;
}

export function estaGuardada(guardadas: PromoGuardada[], negocioId: string, promoId: string): boolean {
  return guardadas.some((item) => item.negocioId === negocioId && item.promoId === promoId);
}

export async function sincronizarPromosGuardadas(): Promise<PromoGuardada[]> {
  if (!haySesionUsuario()) return [];
  return guardarPromosGuardadas(await pedirApi<PromoGuardada[]>('/usuario/favoritos/ids'));
}

export async function cambiarPromoGuardada(
  _negocioId: string,
  promoId: string,
  guardar: boolean,
): Promise<PromoGuardada[]> {
  const guardadas = guardar
    ? await pedirApi<PromoGuardada[]>('/usuario/favoritos', { method: 'POST', body: { promoId } })
    : await pedirApi<PromoGuardada[]>(`/usuario/favoritos/${promoId}`, { method: 'DELETE' });
  return guardarPromosGuardadas(guardadas);
}

export async function obtenerFavoritos(): Promise<Favorito[]> {
  if (!haySesionUsuario()) return [];
  return pedirApi<Favorito[]>('/usuario/favoritos');
}
