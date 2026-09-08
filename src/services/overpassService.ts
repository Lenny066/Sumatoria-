export interface Local {
  id: number;
  nombre: string;
  categoria: string;
  tipo: 'gastronomia' | 'ropa' | 'otro';
  lat: number;
  lng: number;
  direccion?: string;
}

const CABA_BBOX = {
  south: -34.705,
  west: -58.531,
  north: -34.526,
  east: -58.335,
};

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

const CACHE_KEY = 'sumatoria_locales_caba';
const CACHE_DURACION_MS = 1000 * 60 * 60 * 24 * 7;

const AMENITIES_GASTRONOMIA = [
  'restaurant',
  'cafe',
  'bar',
  'fast_food',
  'pub',
  'ice_cream',
];

function construirQuery(): string {
  const { south, west, north, east } = CABA_BBOX;
  const bbox = `${south},${west},${north},${east}`;
  const amenities = AMENITIES_GASTRONOMIA.join('|');

  return `
    [out:json][timeout:90];
    (
      node["amenity"~"^(${amenities})$"](${bbox});
      node["shop"](${bbox});
    );
    out body;
  `;
}

function clasificar(tags: Record<string, string>): 'gastronomia' | 'ropa' | 'otro' {
  if (tags.amenity && AMENITIES_GASTRONOMIA.includes(tags.amenity)) {
    return 'gastronomia';
  }
  if (tags.shop === 'clothes' || tags.shop === 'shoes' || tags.shop === 'boutique') {
    return 'ropa';
  }
  return 'otro';
}

function mapearElementos(elements: any[]): Local[] {
  return elements
    .filter((el) => el.tags?.name && el.lat && el.lon)
    .map((el) => {
      const direccion = el.tags['addr:street']
        ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim()
        : undefined;

      return {
        id: el.id,
        nombre: el.tags.name as string,
        categoria: (el.tags.shop || el.tags.amenity || 'otro') as string,
        tipo: clasificar(el.tags),
        lat: el.lat as number,
        lng: el.lon as number,
        direccion,
      };
    });
}

function leerCache(): Local[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const { timestamp, datos } = JSON.parse(raw);
    const vencida = Date.now() - timestamp > CACHE_DURACION_MS;

    return vencida ? null : (datos as Local[]);
  } catch {
    return null;
  }
}

function guardarCache(datos: Local[]): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), datos })
    );
  } catch {
    return;
  }
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pedirAOverpass(url: string, query: string): Promise<any> {
  const MAX_INTENTOS = 3;

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    const res = await fetch(url, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
    });

    if (res.ok) {
      return res.json();
    }

    if (res.status === 429 && intento < MAX_INTENTOS) {

      await esperar(3000 * intento);
      continue;
    }

    throw new Error(`Overpass (${url}) respondió con estado ${res.status}`);
  }

  throw new Error(`Overpass (${url}) siguió respondiendo 429 tras reintentar`);
}

async function pedirConMirrors(query: string): Promise<any> {
  let ultimoError: unknown;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      return await pedirAOverpass(mirror, query);
    } catch (err) {
      ultimoError = err;

    }
  }

  throw ultimoError;
}

export async function fetchLocalesCABA(forzarActualizacion = false): Promise<Local[]> {
  if (!forzarActualizacion) {
    const cacheados = leerCache();
    if (cacheados) return cacheados;
  }

  const query = construirQuery();

  try {
    const data = await pedirConMirrors(query);
    const locales = mapearElementos(data.elements ?? []);
    guardarCache(locales);
    return locales;
  } catch (err) {

    const cacheados = leerCache();
    if (cacheados) return cacheados;
    throw err;
  }
}
