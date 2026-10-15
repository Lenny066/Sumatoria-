import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  DollarSign,
  ChevronRight,
  User,
  CreditCard,
  Store,
  FileText,
  UserRound,
} from 'lucide-react';
import Barra from '../../components/barra';
import InvitarCuenta from '../../components/InvitarCuenta';
import { cerrarSesion, obtenerIniciales, obtenerUsuario } from '../../services/usuarioService';
import './perfil.css';

const AHORRO_TOTAL = '$0';

type Opcion = {
  id: string;
  etiqueta: string;
  icono: typeof User;
  ruta?: string;
};

const OPCIONES: Opcion[] = [
  { id: 'editar', etiqueta: 'Editar perfil', icono: User, ruta: '/editar-perfil' },
  { id: 'tarjetas', etiqueta: 'Tarjetas vinculadas', icono: CreditCard, ruta: '/tarjetas-vinculadas' },
  { id: 'negocios', etiqueta: 'Negocios que sigo', icono: Store, ruta: '/negocios-que-sigo' },
  { id: 'terminos', etiqueta: 'Términos y condiciones', icono: FileText },
];

export default function Perfil(): React.JSX.Element {
  const navigate = useNavigate();
  const usuario = obtenerUsuario();

  if (!usuario) {
    return (
      <div className="perfil">
        <div className="perfil__scroll">
          <header className="perfil__cabecera">
            <span className="perfil__avatar perfil__avatar--invitado">
              <UserRound size={24} strokeWidth={2} />
            </span>

            <div className="perfil__datos">
              <h1 className="perfil__nombre">Invitado</h1>
              <p className="perfil__email">Todavía no tenés cuenta</p>
            </div>
          </header>

          <main className="perfil__cuerpo">
            <InvitarCuenta
              icono={CreditCard}
              titulo="Creá tu cuenta"
              texto="Guardá tus tarjetas, seguí a tus negocios favoritos y enterate de las promos que te convienen."
            />
          </main>
        </div>

        <Barra />
      </div>
    );
  }

  function salir() {
    cerrarSesion();
    navigate('/login', { replace: true });
  }

  return (
    <div className="perfil">
      <div className="perfil__scroll">
        <header className="perfil__cabecera">
          <span className="perfil__avatar">
            {usuario.foto ? (
              <img src={usuario.foto} alt="" referrerPolicy="no-referrer" />
            ) : (
              obtenerIniciales(usuario.nombre)
            )}
          </span>

          <div className="perfil__datos">
            <h1 className="perfil__nombre">{usuario.nombre}</h1>
            <p className="perfil__email">{usuario.email}</p>
          </div>

          <button
            type="button"
            className="perfil__editar"
            aria-label="Editar perfil"
            onClick={() => navigate('/editar-perfil')}
          >
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
              <span className="ahorro__monto">{AHORRO_TOTAL}</span>
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

          <button type="button" className="perfil__cerrar-sesion" onClick={salir}>
            Cerrar sesión
          </button>
        </main>
      </div>

      <Barra />
    </div>
  );
}
