import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import lionLogoColor from '../assets/lion-logo-color.png';

export default function Alta() {
  const navigate = useNavigate();
  const {
    clienteRegistrado, clienteData, registrarCliente, editarRegistro,
    pendingReturnProductId, setPendingReturnProductId, showToast,
  } = useApp();

  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', tel: '', dir: '', mail: '' });
  const [terms, setTerms] = useState(false);

  // Solo números, sin puntos ni espacios ni letras — y con una cantidad fija
  // de dígitos, así los datos quedan siempre parejos en la ficha de Gaby.
  function onlyDigits(value, maxLen) {
    return value.replace(/\D/g, '').slice(0, maxLen);
  }

  async function submit() {
    if (!terms) { showToast('Tenés que aceptar las bases y condiciones'); return; }
    if (!form.nombre.trim() || !form.dni.trim()) { showToast('Completá al menos nombre y DNI'); return; }
    if (!/^\d{8}$/.test(form.dni.trim())) { showToast('El DNI tiene que tener 8 números, sin puntos ni letras'); return; }
    if (form.tel.trim() && !/^\d{10}$/.test(form.tel.trim())) { showToast('El teléfono tiene que tener 10 números, sin espacios ni caracteres'); return; }
    await registrarCliente({ ...form, nombre: form.nombre.trim(), dni: form.dni.trim() });
    showToast('¡Listo! Ya podés alquilar sin volver a registrarte 🎬');
    if (pendingReturnProductId) {
      const pid = pendingReturnProductId;
      setPendingReturnProductId(null);
      navigate(`/producto/${pid}`);
    }
  }

  if (clienteRegistrado && clienteData) {
    const c = clienteData;
    return (
      <main className="view active">
        <div className="alta-page-shell">
          <div className="side-watermark"><img src={lionLogoColor} alt="" /></div>
          <div className="alta-inner">
            <h1>Alta de clientes</h1>
            <p className="alta-sub">Ya estás registrado — no hace falta cargar tus datos de nuevo para alquilar.</p>
            <div className="alta-confirm">
              <h3>✅ {c.nombre} {c.apellido}</h3>
              <div className="alta-confirm-meta">
                <span>DNI <b>{c.dni}</b></span>
                <span>Tel <b>{c.tel || '—'}</b></span>
                <span>Email <b>{c.mail || '—'}</b></span>
                <span>Dirección <b>{c.dir || '—'}</b></span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={editarRegistro}>Editar mis datos</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="view active">
      <div className="alta-page-shell">
        <div className="side-watermark"><img src={lionLogoColor} alt="" /></div>
        <div className="alta-inner">
          <h1>Alta de clientes</h1>
          <p className="alta-sub">Bases y condiciones + registro. Se completa una sola vez — después ya podés alquilar sin volver a cargar tus datos.</p>
          <div className="terms-box">
            <p><b>Bases y condiciones de alquiler — Lion Films.</b> El equipo se entrega en el estado indicado en la ficha técnica y debe devolverse en las mismas condiciones. Cualquier daño o faltante se conversa y se cotiza por fuera de la app.</p>
            <p>La reserva no queda confirmada hasta que Gaby la confirma por WhatsApp o mail luego de recibir el pedido. Las fechas se liberan automáticamente si la reserva no se concreta.</p>
            <p>Los precios son de referencia y pueden tener descuento por semana, por mes, o para estudiantes de carreras audiovisuales — se confirma en la cotización.</p>
          </div>
          <div className="field-row">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Gastón" /></div>
            <div className="field"><label>Apellido</label><input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Pérez" /></div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>DNI</label>
              <input value={form.dni} onChange={(e) => setForm({ ...form, dni: onlyDigits(e.target.value, 8) })} placeholder="34511209" inputMode="numeric" maxLength={8} />
              <p className="ficha-note" style={{ marginBottom: 0 }}>8 números, sin puntos.</p>
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input value={form.tel} onChange={(e) => setForm({ ...form, tel: onlyDigits(e.target.value, 10) })} placeholder="1134143116" inputMode="numeric" maxLength={10} />
              <p className="ficha-note" style={{ marginBottom: 0 }}>10 números, sin espacios ni guiones.</p>
            </div>
          </div>
          <div className="field-row">
            <div className="field"><label>Dirección</label><input value={form.dir} onChange={(e) => setForm({ ...form, dir: e.target.value })} placeholder="Av. Corrientes 1234, CABA" /></div>
          </div>
          <div className="field-row">
            <div className="field"><label>Email</label><input value={form.mail} onChange={(e) => setForm({ ...form, mail: e.target.value })} placeholder="vos@mail.com" /></div>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="a-terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <label htmlFor="a-terms">Leí y acepto las bases y condiciones de alquiler de Lion Films.</label>
          </div>
          <button className="btn btn-navy btn-block" onClick={submit}>Registrarme y continuar</button>
        </div>
      </div>
    </main>
  );
}
