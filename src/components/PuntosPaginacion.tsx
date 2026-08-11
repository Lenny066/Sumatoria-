interface PuntosPaginacionProps {
  total?: number;
  activo?: number;
}

export default function PuntosPaginacion({ total = 3, activo = 0 }: PuntosPaginacionProps) {
  return (
    <div className="pagination-container">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`dot ${index === activo ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}