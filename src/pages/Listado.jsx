import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { money } from '../utils';
import ProductMedia from '../components/ProductMedia';
import lionHead from '../assets/lion-head.png';

export default function Listado() {
  const navigate = useNavigate();
  const { cat = 'todas' } = useParams();
  const { mode, categories, products, catLabel } = useApp();
  const items = products.filter((p) => cat === 'todas' || p.cat === cat);

  return (
    <main className="view active">
      <div className="listado-layout">
        <aside className="sidebar">
          <h4>Categorías</h4>
          <div>
            {categories.map((c) => (
              <div key={c.id} className={`sidebar-item${c.id === cat ? ' active' : ''}`} onClick={() => navigate(`/listado/${c.id}`)}>
                {c.icon ? c.icon + ' ' : ''}{c.label}
              </div>
            ))}
          </div>
        </aside>
        <div className="listado-main">
          <div className="listado-head">
            <h2>{cat === 'todas' ? 'Listado de equipos' : catLabel(cat)}</h2>
            <div className="muted">{items.length} {items.length === 1 ? 'producto' : 'productos'}</div>
            {mode === 'admin' && (
              <button className="btn btn-sm btn-gradient" onClick={() => navigate('/admin/productos/nuevo')}>+ Nuevo producto</button>
            )}
          </div>
          <div className="grid">
            {items.map((p) => {
              const priceHtml = p.badge === 'promo'
                ? <><span className="strike">{money(p.originalPriceNum)}</span>{p.price}</>
                : p.price;
              return (
                <div className="card" key={p.id} onClick={() => navigate(`/producto/${p.id}`)}>
                  <div className="card-media">
                    <div className="card-badge-logo"><img src={lionHead} alt="" /></div>
                    {p.badge === 'promo' && <span className="ribbon ribbon-promo">Promo</span>}
                    {p.badge === 'consultar' && <span className="ribbon ribbon-consultar">Consultar</span>}
                    <ProductMedia product={p} />
                  </div>
                  <div className="card-cat">{catLabel(p.cat)}</div>
                  <h3 className="card-title">{p.name}</h3>
                  <div className="card-price">{priceHtml}</div>
                  {mode === 'admin' && (
                    <div className="card-admin-row">
                      <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate(`/admin/productos/${p.id}`); }}>✏️ Editar</button>
                      <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate(`/admin/fechas/${p.id}`); }}>📅 Fechas</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
