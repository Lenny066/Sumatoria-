import { miNegocioComoCliente, obtenerMiNegocio } from './miNegocioService';

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
};

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

const NEGOCIOS_PRUEBA: Negocio[] = [
  {
    id: '1',
    nombre: 'Panadería Norte',
    rubro: 'Gastronomía',
    logo: '/logos/panaderia-norte.svg',
    direccion: 'Av. Cabildo 2140',
    lat: -34.5612,
    lng: -58.4563,
    horarios: SEMANA_COMERCIAL,
    promociones: [
      { id: '1-1', descuento: '20% OFF', detalle: 'Con débito Visa · Lunes y martes', vence: enDias(3) },
      { id: '1-2', descuento: '2x1 en facturas', detalle: 'Todos los días después de las 18', vence: enDias(20) },
    ],
  },
  {
    id: '2',
    nombre: 'Farmacia Central',
    rubro: 'Farmacia',
    logo: '/logos/farmacia-central.svg',
    direccion: 'Av. Santa Fe 3250',
    lat: -34.5878,
    lng: -58.4108,
    horarios: SEMANA_COMERCIAL.map((horario) => ({ ...horario, abierto: true, desde: '08:00', hasta: '22:00' })),
    promociones: [{ id: '2-1', descuento: '15% OFF', detalle: 'Con crédito Mastercard · Todos los días', vence: enDias(5) }],
  },
  {
    id: '3',
    nombre: 'Moda Urbana',
    rubro: 'Indumentaria',
    logo: '/logos/moda-urbana.svg',
    direccion: 'Av. Corrientes 4520',
    lat: -34.6008,
    lng: -58.4332,
    horarios: SEMANA_COMERCIAL,
    promociones: [
      { id: '3-1', descuento: '3 cuotas sin interés', detalle: 'Con crédito Visa', vence: enDias(40) },
      { id: '3-2', descuento: '25% OFF', detalle: 'Con débito Cabal · Jueves', vence: enDias(1) },
    ],
  },
  {
    id: '4',
    nombre: 'Súper Ahorro',
    rubro: 'Supermercado',
    logo: '/logos/super-ahorro.svg',
    direccion: 'Av. Rivadavia 6100',
    lat: -34.6268,
    lng: -58.4495,
    horarios: SEMANA_COMERCIAL.map((horario) => ({ ...horario, abierto: true, desde: '08:00', hasta: '21:00' })),
    promociones: [{ id: '4-1', descuento: '30% OFF', detalle: 'Con débito Mastercard · Miércoles', vence: enDias(12) }],
  },
  {
    id: '5',
    nombre: 'Café del Parque',
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

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function pedir<T>(ruta: string): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`);
  if (!res.ok) {
    throw new Error(`El backend respondió con estado ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function obtenerNegocios(): Promise<Negocio[]> {
  if (!API_URL) return NEGOCIOS_PRUEBA;
  return pedir<Negocio[]>('/negocios');
}

export async function obtenerNegocio(id: string): Promise<Negocio | null> {
  const miNegocio = obtenerMiNegocio();
  if (miNegocio?.id === id) return miNegocioComoCliente(miNegocio);
  if (!API_URL) return NEGOCIOS_PRUEBA.find((negocio) => negocio.id === id) ?? null;
  try {
    return await pedir<Negocio>(`/negocios/${id}`);
  } catch {
    return null;
  }
}

export async function obtenerSeccionesInicio(): Promise<SeccionesInicio> {
  if (!API_URL) {
    return {
      hot: negociosDePrueba(SECCIONES_PRUEBA.hot),
      sugeridas: negociosDePrueba(SECCIONES_PRUEBA.sugeridas),
      elegidos: negociosDePrueba(SECCIONES_PRUEBA.elegidos),
      nuevos: negociosDePrueba(SECCIONES_PRUEBA.nuevos),
    };
  }
  return pedir<SeccionesInicio>('/inicio');
}

export async function buscarNegocios(texto: string): Promise<Negocio[]> {
  const busqueda = normalizar(texto);
  if (!busqueda) return [];
  if (!API_URL) {
    return NEGOCIOS_PRUEBA.filter((negocio) =>
      [negocio.nombre, negocio.rubro, ...negocio.promociones.map((promo) => promo.descuento)].some(
        (campo) => normalizar(campo).includes(busqueda),
      ),
    );
  }
  return pedir<Negocio[]>(`/negocios?buscar=${encodeURIComponent(texto.trim())}`);
}

function aMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

export function calcularEstadoHorario(horarios: Horario[], ahora = new Date()): EstadoHorario | null {
  if (horarios.length === 0) return null;

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = horarios.find((horario) => horario.dia === DIAS[ahora.getDay()]);

  if (hoy?.abierto) {
    const desde = aMinutos(hoy.desde);
    const hasta = aMinutos(hoy.hasta);
    if (minutosAhora >= desde && minutosAhora < hasta) {
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

export function calcularDistancia(desde: [number, number], hasta: [number, number]): string {
  const radioTierraKm = 6371;
  const aRadianes = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRadianes(hasta[0] - desde[0]);
  const dLng = aRadianes(hasta[1] - desde[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(desde[0])) * Math.cos(aRadianes(hasta[0])) * Math.sin(dLng / 2) ** 2;
  const km = radioTierraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return `${km.toFixed(1)} km`;
}

const CLAVE_SEGUIDOS = 'sumatoria:negocios-seguidos';

export function obtenerSeguidos(): string[] {
  try {
    const guardados = localStorage.getItem(CLAVE_SEGUIDOS);
    return guardados ? (JSON.parse(guardados) as string[]) : [];
  } catch {
    return [];
  }
}

function guardarSeguidos(ids: string[]): void {
  try {
    localStorage.setItem(CLAVE_SEGUIDOS, JSON.stringify(ids));
  } catch {
    return;
  }
}

export function estaSiguiendo(id: string): boolean {
  return obtenerSeguidos().includes(id);
}

export function cambiarSeguimiento(id: string, seguir: boolean): string[] {
  const actuales = obtenerSeguidos().filter((seguido) => seguido !== id);
  const ids = seguir ? [...actuales, id] : actuales;
  guardarSeguidos(ids);
  return ids;
}

export async function obtenerNegociosSeguidos(): Promise<Negocio[]> {
  const ids = obtenerSeguidos();
  if (ids.length === 0) return [];
  const negocios = await obtenerNegocios();
  return ids
    .map((id) => negocios.find((negocio) => negocio.id === id))
    .filter((negocio): negocio is Negocio => negocio !== undefined);
}

export type PromoGuardada = {
  negocioId: string;
  promoId: string;
};

export type Favorito = {
  negocio: Negocio;
  promocion: Promocion;
};

const CLAVE_PROMOS_GUARDADAS = 'sumatoria:promos-guardadas';

export function obtenerPromosGuardadas(): PromoGuardada[] {
  try {
    const guardadas = localStorage.getItem(CLAVE_PROMOS_GUARDADAS);
    return guardadas ? (JSON.parse(guardadas) as PromoGuardada[]) : [];
  } catch {
    return [];
  }
}

export function estaGuardada(guardadas: PromoGuardada[], negocioId: string, promoId: string): boolean {
  return guardadas.some((item) => item.negocioId === negocioId && item.promoId === promoId);
}

export function cambiarPromoGuardada(negocioId: string, promoId: string, guardar: boolean): PromoGuardada[] {
  const actuales = obtenerPromosGuardadas().filter(
    (item) => !(item.negocioId === negocioId && item.promoId === promoId),
  );
  const guardadas = guardar ? [...actuales, { negocioId, promoId }] : actuales;
  try {
    localStorage.setItem(CLAVE_PROMOS_GUARDADAS, JSON.stringify(guardadas));
  } catch {
    return guardadas;
  }
  return guardadas;
}

export async function obtenerFavoritos(): Promise<Favorito[]> {
  const guardadas = obtenerPromosGuardadas();
  if (guardadas.length === 0) return [];
  const negocios = await obtenerNegocios();
  return guardadas
    .map(({ negocioId, promoId }) => {
      const negocio = negocios.find((item) => item.id === negocioId);
      const promocion = negocio?.promociones.find((item) => item.id === promoId);
      return negocio && promocion ? { negocio, promocion } : null;
    })
    .filter((favorito): favorito is Favorito => favorito !== null);
}
