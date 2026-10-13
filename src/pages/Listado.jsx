import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { money, dateKey } from '../utils';
import ProductMedia from '../components/ProductMedia';
import CatalogStatus from '../components/CatalogStatus';
import { agruparCategorias } from '../lib/categorias';
import lionHead from '../assets/lion-head.png';

// Sin tildes ni mayúsculas, para que "camara" encuentre "Cámaras".
const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Todos los días entre dos fechas 'YYYY-MM-DD' (inclusive).
function keysBetween(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const cursor = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  const keys = [];
  while (cursor <= end) {
    keys.push(dateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export default function Listado() {
  const navigate = useNavigate();
  const { cat = 'todas' } = useParams();
  const { mode, categories, products, catLabel, blocked } = useApp();
  const [q, setQ] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const term = norm(q.trim());
  // Si se escribe algo en el buscador, se busca en TODO el catálogo;
  // si no, se muestra la categoría elegida.
  let items = term
    ? products.filter((p) => norm(`${p.name} ${p.sub} ${catLabel(p.cat)}`).includes(term))
    : products.filter((p) => cat === 'todas' || p.cat === cat);

  // Filtro "disponible en estas fechas": saca los equipos con algún día bloqueado en el rango.
  const rangoOk = desde && (!hasta || hasta >= desde);
  if (desde) {
    const keys = keysBetween(desde, rangoOk && hasta ? hasta : desde);
    items = items.filter((p) => {
      const bloq = new Set(blocked[p.id] || []);
      return !keys.some((k) => bloq.has(k));
    });
  }
  const filtrando = !!term || !!desde;
  function limpiarFiltros() { setQ(''); setDesde(''); setHasta(''); }

  return (
    <main className="view active">
      <div className="listado-layout">
        <aside className="sidebar">
          <h4>Categorías</h4>
          <div>
            {agruparCategorias(categories).map((g) => (
              <div key={g.titulo || 'todas'}>
                {g.titulo && <div className="sidebar-group-title">{g.titulo}</div>}
                {g.items.map((c) => (
                  <div key={c.id} className={`sidebar-item${c.id === cat ? ' active' : ''}`} onClick={() => navigate(`/listado/${c.id}`)}>
                    {c.icon ? c.icon + ' ' : ''}{c.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
        <div className="listado-main">
          <div className="listado-head">
            <h2>{term ? `Resultados para “${q.trim()}”` : cat === 'todas' ? 'Listado de equipos' : catLabel(cat)}</h2>
            <div className="muted">{items.length} {items.length === 1 ? 'producto' : 'productos'}</div>
            {mode === 'admin' && (
              <button className="btn btn-sm btn-gradient" onClick={() => navigate('/admin/productos/nuevo')}>+ Nuevo producto</button>
            )}
          </div>
          <div className="listado-filters">
            <div className="listado-search">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar equipo: cámara, lente, trípode…"
                aria-label="Buscar equipo"
              />
            </div>
            <div className="listado-dates">
              <label>Disponible desde
                <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); if (hasta && e.target.value > hasta) setHasta(''); }} />
              </label>
              <label>hasta
                <input type="date" value={hasta} min={desde || undefined} disabled={!desde} onChange={(e) => setHasta(e.target.value)} />
              </label>
              {filtrando && <button type="button" className="listado-clear" onClick={limpiarFiltros}>Limpiar</button>}
            </div>
          </div>
          <CatalogStatus />
          {filtrando && items.length === 0 && products.length > 0 && (
            <div className="state-box" style={{ marginTop: 30 }}>
              <h3>No encontramos equipos con ese filtro</h3>
              <p>{desde ? 'Puede que estén reservados en esas fechas. Probá con otro rango o buscá otro equipo.' : 'Probá con otra palabra, por ejemplo “cámara” o “lente”.'}</p>
              <button className="btn btn-outline" onClick={limpiarFiltros}>Limpiar filtros</button>
            </div>
          )}
          <div className="grid">
            {items.map((p) => {
              const priceHtml = p.badge === 'promo' && p.originalPriceNum != null
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
