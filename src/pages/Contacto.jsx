import lionStatue from '../assets/lion-statue.jpg';

export default function Contacto() {
  return (
    <main className="view active">
      <div className="page-shell">
        <div className="side-watermark side-watermark-statue"><img src={lionStatue} alt="" /></div>
        <div className="info-page">
          <h1>Contacto</h1>
          <a className="contact-row" href="https://wa.me/5491136239892" target="_blank" rel="noopener noreferrer">
            <div className="ic">💬</div>
            <div><b>WhatsApp</b><div className="muted" style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>Respuesta más rápida para consultas de stock y presupuestos.</div></div>
          </a>
          <a className="contact-row" href="mailto:hola@lionfilms.com">
            <div className="ic">✉️</div>
            <div><b>Email</b><div className="muted" style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>Para presupuestos formales o pedidos grandes.</div></div>
          </a>
          <div className="contact-row">
            <div className="ic">📍</div>
            <div><b>Retiro y devolución</b><div className="muted" style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>Se coordina el día y horario una vez confirmado el pedido.</div></div>
          </div>
          <div className="social-row">
            <a className="social-btn" href="https://wa.me/5491136239892" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.9.53 3.68 1.45 5.2L2 22l4.94-1.3A9.94 9.94 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.65 0-3.19-.46-4.51-1.26l-.32-.19-3 .79.8-2.92-.21-.3A8.18 8.18 0 0 1 3.8 12 8.2 8.2 0 1 1 12 20.2z" /></svg>
            </a>
            <a className="social-btn" href="https://instagram.com/lionfilms" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
