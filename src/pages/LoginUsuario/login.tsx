import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import "./login.css";

export default function Login() {
  return (
    <div className="contenedor-login">
      <Logo />

      <h1 className="titulo-login">Iniciar sesión</h1>
      <p className="subtitulo-login">Entrá para ver y guardar tus promociones</p>

      <form className="formulario-login" onSubmit={(e) => e.preventDefault()}>
        <label className="etiqueta-login" htmlFor="email">Email</label>
        <input
          className="campo-login"
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
        />

        <label className="etiqueta-login" htmlFor="password">Contraseña</label>
        <input
          className="campo-login"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />

        

        <button type="submit" className="btn-iniciar-sesion">
          Iniciar sesión
        </button>
      </form>

      <p className="texto-crear-cuenta">
        ¿No tenés cuenta?{" "}
        <Link to="/registrarse" className="link-crear-cuenta">
          Creá una
        </Link>
      </p>

      <button type="button" className="btn-sin-cuenta">
        Continuar sin cuenta
      </button>
    </div>
  );
}
