import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ITEMS = [
  { icon: '➕', title: 'Nuevo producto', desc: 'Cargar un equipo nuevo al catálogo, con foto y ficha técnica.', to: '/admin/productos/nuevo' },
  { icon: '🗂️', title: 'Catálogo', desc: 'Categorías, combos y los productos que ya están cargados.', to: '/admin/catalogo' },
  { icon: '📋', title: 'Listado de equipos', desc: 'Editar, borrar o gestionar las fechas bloqueadas de cada producto.', to: '/listado/todas' },
  { icon: '📇', title: 'Fichas y pedidos', desc: 'Reservas de clientes: pendientes, confirmadas y su historial.', to: '/fichas', showPending: true },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { gabySession, pendingCount, logoutGaby } = useApp();

  if (!gabySession) {
    return (
      <main className="view active">
        <div className="container">
          <p>Esta página es solo para Gaby. Iniciá sesión desde el link "Acceso del equipo" abajo del sitio.</p>
          <a className="back-link" onClick={() => navigate('/')}>← Volver al inicio</a>
        </div>
      </main>
    );
  }

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate('/')}>← Volver al inicio</a>
      <div className="alta-wrap" style={{ maxWidth: 780 }}>
        <div className="listado-head" style={{ marginTop: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>🛠️ Panel de Gaby</h2>
          <div className="muted">Todo lo que necesitás para manejar el catálogo y los pedidos, en un solo lugar.</div>
        </div>

        <div className="staff-grid">
          {ITEMS.map((it) => (
            <div key={it.to} className="staff-card" onClick={() => navigate(it.to)}>
              <div className="staff-card-icon">{it.icon}</div>
              <div className="staff-card-body">
                <h4>
                  {it.title}
                  {it.showPending && pendingCount > 0 && <span className="staff-pending">{pendingCount}</span>}
                </h4>
                <p>{it.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 30 }} onClick={logoutGaby}>Cerrar sesión del equipo</button>
      </div>
    </main>
  );
}
