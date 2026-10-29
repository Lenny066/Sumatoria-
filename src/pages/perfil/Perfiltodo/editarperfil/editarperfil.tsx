import React, { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, Check, ChevronLeft, MapPin } from 'lucide-react';
import { mensajeDeError } from '../../../../services/apiService';
import {
  actualizarPerfil,
  obtenerIniciales,
  obtenerUsuario,
} from '../../../../services/usuarioService';
import './editarperfil.css';

const TAMANO_FOTO = 256;

function achicarFoto(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      const lado = Math.min(imagen.width, imagen.height);
      const lienzo = document.createElement('canvas');
      lienzo.width = TAMANO_FOTO;
      lienzo.height = TAMANO_FOTO;
      lienzo
        .getContext('2d')
        ?.drawImage(
          imagen,
          (imagen.width - lado) / 2,
          (imagen.height - lado) / 2,
          lado,
          lado,
          0,
          0,
          TAMANO_FOTO,
          TAMANO_FOTO,
        );
      URL.revokeObjectURL(url);
      resolve(lienzo.toDataURL('image/jpeg', 0.85));
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('foto-invalida'));
    };
    imagen.src = url;
  });
}

export default function EditarPerfil(): React.JSX.Element {
  const navigate = useNavigate();
  const inputFoto = useRef<HTMLInputElement>(null);
  const [usuario] = useState(obtenerUsuario);

  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const email = usuario?.email ?? '';
  const [barrio, setBarrio] = useState(usuario?.barrio ?? '');
  const [foto, setFoto] = useState<string | null>(usuario?.foto ?? null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return <Navigate to="/perfil" replace />;

  function elegirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    achicarFoto(archivo)
      .then(setFoto)
      .catch(() => {});
  }

  async function guardar(evento: React.SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!usuario) return;
    setError(null);
    setGuardando(true);
    try {
      await actualizarPerfil({ nombre: nombre.trim(), barrio: barrio.trim(), foto });
      navigate(-1);
    } catch (err) {
      setError(mensajeDeError(err, 'No pudimos guardar los cambios. Probá de nuevo.'));
      setGuardando(false);
    }
  }

  const emailVerificado = email.trim() === usuario.emailGoogle;
  const puedeGuardar = nombre.trim() !== '' && !guardando;

  return (
    <form className="editar-perfil" onSubmit={guardar}>
      <div className="editar-perfil__scroll">
        <header className="editar-perfil__cabecera">
          <button type="button" className="editar-perfil__volver" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} strokeWidth={2.4} />
            Perfil
          </button>

          <h1 className="editar-perfil__titulo">Editar perfil</h1>
          <p className="editar-perfil__bajada">Así te ven los comercios al canjear</p>
        </header>

        <div className="editar-perfil__foto">
          <button
            type="button"
            className="editar-perfil__avatar"
            aria-label="Cambiar foto"
            onClick={() => inputFoto.current?.click()}
          >
            {foto ? (
              <img src={foto} alt="" referrerPolicy="no-referrer" />
            ) : (
              obtenerIniciales(nombre || usuario.nombre)
            )}
            <span className="editar-perfil__camara">
              <Camera size={13} strokeWidth={2.2} />
            </span>
          </button>

          <button
            type="button"
            className="editar-perfil__cambiar-foto"
            onClick={() => inputFoto.current?.click()}
          >
            Cambiar foto
          </button>

          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            className="editar-perfil__archivo"
            onChange={elegirFoto}
          />
        </div>

        <main className="editar-perfil__cuerpo">
          <label className="campo">
            <span className="campo__etiqueta">Nombre completo</span>
            <span className="campo__caja">
              <input
                className="campo__input"
                type="text"
                autoComplete="name"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
              />
            </span>
          </label>

          <label className="campo">
            <span className="campo__etiqueta">Email</span>
            <span className="campo__caja">
              <input
                className="campo__input"
                type="email"
                autoComplete="email"
                value={email}
                readOnly
              />
              {emailVerificado && (
                <span className="campo__verificado">
                  <Check size={11} strokeWidth={3} />
                  Verificado
                </span>
              )}
            </span>
          </label>

          <label className="campo">
            <span className="campo__etiqueta">
              Barrio <span className="campo__opcional">(opcional)</span>
            </span>
            <span className="campo__caja">
              <input
                className="campo__input"
                type="text"
                autoComplete="address-level2"
                placeholder="Ej: Belgrano, CABA"
                value={barrio}
                onChange={(evento) => setBarrio(evento.target.value)}
              />
              <MapPin className="campo__icono" size={17} strokeWidth={2} />
            </span>
            <span className="campo__ayuda">
              Si lo completás, te mostramos las promos de tu barrio. Si lo dejás vacío, vas a ver
              todas las promos de Capital.
            </span>
          </label>
        </main>
      </div>

      <footer className="editar-perfil__pie">
        {error && <p className="editar-perfil__error">{error}</p>}
        <button type="submit" className="editar-perfil__guardar" disabled={!puedeGuardar}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </footer>
    </form>
  );
}
