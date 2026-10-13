import { useApp } from '../context/AppContext';

/* Muestra "Cargando…" o, si Supabase falló, un aviso con botón Reintentar.
   No muestra nada cuando el catálogo ya cargó. */
export default function CatalogStatus() {
  const { products, catalogLoading, catalogError, retryCatalog } = useApp();
  if (products.length > 0) return null;
  if (catalogLoading) {
    return (
      <div className="state-box" role="status">
        <div className="state-spinner" />
        <p>Cargando el catálogo…</p>
      </div>
    );
  }
  if (catalogError) {
    return (
      <div className="state-box" role="alert">
        <h3>No pudimos cargar el catálogo</h3>
        <p>Puede ser un problema de conexión momentáneo. Probá de nuevo en unos segundos.</p>
        <button className="btn btn-gradient" onClick={retryCatalog}>Reintentar</button>
      </div>
    );
  }
  return null;
}
