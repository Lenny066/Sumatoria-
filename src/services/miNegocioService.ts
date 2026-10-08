import type { Dia, Horario, Negocio, Rubro } from './negociosService';

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

const CENTRO_CABA: [number, number] = [-34.6037, -58.3816];

const DIAS_CORTOS: Record<Dia, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

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
    promociones: [],
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
    const horario = `${formatearHora(desde)}–${formatearHora(hasta)}`;
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
