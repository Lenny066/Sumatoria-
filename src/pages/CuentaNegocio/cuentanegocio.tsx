import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import "./cuentanegocio.css";

type Horario = {
  dia: string;
  abierto: boolean;
  desde: string;
  hasta: string;
};

const HORARIOS_INICIALES: Horario[] = [
  { dia: "Lunes", abierto: true, desde: "09:00", hasta: "18:00" },
  { dia: "Martes", abierto: true, desde: "09:00", hasta: "18:00" },
  { dia: "Miércoles", abierto: true, desde: "09:00", hasta: "18:00" },
  { dia: "Jueves", abierto: true, desde: "09:00", hasta: "18:00" },
  { dia: "Viernes", abierto: true, desde: "09:00", hasta: "18:00" },
  { dia: "Sábado", abierto: false, desde: "09:00", hasta: "18:00" },
  { dia: "Domingo", abierto: false, desde: "09:00", hasta: "18:00" },
];

const RUBROS = [
  "Gastronomía",
  "Indumentaria",
  "Supermercado",
  "Farmacia",
  "Librería",
  "Servicios",
  "Otro",
];

export default function CuentaNegocio() {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState<Horario[]>(HORARIOS_INICIALES);
  const [nombreLogo, setNombreLogo] = useState<string | null>(null);

  /* Actualiza un solo día sin tocar los demás. */
  function actualizarHorario(indice: number, cambios: Partial<Horario>) {
    setHorarios((previos) =>
      previos.map((horario, i) =>
        i === indice ? { ...horario, ...cambios } : horario
      )
    );
  }

  return (
    <div className="contenedor-negocio">
      <Logo />

      <h1 className="titulo-negocio">Crear cuenta</h1>
      <p className="subtitulo-negocio">Elegí el tipo de cuenta que necesitás</p>

      <div className="tipos-cuenta-negocio">
        <button
          type="button"
          className="tipo-cuenta-negocio"
          onClick={() => navigate("/registrarse")}
        >
          Persona
        </button>
        <button
          type="button"
          className="tipo-cuenta-negocio tipo-cuenta-negocio-activo"
        >
          Negocio
        </button>
      </div>

      <form className="formulario-negocio" onSubmit={(e) => e.preventDefault()}>
        <label className="etiqueta-negocio" htmlFor="comercio">
          Nombre del comercio
        </label>
        <input
          className="campo-negocio"
          id="comercio"
          name="comercio"
          type="text"
          placeholder="Ej: Panadería Norte"
        />

        {/* Solo un campo de texto: por ahora no resuelve la ubicación real. */}
        <label className="etiqueta-negocio" htmlFor="direccion">
          Dirección
        </label>
        <input
          className="campo-negocio"
          id="direccion"
          name="direccion"
          type="text"
          placeholder="Ej: Av. Cabildo 2140"
          autoComplete="street-address"
        />

        <label className="etiqueta-negocio" htmlFor="rubro">
          Rubro
        </label>
        <select className="campo-negocio select-negocio" id="rubro" name="rubro">
          {RUBROS.map((rubro) => (
            <option key={rubro} value={rubro}>
              {rubro}
            </option>
          ))}
        </select>

        <span className="etiqueta-negocio">Logo del comercio</span>
        <label className="subir-logo" htmlFor="logo">
          <span className="subir-logo-texto">
            {nombreLogo ?? "Subir logo"}
          </span>
          <input
            className="subir-logo-input"
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            onChange={(e) => setNombreLogo(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <hr className="separador-negocio" />

        <h2 className="titulo-horarios">Horarios de atención</h2>

        <div className="lista-horarios">
          {horarios.map((horario, indice) => (
            <div className="fila-horario" key={horario.dia}>
              <span className="dia-horario">{horario.dia}</span>

              <label className="abierto-horario">
                <input
                  type="checkbox"
                  className="casilla-abierto"
                  checked={horario.abierto}
                  onChange={(e) =>
                    actualizarHorario(indice, { abierto: e.target.checked })
                  }
                />
                Abierto
              </label>

              <input
                className="campo-hora"
                type="time"
                value={horario.desde}
                disabled={!horario.abierto}
                aria-label={`${horario.dia}: abre a las`}
                onChange={(e) =>
                  actualizarHorario(indice, { desde: e.target.value })
                }
              />
              <span className="separador-hora">a</span>
              <input
                className="campo-hora"
                type="time"
                value={horario.hasta}
                disabled={!horario.abierto}
                aria-label={`${horario.dia}: cierra a las`}
                onChange={(e) =>
                  actualizarHorario(indice, { hasta: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <label className="etiqueta-negocio" htmlFor="email-negocio">
          Email
        </label>
        <input
          className="campo-negocio"
          id="email-negocio"
          name="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
        />

        <label className="etiqueta-negocio" htmlFor="password-negocio">
          Contraseña
        </label>
        <input
          className="campo-negocio"
          id="password-negocio"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <button type="submit" className="btn-crear-negocio">
          Crear cuenta
        </button>
      </form>

      <p className="texto-iniciar-negocio">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="link-iniciar-negocio">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
