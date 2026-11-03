import './cargandomonto.css';

type CargandoMontoProps = {
  clara?: boolean;
  ancho?: string;
  alto?: string;
};

export default function CargandoMonto({ clara = false, ancho = '6.5rem', alto = '1em' }: CargandoMontoProps) {
  return (
    <span
      className={`cargando-monto${clara ? ' cargando-monto--clara' : ''}`}
      style={{ width: ancho, height: alto }}
      role="status"
      aria-label="Cargando"
    />
  );
}
