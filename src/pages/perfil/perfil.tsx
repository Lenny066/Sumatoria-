import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  DollarSign,
  ChevronRight,
  User,
  CreditCard,
  Store,
  Bell,
  UserPlus,
  FileText,
} from 'lucide-react';
import Barra from '../../components/barra';
import './perfil.css';

const USUARIO = {
  nombre: 'Juan Pérez',
  email: 'juan.perez@email.com',
  ahorroTotal: '$0',
  ahorroMes: '+$0 este mes',
};

type Opcion = {
  id: string;
  etiqueta: string;
  icono: typeof User;
  ruta?: string;
};

const OPCIONES: Opcion[] = [
  { id: 'editar', etiqueta: 'Editar perfil', icono: User },
  { id: 'tarjetas', etiqueta: 'Tarjetas vinculadas', icono: CreditCard, ruta: '/tarjetas-vinculadas' },
  { id: 'negocios', etiqueta: 'Negocios que sigo', icono: Store },
  { id: 'ajustes', etiqueta: 'Ajustes y notificaciones', icono: Bell },
  { id: 'invitar', etiqueta: 'Invitá amigos', icono: UserPlus },
  { id: 'terminos', etiqueta: 'Términos y condiciones', icono: FileText },
];

function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

export default function Perfil(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="perfil">
      <div className="perfil__scroll">
        <header className="perfil__cabecera">
          <span className="perfil__avatar">{obtenerIniciales(USUARIO.nombre)}</span>

          <div className="perfil__datos">
            <h1 className="perfil__nombre">{USUARIO.nombre}</h1>
            <p className="perfil__email">{USUARIO.email}</p>
          </div>

          <button type="button" className="perfil__editar" aria-label="Editar perfil">
            <Pencil size={18} strokeWidth={2} />
          </button>
        </header>

        <main className="perfil__cuerpo">
          <button type="button" className="ahorro">
            <span className="ahorro__icono">
              <DollarSign size={20} strokeWidth={2.3} />
            </span>

            <span className="ahorro__textos">
              <span className="ahorro__etiqueta">Ahorro total</span>
              <span className="ahorro__monto">{USUARIO.ahorroTotal}</span>
              <span className="ahorro__mes">{USUARIO.ahorroMes}</span>
            </span>

            <ChevronRight className="ahorro__flecha" size={20} strokeWidth={2.4} />
          </button>

          <ul className="perfil-opciones">
            {OPCIONES.map(({ id, etiqueta, icono: Icono, ruta }) => (
              <li key={id}>
                <button
                  type="button"
                  className="perfil-opcion"
                  onClick={() => ruta && navigate(ruta)}
                >
                  <span className="perfil-opcion__icono">
                    <Icono size={17} strokeWidth={2} />
                  </span>
                  <span className="perfil-opcion__etiqueta">{etiqueta}</span>
                  <ChevronRight className="perfil-opcion__flecha" size={16} strokeWidth={2.2} />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="perfil__cerrar-sesion">
            Cerrar sesión
          </button>
        </main>
      </div>

      <Barra />
    </div>
  );
}
