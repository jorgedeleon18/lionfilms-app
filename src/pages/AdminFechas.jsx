import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Calendar from '../components/Calendar';
import ProductMedia from '../components/ProductMedia';

export default function AdminFechas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { blocked, toggleBlock, showToast, gabySession, products, catalogLoading } = useApp();
  const p = products.find((x) => x.id === Number(id));

  if (!gabySession) {
    return (
      <main className="view active">
        <div className="container">
          <p>Esta página es solo para Gaby. Iniciá sesión desde el botón "Gaby" arriba a la derecha.</p>
          <a className="back-link" onClick={() => navigate('/')}>← Volver al inicio</a>
        </div>
      </main>
    );
  }

  if (!p) return <main className="view active"><div className="container"><p>{catalogLoading ? 'Cargando…' : 'Producto no encontrado.'}</p></div></main>;

  const blockedKeys = blocked[p.id] || [];

  function handleToggle(key) {
    const wasBlocked = blockedKeys.includes(key);
    toggleBlock(p.id, key);
    showToast(wasBlocked ? 'Día liberado ✅' : 'Día bloqueado 🔒');
  }

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate(`/listado/${p.cat}`)}>← Volver al listado</a>
      <div className="product-top">
        <div className="product-media"><ProductMedia product={p} /></div>
        <div className="product-info">
          <div className="product-cat">Panel de Gaby</div>
          <h1>Disponibilidad — {p.name}</h1>
        </div>
      </div>
      <div className="product-body">
        <div className="product-desc">
          <p className="cal-admin-note">Así arranca la página: todos los días en verde. Cuando cerrás un alquiler por fuera de la app, tocá esos días acá para bloquearlos (se ponen en rojo) y dejan de estar disponibles. Tocá de nuevo un día rojo para liberarlo.</p>
        </div>
        <div className="booking-card">
          <h4>Calendario de bloqueo</h4>
          <Calendar mode="manage" blockedKeys={blockedKeys} onToggleBlock={handleToggle} />
          <div className="cal-legend">
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--success)' }}></span>Disponible</div>
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--danger)' }}></span>Bloqueado</div>
          </div>
          <button className="btn btn-navy btn-block" style={{ marginTop: 16 }} onClick={() => navigate(`/listado/${p.cat}`)}>Listo</button>
        </div>
      </div>
    </main>
  );
}
