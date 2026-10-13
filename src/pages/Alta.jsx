import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TERMS } from '../lib/condiciones';
import lionLogoColor from '../assets/lion-logo-color.png';

export default function Alta() {
  const navigate = useNavigate();
  const {
    clienteRegistrado, clienteData, registrarCliente, editarRegistro, reconocerClienteExistente,
    pendingReturnProductId, setPendingReturnProductId, showToast,
  } = useApp();

  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', tel: '', dir: '', mail: '' });
  const [terms, setTerms] = useState(false);
  const { hash } = useLocation();
  const [yaOpen, setYaOpen] = useState(hash === '#ya');
  const [ya, setYa] = useState({ dni: '', contacto: '' });
  const [yaLoading, setYaLoading] = useState(false);
  const [yaError, setYaError] = useState('');
  const yaRef = useRef(null);

  useEffect(() => {
    if (hash === '#ya') {
      setYaOpen(true);
      const t = setTimeout(() => yaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
      return () => clearTimeout(t);
    }
  }, [hash]);

  function volverAlProducto() {
    if (pendingReturnProductId) {
      const pid = pendingReturnProductId;
      setPendingReturnProductId(null);
      navigate(`/producto/${pid}`);
    }
  }

  async function reconocerme() {
    setYaError('');
    if (!/^\d{8}$/.test(ya.dni.trim())) { setYaError('El DNI tiene que tener 8 números, sin puntos.'); return; }
    if (!ya.contacto.trim()) { setYaError('Ingresá el teléfono o el email con el que te registraste.'); return; }
    setYaLoading(true);
    try {
      const ok = await reconocerClienteExistente(ya.dni.trim(), ya.contacto.trim());
      if (!ok) {
        setYaError('No encontramos ese registro. Revisá el DNI y el dato de contacto, o registrate como cliente nuevo más abajo.');
      } else {
        showToast('¡Te reconocimos! Ya podés alquilar 🎬');
        volverAlProducto();
      }
    } catch (err) {
      console.error('No se pudo verificar el cliente', err);
      setYaError('No pudimos conectarnos para verificarlo. Probá de nuevo en unos segundos.');
    } finally {
      setYaLoading(false);
    }
  }

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
    volverAlProducto();
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
          <p className="alta-sub">Leé las bases y condiciones y completá tu registro. Se completa una sola vez — después ya podés alquilar sin volver a cargar tus datos.</p>
          <div className="ya-box" ref={yaRef}>
            <button type="button" className="ya-toggle" onClick={() => setYaOpen((o) => !o)} aria-expanded={yaOpen}>
              <span>¿Ya alquilaste antes? <b>Ingresá con tus datos</b></span>
              <span>{yaOpen ? '–' : '+'}</span>
            </button>
            {yaOpen && (
              <div className="ya-body">
                <p className="ficha-note" style={{ marginTop: 0 }}>Escribí tu DNI y el teléfono <b>o</b> el email con el que te registraste. Así no tenés que cargar todo de nuevo.</p>
                <div className="field-row">
                  <div className="field">
                    <label>DNI</label>
                    <input value={ya.dni} onChange={(e) => setYa({ ...ya, dni: onlyDigits(e.target.value, 8) })} placeholder="30123456" inputMode="numeric" maxLength={8} />
                  </div>
                  <div className="field">
                    <label>Teléfono o email</label>
                    <input value={ya.contacto} onChange={(e) => setYa({ ...ya, contacto: e.target.value })} placeholder="1122334455 o vos@mail.com" onKeyDown={(e) => { if (e.key === 'Enter') reconocerme(); }} />
                  </div>
                </div>
                {yaError && <p className="ya-error" role="alert">{yaError}</p>}
                <button type="button" className="btn btn-gradient btn-sm" onClick={reconocerme} disabled={yaLoading}>{yaLoading ? 'Verificando…' : 'Reconocerme'}</button>
              </div>
            )}
          </div>
          <div className="terms-box terms-scroll" tabIndex={0}>
            {TERMS.map(([t, b], i) => (
              <div key={t}>
                <h5>{String(i + 1).padStart(2, '0')}. {t}</h5>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <p className="ficha-note">
            También podés leerlas en <Link className="terms-link" to="/como-alquilar#condiciones" target="_blank">Cómo alquilar</Link>.
          </p>
          <div className="field-row">
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Gastón" /></div>
            <div className="field"><label>Apellido</label><input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Pérez" /></div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>DNI</label>
              <input value={form.dni} onChange={(e) => setForm({ ...form, dni: onlyDigits(e.target.value, 8) })} placeholder="30123456" inputMode="numeric" maxLength={8} />
              <p className="ficha-note" style={{ marginBottom: 0 }}>8 números, sin puntos.</p>
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input value={form.tel} onChange={(e) => setForm({ ...form, tel: onlyDigits(e.target.value, 10) })} placeholder="1122334455" inputMode="numeric" maxLength={10} />
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
            <label htmlFor="a-terms">Leí y acepto las <Link className="terms-link" to="/como-alquilar#condiciones" target="_blank">bases y condiciones de alquiler</Link> de Lion Films.</label>
          </div>
          <button className="btn btn-navy btn-block" onClick={submit}>Registrarme y continuar</button>
        </div>
      </div>
    </main>
  );
}
