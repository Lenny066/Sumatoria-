import logoImg from "./logo.png";

export default function Logo() {
  return (
    <img
      src={logoImg}
      alt="Sumatoria"
      style={{
        /* Nunca más ancho que el contenedor: si se pasa, se desborda
           y deja de verse centrado. */
        width: "min(22.5rem, 100%)",
        maxWidth: "100%",
        height: "auto",
        objectFit: "contain",
        display: "block",
        alignSelf: "center",
        margin: "0 auto",
        marginTop: "3rem"
      }}
    />
  );
}
