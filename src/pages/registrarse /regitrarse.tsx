import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import "./registrarse.css";

export default function Registrarse() {
  return (
    <div className="contenedor-registro">
      <Logo />

      <h1 className="titulo-registro">Crear cuenta</h1>
      <p className="subtitulo-registro">Elegí el tipo de cuenta que necesitás</p>

      <div className="tipos-cuenta">
        <button type="button" className="tipo-cuenta tipo-cuenta-activo">
          Persona
        </button>
        <button type="button" className="tipo-cuenta">
          Negocio
        </button>
      </div>

      <form className="formulario-registro" onSubmit={(e) => e.preventDefault()}>
        <label className="etiqueta-registro" htmlFor="nombre">Nombre</label>
        <input
          className="campo-registro"
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Juana Pérez"
          autoComplete="name"
        />

        <label className="etiqueta-registro" htmlFor="email">Email</label>
        <input
          className="campo-registro"
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
        />

        <label className="etiqueta-registro" htmlFor="password">Contraseña</label>
        <input
          className="campo-registro"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <hr className="separador-registro" />

        <label className="etiqueta-registro" htmlFor="tarjeta">
          Tarjeta bancaria (opcional)
        </label>
        <p className="ayuda-registro">
          Sumala para ver promociones exclusivas de tu banco
        </p>
        <input
          className="campo-registro"
          id="tarjeta"
          name="tarjeta"
          type="text"
          placeholder="Banco emisor"
        />

        <button type="submit" className="btn-crear-cuenta">
          Crear cuenta
        </button>
      </form>

      <p className="texto-iniciar-sesion">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="link-iniciar-sesion">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
