import logoSvg from "../assets/logo.svg";

export default function Logo() {
  return (
    <img
      src={logoSvg}
      alt="Sumatoria"
      style={{ width: "146px", height: "30px", objectFit: "contain" }}
    />
  );
}