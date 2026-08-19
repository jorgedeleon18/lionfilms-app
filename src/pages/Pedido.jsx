import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmtKey, rentalDays, money, STATUS_LABEL } from '../utils';

export default function Pedido() {
  const navigate = useNavigate();
  const { cart, clienteActualDni, reservations, setDrawerOpen, getProduct, catLabel } = useApp();

  let total = 0;
  const rows = cart.map((item) => {
    const p = getProduct(item.productId);
    const days = rentalDays(item.from, item.to);
    const subtotal = p.priceNum * item.qty * days;
    total += subtotal;
    return { item, p, days, subtotal };
  });

  const misReservas = clienteActualDni ? reservations.filter((r) => r.cliente.dni === clienteActualDni) : [];

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate('/')}>← Volver al catálogo</a>
      <div className="alta-wrap">
        <div className="listado-head" style={{ marginTop: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Mi pedido</h2>
          <div className="muted">{cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}</div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">Todavía no agregaste nada.<br />Volvé al listado y elegí el equipo que necesitás.</div>
        ) : (
          <>
            <div>
              {rows.map(({ item, p, days, subtotal }, idx) => (
                <div className="order-item" key={idx}>
                  <div className="thumb">{p.icon}</div>
                  <div className="info">
                    <div className="cat">{catLabel(p.cat)}</div>
                    <h4>{p.name} {item.qty > 1 ? `× ${item.qty}` : ''}</h4>
                    <div className="dates">
                      <div>Retiro<b>{fmtKey(item.from)}</b></div>
                      <div>Devolución<b>{fmtKey(item.to)}</b></div>
                      <div>Días<b>{days}</b></div>
                    </div>
                  </div>
                  <div className="cost">
                    <div className="subtotal">{money(subtotal)}</div>
                    <div className="breakdown">{p.price} × {days}d{item.qty > 1 ? ` × ${item.qty}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div>
                <div className="order-total-label">Total estimado</div>
                <div className="muted" style={{ fontSize: 11 }}>Precios de referencia, Gaby confirma el total final</div>
              </div>
              <div className="order-total-amount">{money(total)}</div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-navy btn-block" onClick={() => setDrawerOpen(true)}>Ir al carrito para enviarlo a Gaby</button>
            </div>
          </>
        )}

        {misReservas.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div className="divider" />
            <div className="listado-head" style={{ marginTop: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Tus pedidos enviados</h2>
              <div className="muted">Gaby los va a confirmar o avisarte si no puede</div>
            </div>
            <p className="cal-admin-note">Esto simula lo que verías si ya estuvieras identificado con tu cuenta.</p>
            <div>
              {misReservas.map((r) => r.items.map((item, i) => {
                const p = getProduct(item.productId);
                return (
                  <div className="order-history-item" key={r.id + '-' + i}>
                    <div className="thumb">{p.icon}</div>
                    <div className="info">
                      <b>{p.name} {item.qty > 1 ? `× ${item.qty}` : ''}</b>
                      <span>{fmtKey(item.from)} → {fmtKey(item.to)}</span>
                    </div>
                    <span className={`status-pill status-${item.status}`}>{STATUS_LABEL[item.status]}</span>
                  </div>
                );
              }))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
