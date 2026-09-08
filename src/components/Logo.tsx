import logoImg from "./logo.png";

export default function Logo() {
  return (
    <img
      src={logoImg}
      alt="Sumatoria"
      style={{

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
