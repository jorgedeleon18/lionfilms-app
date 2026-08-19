import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fmtKey, rentalDays, money, STATUS_LABEL } from '../utils';

function clientesAgrupados(reservations) {
  const byDni = {};
  reservations.forEach((r) => {
    const key = r.cliente.dni;
    if (!byDni[key]) byDni[key] = { cliente: r.cliente, reservas: [] };
    r.items.forEach((item, itemIdx) => byDni[key].reservas.push({ reservaId: r.id, itemIdx, item }));
  });
  return byDni;
}

export default function Fichas() {
  const navigate = useNavigate();
  const { reservations, marcarEstado, gabySession, getProduct } = useApp();
  const [tab, setTab] = useState('pedidos');
  const [search, setSearch] = useState('');

  const byDni = useMemo(() => clientesAgrupados(reservations), [reservations]);

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

  function confirmarEntregado(reservaId, itemIdx) {
    const r = reservations.find((x) => x.id === reservaId);
    const item = r.items[itemIdx];
    const p = getProduct(item.productId);
    const ok = window.confirm(`¿Confirmás que le entregaste "${p.name}" a ${r.cliente.nombre} ${r.cliente.apellido}?\n\nSe van a bloquear los días ${fmtKey(item.from)} → ${fmtKey(item.to)} para que no los pueda reservar otro cliente.`);
    if (!ok) return;
    marcarEstado(reservaId, itemIdx, 'entregado');
  }
  function confirmarNoDisponible(reservaId, itemIdx) {
    const r = reservations.find((x) => x.id === reservaId);
    const item = r.items[itemIdx];
    const p = getProduct(item.productId);
    const ok = window.confirm(`¿Marcar "${p.name}" como no disponible para ${r.cliente.nombre} ${r.cliente.apellido}?\n\nNo se bloquea ninguna fecha. Después contactalo por WhatsApp o mail para que elija otra fecha desde la web.`);
    if (!ok) return;
    marcarEstado(reservaId, itemIdx, 'no_disponible');
  }

  const grupos = Object.values(byDni).filter((g) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    const c = g.cliente;
    return (c.nombre + ' ' + c.apellido).toLowerCase().includes(term) || (c.dni || '').toLowerCase().includes(term);
  });

  return (
    <main className="view active">
      <a className="back-link" onClick={() => navigate('/')}>← Volver al catálogo</a>
      <div className="alta-wrap" style={{ maxWidth: 900 }}>
        <div className="listado-head" style={{ marginTop: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>📇 Fichas de clientes</h2>
          <div className="muted">
            {tab === 'pedidos'
              ? `${reservations.length} ${reservations.length === 1 ? 'pedido' : 'pedidos'}`
              : `${Object.values(byDni).length} ${Object.values(byDni).length === 1 ? 'cliente registrado' : 'clientes registrados'}`}
          </div>
        </div>

        <div className="fichas-tabs">
          <div className={`fichas-tab${tab === 'pedidos' ? ' active' : ''}`} onClick={() => setTab('pedidos')}>Pedidos</div>
          <div className={`fichas-tab${tab === 'clientes' ? ' active' : ''}`} onClick={() => setTab('clientes')}>Clientes registrados</div>
        </div>

        {tab === 'pedidos' ? (
          <div>
            <p className="cal-admin-note">Mientras un pedido está <b style={{ color: 'var(--warn)' }}>pendiente</b>, la fecha sigue disponible para otros. Cuando coordinás la entrega, tocá <b style={{ color: 'var(--success)' }}>Entregado</b> — recién ahí se bloquea esa fecha. Si no le podés dar el equipo, tocá <b style={{ color: 'var(--danger)' }}>No disponible</b>.</p>
            {reservations.length === 0 ? (
              <div className="empty-cart">Todavía no llegó ningún pedido.</div>
            ) : (
              Object.values(byDni).map((group) => {
                const c = group.cliente;
                return (
                  <div className="ficha-card" key={c.dni}>
                    <div className="ficha-card-head">
                      <div>
                        <p className="ficha-name">{c.nombre} {c.apellido}</p>
                        <div className="ficha-meta">
                          <span>DNI <b>{c.dni}</b></span>
                          <span>Tel <b>{c.tel || '—'}</b></span>
                          <span>Email <b>{c.mail || '—'}</b></span>
                          <span>Dirección <b>{c.dir || '—'}</b></span>
                        </div>
                      </div>
                    </div>
                    {group.reservas.map(({ reservaId, itemIdx, item }) => {
                      const p = getProduct(item.productId);
                      const days = rentalDays(item.from, item.to);
                      const isPendiente = item.status === 'pendiente';
                      return (
                        <div className="ficha-reserva" key={reservaId + '-' + itemIdx}>
                          <div className="thumb">{p.icon}</div>
                          <div className="r-info">
                            <b>{p.name} {item.qty > 1 ? `× ${item.qty}` : ''}</b>
                            <span>{fmtKey(item.from)} → {fmtKey(item.to)} · {days}d · {money(p.priceNum * item.qty * days)}</span>
                          </div>
                          <span className={`status-pill status-${item.status}`}>{STATUS_LABEL[item.status]}</span>
                          {isPendiente && (
                            <>
                              <button className="btn btn-sm btn-navy" onClick={() => confirmarEntregado(reservaId, itemIdx)}>Entregado</button>
                              <button className="btn btn-sm btn-ghost" onClick={() => confirmarNoDisponible(reservaId, itemIdx)}>No disponible</button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div>
            <input className="fichas-search" type="text" placeholder="Buscar por nombre, apellido o DNI…" value={search} onChange={(e) => setSearch(e.target.value)} />
            {grupos.length === 0 ? (
              <div className="empty-cart">{reservations.length === 0 ? 'Todavía no hay clientes registrados.' : 'No encontramos ningún cliente con ese nombre o DNI.'}</div>
            ) : (
              grupos.map((g) => {
                const c = g.cliente;
                const entregados = g.reservas.filter((x) => x.item.status === 'entregado').length;
                const pendientes = g.reservas.filter((x) => x.item.status === 'pendiente').length;
                return (
                  <div className="ficha-card" key={c.dni}>
                    <div className="ficha-card-head" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                      <div>
                        <p className="ficha-name">{c.nombre} {c.apellido}</p>
                        <div className="ficha-meta">
                          <span>DNI <b>{c.dni}</b></span>
                          <span>Tel <b>{c.tel || '—'}</b></span>
                          <span>Email <b>{c.mail || '—'}</b></span>
                          <span>Dirección <b>{c.dir || '—'}</b></span>
                        </div>
                        <div className="cliente-summary">
                          <span><b>{g.reservas.length}</b> pedido{g.reservas.length === 1 ? '' : 's'} en total</span>
                          <span><b>{entregados}</b> entregado{entregados === 1 ? '' : 's'}</span>
                          <span><b>{pendientes}</b> pendiente{pendientes === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}
