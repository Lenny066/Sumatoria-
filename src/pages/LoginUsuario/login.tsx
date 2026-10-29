import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import BotonGoogle from "../../components/BotonGoogle";
import { mensajeDeError } from "../../services/apiService";
import { cerrarSesion, iniciarSesion } from "../../services/usuarioService";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (email.trim() === "" || password.trim() === "") {
      setError("Completá tu email y tu contraseña.");
      return;
    }

    setEnviando(true);
    try {
      const rol = await iniciarSesion(email, password);
      navigate(rol === "empresa" ? "/perfil-negocio" : "/inicio");
    } catch (err) {
      setError(mensajeDeError(err, "No pudimos iniciar sesión. Probá de nuevo en un momento."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor-login">
      <Logo />

      <h1 className="titulo-login">Iniciar sesión</h1>
      <p className="subtitulo-login">Entrá para ver y guardar tus promociones</p>

      <form className="formulario-login" onSubmit={manejarEnvio}>
        <label className="etiqueta-login" htmlFor="email">Email</label>
        <input
          className="campo-login"
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="etiqueta-login" htmlFor="password">Contraseña</label>
        <input
          className="campo-login"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-login">{error}</p>}

        <button type="submit" className="btn-iniciar-sesion" disabled={enviando}>
          {enviando ? "Entrando..." : "Iniciar sesión"}
        </button>

        <BotonGoogle
          onExito={() => navigate("/inicio")}
          onError={setError}
          disabled={enviando}
        />
      </form>

      <p className="texto-crear-cuenta">
        ¿No tenés cuenta?{" "}
        <Link to="/registrarse" className="link-crear-cuenta">
          Creá una
        </Link>
      </p>

      <button
        type="button"
        className="btn-sin-cuenta"
        onClick={() => {
          cerrarSesion();
          navigate("/inicio");
        }}
      >
        Continuar sin cuenta
      </button>
    </div>
  );
}
