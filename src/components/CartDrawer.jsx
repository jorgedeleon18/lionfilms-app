import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmtKey, rentalDays, money } from '../utils';

export default function CartDrawer() {
  const {
    drawerOpen, setDrawerOpen, cart, removeFromCart, clearCart,
    clienteRegistrado, clienteData, registrarReserva, setClienteActualDni, showToast,
    getProduct,
  } = useApp();

  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', tel: '', dir: '', mail: '' });

  useEffect(() => {
    if (drawerOpen && clienteRegistrado && clienteData) {
      setForm({
        nombre: clienteData.nombre || '', apellido: clienteData.apellido || '', dni: clienteData.dni || '',
        tel: clienteData.tel || '', dir: clienteData.dir || '', mail: clienteData.mail || '',
      });
    }
  }, [drawerOpen, clienteRegistrado, clienteData]);

  if (!drawerOpen) return null;

  let total = 0;
  const rows = cart.map((item, idx) => {
    const p = getProduct(item.productId);
    const days = rentalDays(item.from, item.to);
    total += p.priceNum * item.qty * days;
    return { item, idx, p, days };
  });

  function buildOrderText() {
    let lines = [];
    lines.push('🎬 *Pedido de alquiler — Lion Films*');
    lines.push('');
    lines.push('*Cliente:* ' + (form.nombre || '—') + ' ' + (form.apellido || ''));
    lines.push('*DNI:* ' + (form.dni || '—'));
    lines.push('*Teléfono:* ' + (form.tel || '—'));
    lines.push('*Dirección:* ' + (form.dir || '—'));
    lines.push('*Email:* ' + (form.mail || '—'));
    lines.push('');
    lines.push('*Equipo solicitado:*');
    cart.forEach((item) => {
      const p = getProduct(item.productId);
      lines.push(`- ${p.name} x${item.qty} (${fmtKey(item.from)} → ${fmtKey(item.to)})`);
    });
    return lines.join('\n');
  }

  function sendOrder(channel) {
    if (cart.length === 0) { showToast('Agregá al menos un producto'); return; }
    const text = buildOrderText();
    const cliente = {
      nombre: form.nombre.trim() || 'Sin nombre',
      apellido: form.apellido.trim(),
      dni: form.dni.trim() || 'Sin DNI',
      tel: form.tel.trim(),
      dir: form.dir.trim(),
      mail: form.mail.trim(),
    };
    registrarReserva(cliente, cart);
    setClienteActualDni(cliente.dni);

    if (channel === 'whatsapp') {
      window.open('https://wa.me/5491136239892?text=' + encodeURIComponent(text), '_blank');
    } else {
      const subject = encodeURIComponent('Pedido de alquiler — Lion Films');
      const body = encodeURIComponent(text.replace(/\*/g, ''));
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    clearCart();
    setDrawerOpen(false);
    showToast('Pedido enviado — queda pendiente hasta que Gaby confirme la entrega');
  }

  return (
    <div className="drawer-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
      <div className="drawer">
        <h3>🛒 Tu pedido</h3>
        <div>
          {cart.length === 0 ? (
            <div className="empty-cart">Todavía no agregaste nada.<br />Elegí equipo en el listado →</div>
          ) : (
            rows.map(({ item, idx, p, days }) => (
              <div className="cart-item" key={idx}>
                <div className="thumb">{p.icon}</div>
                <div className="info">
                  <b>{p.name} {item.qty > 1 ? `x${item.qty}` : ''}</b>
                  <span>{fmtKey(item.from)} → {fmtKey(item.to)} · {days}d</span>
                </div>
                <div className="remove" onClick={() => removeFromCart(idx)}>Quitar</div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <>
            <div className="order-total" style={{ marginBottom: 4 }}>
              <div>
                <div className="order-total-label">Valor estimado</div>
                <div className="muted" style={{ fontSize: 11 }}>Gaby confirma el total final</div>
              </div>
              <div className="order-total-amount" style={{ fontSize: 18 }}>{money(total)}</div>
            </div>
            <div className="divider" />
            <div>
              {clienteRegistrado && clienteData && (
                <div className="registered-note">✅ Usando tus datos registrados ({clienteData.nombre} {clienteData.apellido}). Podés editarlos si hace falta.</div>
              )}
              <div className="field-row">
                <div className="field"><label>Nombre</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Gastón" /></div>
                <div className="field"><label>Apellido</label><input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Pérez" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>DNI</label><input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} placeholder="30.123.456" /></div>
                <div className="field"><label>Teléfono</label><input value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} placeholder="11 2345 6789" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Dirección</label><input value={form.dir} onChange={(e) => setForm({ ...form, dir: e.target.value })} placeholder="Av. Corrientes 1234, CABA" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Email</label><input value={form.mail} onChange={(e) => setForm({ ...form, mail: e.target.value })} placeholder="vos@mail.com" /></div>
              </div>
              <p className="ficha-note">Estos datos + el detalle del pedido se arman en un mensaje. Gaby lo recibe y coordina la reserva y el pago por fuera de la app.</p>
              <div className="summary-actions">
                <button className="btn btn-navy btn-block" onClick={() => sendOrder('whatsapp')}>Enviar pedido por WhatsApp</button>
                <button className="btn btn-ghost btn-block" onClick={() => sendOrder('mail')}>Enviar pedido por mail</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
