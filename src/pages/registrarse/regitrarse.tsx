import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import BotonGoogle from "../../components/BotonGoogle";
import { mensajeDeError } from "../../services/apiService";
import { registrarUsuario } from "../../services/usuarioService";
import "./registrarse.css";

export default function Registrarse() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (nombre.trim() === "" || email.trim() === "" || password.trim() === "") {
      setError("Completá tu nombre, tu email y tu contraseña.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      await registrarUsuario(nombre, email, password);
      navigate("/inicio");
    } catch (err) {
      setError(mensajeDeError(err, "No pudimos crear la cuenta. Probá de nuevo en un momento."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor-registro">
      <Logo />

      <h1 className="titulo-registro">Crear cuenta</h1>
      <p className="subtitulo-registro">Elegí el tipo de cuenta que necesitás</p>

      <div className="tipos-cuenta">
        <button type="button" className="tipo-cuenta tipo-cuenta-activo">
          Persona
        </button>
        <button
          type="button"
          className="tipo-cuenta"
          onClick={() => navigate("/cuenta-negocio")}
        >
          Negocio
        </button>
      </div>

      <form className="formulario-registro" onSubmit={manejarEnvio}>
        <label className="etiqueta-registro" htmlFor="nombre">Nombre</label>
        <input
          className="campo-registro"
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Juana Pérez"
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <label className="etiqueta-registro" htmlFor="email">Email</label>
        <input
          className="campo-registro"
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="etiqueta-registro" htmlFor="password">Contraseña</label>
        <input
          className="campo-registro"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-registro">{error}</p>}

        <button type="submit" className="btn-crear-cuenta" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <BotonGoogle
          onExito={() => navigate("/inicio")}
          onError={setError}
          disabled={enviando}
        />
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
