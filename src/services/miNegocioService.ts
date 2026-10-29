import { guardarSesion, pedirApi } from './apiService';
import type { Dia, Horario, Rubro } from './negociosService';
import { DIAS_CORTOS, type MedioPago } from './promosService';

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
  lat?: number;
  lng?: number;
  email?: string;
};

type RespuestaRegistro = { token: string; negocio: MiNegocio };

// Crear cuenta de negocio: el back crea el negocio y devuelve la sesión
export async function registrarNegocio(
  datos: Pick<MiNegocio, 'nombre' | 'rubro' | 'direccion' | 'horarios' | 'logo'> & {
    email: string;
    password: string;
  },
): Promise<MiNegocio> {
  const { token, negocio } = await pedirApi<RespuestaRegistro>('/registro/empresa', {
    method: 'POST',
    body: datos,
  });
  guardarSesion(token, 'empresa');
  return negocio;
}

export function obtenerMiNegocio(): Promise<MiNegocio> {
  return pedirApi<MiNegocio>('/empresa/negocio');
}

export function guardarMiNegocio(negocio: MiNegocio): Promise<MiNegocio> {
  const { nombre, descripcion, rubro, direccion, horarios, logo, portada, mediosPago } = negocio;
  return pedirApi<MiNegocio>('/empresa/negocio', {
    method: 'PUT',
    body: { nombre, descripcion, rubro, direccion, horarios, logo, portada, mediosPago },
  });
}

export function obtenerMisPromos(): Promise<PromoNegocio[]> {
  return pedirApi<PromoNegocio[]>('/empresa/promos');
}

function datosDePromo({ titulo, descripcion, imagen, dias, mediosPago, vence, estado }: PromoNegocio) {
  return { titulo, descripcion, imagen: imagen ?? null, dias, mediosPago, vence: vence ?? null, estado };
}

export function crearPromo(promo: PromoNegocio): Promise<PromoNegocio> {
  return pedirApi<PromoNegocio>('/empresa/promos', { method: 'POST', body: datosDePromo(promo) });
}

export function editarPromo(promo: PromoNegocio): Promise<PromoNegocio> {
  return pedirApi<PromoNegocio>(`/empresa/promos/${promo.id}`, {
    method: 'PUT',
    body: datosDePromo(promo),
  });
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
