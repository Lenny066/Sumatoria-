import logoImg from "./logo.png";

export default function Logo() {
  return (
    <img
      src={logoImg}
      alt="Sumatoria"
      style={{ 
        width: "22.5rem",       
        height: "auto",        
        objectFit: "contain",
        display: "block",
        margin: "0 auto",
        marginTop: "3rem"        
      }}
    />
  );
}