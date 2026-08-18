import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PRODUCTS, catLabel } from '../data/catalog';
import { fmtKey, money } from '../utils';
import Calendar from '../components/Calendar';
import ProductMedia from '../components/ProductMedia';
import lionHead from '../assets/lion-head.png';

export default function Producto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const p = PRODUCTS.find((x) => x.id === Number(id));
  const {
    clienteRegistrado, addToCart, blocked, showToast,
    setPendingReturnProductId, savedCalState, setSavedCalState,
  } = useApp();

  const preserved = savedCalState && savedCalState.productId === p.id ? savedCalState : null;
  const [from, setFrom] = useState(preserved?.from ?? null);
  const [to, setTo] = useState(preserved?.to ?? null);
  const [qty, setQty] = useState(1);

  if (preserved) setSavedCalState(null);

  if (!p) return <main className="view active"><div className="container"><p>Producto no encontrado.</p></div></main>;

  const blockedKeys = blocked[p.id] || [];

  function pickDate(key) {
    const blockedSet = new Set(blockedKeys);
    if (!from || (from && to)) {
      setFrom(key); setTo(null);
    } else if (key < from) {
      setFrom(key); setTo(null);
    } else {
      let hasBlocked = false;
      const [fy, fm, fd] = from.split('-').map(Number);
      const [ty, tm, td] = key.split('-').map(Number);
      let cursor = new Date(fy, fm - 1, fd + 1);
      const end = new Date(ty, tm - 1, td);
      while (cursor < end) {
        const k = `${cursor.getFullYear()}-${(cursor.getMonth() + 1).toString().padStart(2, '0')}-${cursor.getDate().toString().padStart(2, '0')}`;
        if (blockedSet.has(k)) hasBlocked = true;
        cursor.setDate(cursor.getDate() + 1);
      }
      if (hasBlocked) {
        showToast('Hay días ya reservados en ese rango');
        setFrom(key); setTo(null);
      } else {
        setTo(key);
      }
    }
  }

  function irARegistrarme() {
    setPendingReturnProductId(p.id);
    setSavedCalState({ productId: p.id, from, to });
    showToast('Completá tus datos para poder alquilar');
    navigate('/alta');
  }

  function handleAdd() {
    if (!clienteRegistrado) { irARegistrarme(); return; }
    if (!from || !to) { showToast('Elegí las fechas del alquiler'); return; }
    addToCart({ productId: p.id, qty, from, to });
    showToast('Agregado al pedido 🎬 — seguí eligiendo o abrí el carrito cuando quieras enviarlo');
  }

  const priceHtml = p.badge === 'promo'
    ? <><span className="strike">{money(p.originalPriceNum)}</span>{p.price}</>
    : p.price;

  let rangeLabel = 'Elegí el día de retiro y el de devolución.';
  let btnLabel = 'Elegí las fechas primero';
  let btnDisabled = true;
  if (from && to) {
    rangeLabel = <>Retirás el <b>{fmtKey(from)}</b> y devolvés el <b>{fmtKey(to)}</b>.</>;
    btnDisabled = false;
    btnLabel = clienteRegistrado ? 'Agregar al pedido' : 'Registrate para alquilar';
  } else if (from) {
    rangeLabel = <>Retiro: <b>{fmtKey(from)}</b>. Ahora elegí el día de devolución.</>;
    btnLabel = 'Elegí la fecha de devolución';
  }

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate(`/listado/${p.cat}`)}>← Volver al listado</a>
      <div className="product-top">
        <div className="product-media">
          <div className="tile-badge-logo" style={{ position: 'absolute', top: 14, left: 14 }}><img src={lionHead} alt="" /></div>
          {p.badge === 'promo' && <span className="ribbon ribbon-promo">Promo</span>}
          {p.badge === 'consultar' && <span className="ribbon ribbon-consultar">Consultar</span>}
          <ProductMedia product={p} />
        </div>
        <div className="product-info">
          <div className="product-cat">{catLabel(p.cat)}</div>
          <h1>{p.name}</h1>
          <div className="product-price">{priceHtml}</div>
          <ul className="product-bullets">
            <li>Valores de alquiler por jornada, en pesos argentinos.</li>
            <li>Precio con descuento por semana y por mes — consultá por WhatsApp.</li>
            <li>Descuentos especiales para estudiantes de carreras audiovisuales.</li>
            <li><b>{p.sub}</b></li>
          </ul>
        </div>
      </div>
      <div className="product-body">
        <div className="product-desc">
          <h3>Descripción</h3>
          <p>{p.sub}. Equipo revisado y testeado antes de cada entrega — coordinamos con vos el retiro y la devolución una vez confirmada la reserva.</p>
          <h3 style={{ marginTop: 26 }}>Ficha técnica</h3>
          <ul className="product-bullets">
            {p.specs.map((s) => <li key={s[0]}><b>{s[0]}:</b> {s[1]}</li>)}
          </ul>
        </div>
        <div className="booking-card">
          <h4>Disponibilidad</h4>
          {!clienteRegistrado && (
            <div className="gate-notice">
              <p>🔒 Para poder alquilar necesitás completar tu registro (una sola vez).</p>
              <button className="btn btn-navy btn-sm btn-block" onClick={irARegistrarme}>Registrarme ahora</button>
            </div>
          )}
          <Calendar mode="select" blockedKeys={blockedKeys} from={from} to={to} onPick={pickDate} />
          <div className="cal-legend">
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--success)' }}></span>Disponible</div>
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--danger)' }}></span>Ya reservado</div>
            <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'linear-gradient(120deg,var(--accent-orange),var(--accent-pink))' }}></span>Tu selección</div>
          </div>
          <div className="cal-range-label">{rangeLabel}</div>
          <div className="qty-row">
            <span style={{ fontSize: 12.5, color: 'var(--text-mid)', fontWeight: 700 }}>Cantidad</span>
            <div className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</div>
            <span style={{ fontWeight: 800 }}>{qty}</span>
            <div className="qty-btn" onClick={() => setQty((q) => q + 1)}>+</div>
            <span className="booking-price">{p.price}</span>
          </div>
          <button className="btn btn-navy btn-block" disabled={btnDisabled} onClick={handleAdd}>{btnLabel}</button>
        </div>
      </div>
    </main>
  );
}
